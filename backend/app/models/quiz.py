# backend/app/models/quiz.py

from sqlalchemy import Column, Integer, Text, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY
from ..database.connection import Base


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True)

    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"))

    question = Column(Text, nullable=False)
    options = Column(ARRAY(Text), nullable=False)   # PostgreSQL ARRAY
    answer = Column(String, nullable=False)

    lesson = relationship("Lesson", back_populates="quiz")
