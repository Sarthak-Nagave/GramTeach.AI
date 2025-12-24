# backend/app/routes/lessons.py

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid
import traceback
import logging
import json
from os.path import basename
from pathlib import Path

from ..database.connection import get_db
from ..models.lesson import Lesson
from ..schemas import LessonCreate, LessonResponse
from ..dependencies import get_current_user

from ..services import (
    openai_service,
    stability_service,
    elevenlabs_service,
    video_engine,
    s3_service,
)

from ..services.quiz_service import generate_quiz_questions
from ..utils import text_processing, file_manager

from moviepy.editor import AudioFileClip

router = APIRouter(prefix="/lessons", tags=["Lessons"])


# ---------------------------------------------------------
# LIST LESSONS
# ---------------------------------------------------------
@router.get("/", response_model=List[LessonResponse])
def get_my_lessons(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return (
        db.query(Lesson)
        .filter(Lesson.owner_uid == current_user["uid"])
        .order_by(Lesson.id.desc())
        .all()
    )


# ---------------------------------------------------------
# CREATE LESSON
# ---------------------------------------------------------
@router.post("/create", response_model=LessonResponse)
def create_lesson(
    lesson_data: LessonCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):

    lesson = Lesson(
        owner_uid=current_user["uid"],
        title=lesson_data.title,
        topic=lesson_data.topic,
        language=lesson_data.language,
        processing_status="created",
        processing_progress=0,
        video_url=None,
        thumbnail_url=None,
        script=None,
        quiz_json=None,
        quiz_score=None,
        quiz_total=None,
        quiz_passed=None,
        processed_scenes=None,
        created_at=datetime.utcnow(),
    )

    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


# ---------------------------------------------------------
# STATUS
# ---------------------------------------------------------
@router.get("/{lesson_id}/status")
def get_processing_status(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):

    lesson = (
        db.query(Lesson)
        .filter(Lesson.id == lesson_id, Lesson.owner_uid == current_user["uid"])
        .first()
    )

    if not lesson:
        raise HTTPException(404, "Lesson not found")

    return {
        "id": lesson.id,
        "processing_status": lesson.processing_status,
        "processing_progress": lesson.processing_progress,
        "video_url": lesson.video_url,
        "thumbnail_url": lesson.thumbnail_url,
    }


# ---------------------------------------------------------
# GET LESSON — FIXED VERSION
# ---------------------------------------------------------
@router.get("/{lesson_id}", response_model=LessonResponse)
def get_lesson_by_id(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):

    lesson = (
        db.query(Lesson)
        .filter(Lesson.id == lesson_id, Lesson.owner_uid == current_user["uid"])
        .first()
    )

    if not lesson:
        raise HTTPException(404, "Lesson not found")

    # ---------------------------
    # FIX: ALWAYS RETURN STRING
    # ---------------------------
    if isinstance(lesson.processed_scenes, list) or isinstance(lesson.processed_scenes, dict):
        lesson.processed_scenes = json.dumps(lesson.processed_scenes, ensure_ascii=False)

    return lesson


# ---------------------------------------------------------
# GENERATE LESSON
# ---------------------------------------------------------
@router.post("/{lesson_id}/generate")
def generate_existing_lesson(
    lesson_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):

    lesson = (
        db.query(Lesson)
        .filter(Lesson.id == lesson_id, Lesson.owner_uid == current_user["uid"])
        .first()
    )

    if not lesson:
        raise HTTPException(404, "Lesson not found")

    if lesson.video_url and lesson.processing_status == "ready":
        return {"message": "Already generated", "lesson_id": lesson_id}

    lesson.processing_status = "queued"
    lesson.processing_progress = 1
    db.commit()

    # -------------------------------------------------
    # WORKER
    # -------------------------------------------------
    def run_generation(lesson_job_id: int):
        logging.getLogger().handlers.clear()
        logging.basicConfig(level=logging.ERROR)

        temp_files = []
        local_db = None

        try:
            from ..database.connection import SessionLocal
            local_db = SessionLocal()

            lesson_local = local_db.query(Lesson).filter(Lesson.id == lesson_job_id).first()

            if not lesson_local:
                print("[Worker] ERROR: Lesson not found")
                return

            # SCRIPT
            lesson_local.processing_status = "script"
            lesson_local.processing_progress = 10
            local_db.commit()

            script = openai_service.generate_script(
                topic=lesson_local.topic,
                language=lesson_local.language,
                num_scenes=12,
            )

            if not script:
                raise Exception("Script generation failed")

            lesson_local.script = script
            local_db.commit()

            scenes = text_processing.parse_script_to_scenes(script)
            processed_scenes = []
            total = len(scenes)

            # ASSETS
            for idx, sc in enumerate(scenes):
                uid = f"{uuid.uuid4()}-{idx}"
                narration = sc.get("narration", "")
                prompt = sc.get("visual_prompt", "")

                # AUDIO
                try:
                    audio_path = elevenlabs_service.generate_voice(
                        text=narration,
                        filename=f"audio-{uid}.mp3",
                        language=lesson_local.language,
                    )
                except:
                    audio_path = text_processing.create_silent_audio(uid)

                audio_path = str(Path(audio_path).resolve())
                temp_files.append(audio_path)

                try:
                    audio_clip = AudioFileClip(audio_path)
                    duration = float(audio_clip.duration)
                    audio_clip.close()
                except:
                    duration = 2.0

                # IMAGE
                try:
                    img_path = stability_service.generate_image(
                        prompt=prompt,
                        output_filename=f"image-{uid}.png",
                    )
                    img_path = str(Path(img_path).resolve())
                    if not Path(img_path).exists():
                        raise FileNotFoundError()
                except:
                    img_path = text_processing.create_fallback_image(uid)

                img_path = str(Path(img_path).resolve())
                temp_files.append(img_path)

                processed_scenes.append({
                    "image": img_path,
                    "audio": audio_path,
                    "subtitle": narration,
                    "duration": duration
                })

                lesson_local.processing_progress = 10 + int(((idx + 1) / total) * 40)
                lesson_local.processing_status = "assets"
                local_db.commit()

            # TIMESTAMPS
            timestamped = []
            cumulative = 0.0
            for sc in processed_scenes:
                dur = float(sc["duration"])
                start = cumulative
                end = cumulative + dur
                cumulative = end

                timestamped.append({
                    "start": round(start, 2),
                    "end": round(end, 2),
                    "subtitle": sc["subtitle"]
                })

            # Save timestamped scenes
            lesson_local.processed_scenes = json.dumps(timestamped, ensure_ascii=False)
            local_db.commit()

            # VIDEO RENDER
            lesson_local.processing_status = "rendering"
            lesson_local.processing_progress = 70
            local_db.commit()

            final_filename = f"lesson-{uuid.uuid4()}.mp4"
            video_path = video_engine.generate_video(processed_scenes, final_filename)
            temp_files.append(video_path)

            # UPLOAD VIDEO
            video_url = s3_service.upload_to_s3(video_path, basename(video_path), public=True)
            lesson_local.video_url = video_url
            local_db.commit()

            # THUMBNAIL
            first_img = processed_scenes[0]["image"]
            thumb_url = s3_service.upload_to_s3(first_img, f"thumb-{uuid.uuid4()}.png", public=True)
            lesson_local.thumbnail_url = thumb_url
            local_db.commit()

            # QUIZ
            quiz_data = generate_quiz_questions(lesson_local.topic, 4)
            lesson_local.quiz_json = json.dumps(quiz_data, ensure_ascii=False)
            local_db.commit()

            lesson_local.processing_status = "ready"
            lesson_local.processing_progress = 100
            local_db.commit()

        except Exception as e:
            print("[Worker ERROR]", e)
            if local_db:
                lesson_local = local_db.query(Lesson).get(lesson_job_id)
                if lesson_local:
                    lesson_local.processing_status = "failed"
                    lesson_local.processing_progress = 0
                    local_db.commit()
        finally:
            file_manager.cleanup_temp_files(temp_files)
            if local_db:
                local_db.close()

    background_tasks.add_task(run_generation, lesson.id)
    return {"message": "Generation started", "lesson_id": lesson.id}


# ---------------------------------------------------------
# GET QUIZ
# ---------------------------------------------------------
@router.get("/{lesson_id}/quiz")
def get_quiz(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):

    lesson = (
        db.query(Lesson)
        .filter(Lesson.id == lesson_id, Lesson.owner_uid == current_user["uid"])
        .first()
    )

    if not lesson:
        raise HTTPException(404, "Lesson not found")

    if not lesson.quiz_json:
        raise HTTPException(404, "Quiz not ready")

    return json.loads(lesson.quiz_json)
