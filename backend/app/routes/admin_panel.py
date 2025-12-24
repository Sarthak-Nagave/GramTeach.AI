# backend/app/routes/admin_panel.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os

from ..database.connection import get_db
from ..models.lesson import Lesson
from ..deps_admin import get_current_admin

# Firebase Admin SDK
from firebase_admin import auth as firebase_auth

router = APIRouter(prefix="/admin", tags=["Admin Panel"])


# =====================================================================
# ✅ USERS LIST — Fetch REAL Firebase Users (Not SQL table)
# =====================================================================
@router.get("/users")
def get_all_users(admin=Depends(get_current_admin)):
    users_list = []

    page = firebase_auth.list_users()

    for user in page.users:
        users_list.append({
            "uid": user.uid,
            "email": user.email,
            "phone": user.phone_number,
            "created_at": user.user_metadata.creation_timestamp
        })

    return users_list



# =====================================================================
# ✅ LESSONS LIST — Real lessons from PostgreSQL
# =====================================================================
@router.get("/lessons")
def get_all_lessons(admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    lessons = db.query(Lesson).order_by(Lesson.created_at.desc()).all()

    return [
        {
            "id": l.id,
            "title": l.title,
            "owner": l.owner_uid,
            "created_at": l.created_at,
            "video_url": l.video_url,
            "thumbnail_url": l.thumbnail_url,
            "status": l.processing_status,
            "progress": l.processing_progress,
        }
        for l in lessons
    ]



# =====================================================================
# ✅ STORAGE — Real Local Files (Not S3)
# =====================================================================
@router.get("/storage")
def list_local_storage(admin=Depends(get_current_admin)):
    directory = "./app/static/videos"

    if not os.path.exists(directory):
        return {"files": []}

    files = []
    for file in os.listdir(directory):
        path = os.path.join(directory, file)

        if os.path.isfile(path):
            size = os.path.getsize(path)
            files.append({
                "name": file,
                "size_mb": round(size / 1024 / 1024, 2)
            })

    return {"files": files}



# =====================================================================
# ✅ ANALYTICS — Real User + Lesson Growth (last 30 days)
# =====================================================================
@router.get("/analytics")
def analytics(admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    now = datetime.utcnow()
    last_30 = now - timedelta(days=30)

    # ---- REAL USERS (Firebase) ----
    fb_users = firebase_auth.list_users()
    users_growth = {}

    for u in fb_users.users:
        ts = u.user_metadata.creation_timestamp
        if not ts:
            continue

        created = datetime.fromtimestamp(ts / 1000)
        if created >= last_30:
            d = created.strftime("%Y-%m-%d")
            users_growth[d] = users_growth.get(d, 0) + 1

    # ---- REAL LESSONS ----
    lessons = (
        db.query(Lesson)
        .filter(Lesson.created_at >= last_30)
        .order_by(Lesson.created_at)
        .all()
    )

    lessons_growth = {}
    for l in lessons:
        d = l.created_at.strftime("%Y-%m-%d")
        lessons_growth[d] = lessons_growth.get(d, 0) + 1

    return {
        "user_growth": [{"date": k, "count": v} for k, v in users_growth.items()],
        "lesson_growth": [{"date": k, "count": v} for k, v in lessons_growth.items()],
    }
