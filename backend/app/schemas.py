# backend/app/schemas.py

from pydantic import BaseModel
from typing import List, Optional, Union
from datetime import datetime


# ======================================================
# USER SCHEMAS
# ======================================================

class UserBase(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None


class UserResponse(UserBase):
    id: int
    uid: str
    is_admin: bool

    class Config:
        from_attributes = True


# ======================================================
# LESSON SCHEMAS
# ======================================================

class LessonCreate(BaseModel):
    title: str
    topic: str
    language: str = "English"


class LessonResponse(BaseModel):
    id: int
    owner_uid: str
    title: str
    topic: str
    language: str

    script: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None

    processing_status: Optional[str] = None
    processing_progress: Optional[float] = None

    # 🔥 FIX: processed_scenes can be STRING or LIST
    processed_scenes: Optional[Union[str, list]] = None

    # 🔥 FIX: quiz JSON also may be dict or string
    quiz_json: Optional[Union[str, dict]] = None

    created_at: datetime

    class Config:
        from_attributes = True


# ======================================================
# QUIZ SCHEMAS
# ======================================================

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    answer: str


class QuizResponse(BaseModel):
    lesson_id: int
    questions: List[QuizQuestion]

    class Config:
        from_attributes = True
