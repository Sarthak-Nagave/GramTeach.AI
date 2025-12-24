from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON, Text, DateTime, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database.connection import Base

# ------------------------------------------------------
# USER MODEL
# ------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True)
    email = Column(String)
    name = Column(String)

    # Relationships
    lessons = relationship("Lesson", back_populates="owner", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="owner", cascade="all, delete-orphan")


# ------------------------------------------------------
# LESSON MODEL  (Your version — now fully compatible)
# ------------------------------------------------------
class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    owner_uid = Column(String, ForeignKey("users.firebase_uid"))

    title = Column(String, nullable=False)
    topic = Column(String)
    language = Column(String, default="en")

    # AI generated content
    script = Column(Text)
    video_url = Column(String)
    thumbnail_url = Column(String)

    # Processing state
    processing_status = Column(String, default="pending")  # pending / queued / processing / failed / ready
    processing_progress = Column(Float, default=0.0)
    processing_task_id = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="lessons")
    quiz = relationship("Quiz", back_populates="lesson", uselist=False)


# ------------------------------------------------------
# QUIZ MODEL  (required by Lesson)
# ------------------------------------------------------
class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    owner_uid = Column(String, ForeignKey("users.firebase_uid"))

    questions = Column(JSON)  # list of questions with options
    answers = Column(JSON)    # correct answers

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    lesson = relationship("Lesson", back_populates="quiz")
    owner = relationship("User", back_populates="quizzes")
