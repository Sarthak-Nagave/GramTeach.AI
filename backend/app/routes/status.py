# backend/app/routes/status.py
from fastapi import APIRouter, Depends, HTTPException
from ..database.connection import get_db

from sqlalchemy.orm import Session
from ..models import Lesson
from ..celery_app import celery_app

router = APIRouter(prefix="/status", tags=["Status"])

@router.get("/lesson/{lesson_id}")
def lesson_status(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Not found")
    task_state = None
    try:
        if lesson.processing_task_id:
            async_result = celery_app.AsyncResult(lesson.processing_task_id)
            task_state = {
                "task_id": lesson.processing_task_id,
                "state": async_result.state,
                "meta": async_result.info or {}
            }
    except Exception:
        task_state = None

    return {
        "lesson": {
            "id": lesson.id,
            "processing_status": lesson.processing_status,
            "processing_progress": lesson.processing_progress,
            "video_url": lesson.video_url,
            "error_message": lesson.error_message
        },
        "task": task_state
    }
