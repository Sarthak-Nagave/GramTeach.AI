# backend/app/tasks/video_tasks.py
from ..celery_app import celery_app
from ..services import video_engine, s3_service
from ..database import SessionLocal
from ..models import Lesson
import traceback
import os

@celery_app.task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def render_and_upload_lesson(self, lesson_id: int):
    """
    Celery task to render scenes into a video, upload to S3, and update DB.
    self.update_state(meta={...}) can be used to store progress.
    """
    session = SessionLocal()
    try:
        lesson = session.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            raise Exception(f"Lesson id={lesson_id} not found")

        # update DB status to processing
        lesson.processing_status = "processing"
        lesson.processing_progress = 1.0
        lesson.processing_task_id = self.request.id
        session.commit()

        # --- Step A: generate script & scenes if missing
        # (Assume script and scenes were stored or recreate - adjust to your pipeline)
        # For demo, assume text_processing.parse_script_to_scenes exists and returns scenes
        from ..utils import text_processing
        scenes = text_processing.parse_script_to_scenes(lesson.script or f"Topic: {lesson.topic}")
        total = len(scenes) or 1

        processed_scenes = []
        count = 0
        for idx, scene in enumerate(scenes):
            # generate audio & images synchronously via service wrappers (they may be blocking)
            audio = None
            image = None
            if hasattr(video_engine, "prepare_scene_media"):
                audio, image = video_engine.prepare_scene_media(scene, f"{lesson_id}-{idx}")
            else:
                # if you have separate services:
                audio = os.path.join("tmp", f"audio-{lesson_id}-{idx}.mp3")
                image = os.path.join("tmp", f"image-{lesson_id}-{idx}.png")
            processed_scenes.append({"audio": audio, "image": image})

            count += 1
            progress = 10.0 + (count / total) * 60.0  # 10->70 for media generation
            self.update_state(state="PROGRESS", meta={"progress": progress})
            lesson.processing_progress = progress
            session.commit()

        # --- Step B: render final video (this is heavy)
        self.update_state(state="PROGRESS", meta={"progress": 75.0})
        lesson.processing_progress = 75.0
        session.commit()

        final_name = f"lesson-{lesson_id}-{self.request.id}.mp4"
        video_path = video_engine.create_video(processed_scenes, final_name)  # must return mp4 path
        if not video_path or not os.path.exists(video_path):
            raise Exception("Video rendering failed — no file produced")

        # update progress
        self.update_state(state="PROGRESS", meta={"progress": 90.0})
        lesson.processing_progress = 90.0
        session.commit()

        # --- Step C: upload to S3
        s3_url = s3_service.upload_to_s3(video_path, final_name, public=True)

        # update DB with url + ready
        lesson.video_url = s3_url
        lesson.processing_status = "ready"
        lesson.processing_progress = 100.0
        session.commit()

        # optional cleanup local files
        try:
            os.remove(video_path)
        except Exception:
            pass

        return {"status": "ok", "video_url": s3_url}

    except Exception as exc:
        traceback.print_exc()
        # update DB: failed
        try:
            lesson.processing_status = "failed"
            lesson.error_message = str(exc)
            session.commit()
        except Exception:
            pass
        raise exc
    finally:
        session.close()
