# backend/app/models/lesson.py

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database.connection import Base

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)

    owner_uid = Column(String, index=True, nullable=False)

    title = Column(String, nullable=False)
    topic = Column(Text, nullable=False)
    language = Column(String, default="English")

    script = Column(Text, nullable=True)

    video_url = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)

    processing_status = Column(String, default="created")
    processing_progress = Column(Integer, default=0)

    quiz_json = Column(Text, nullable=True)
    quiz_score = Column(Integer, nullable=True)
    quiz_total = Column(Integer, nullable=True)
    quiz_passed = Column(Boolean, nullable=True)

    # store per-scene timings & subtitles as JSON string
    processed_scenes = Column(Text, nullable=True)

    # ⭐ REQUIRED FIELD
    created_at = Column(DateTime, default=datetime.utcnow)

    quiz = relationship("Quiz", back_populates="lesson", cascade="all, delete-orphan")
