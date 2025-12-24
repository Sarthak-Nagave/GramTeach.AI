# backend/app/models/__init__.py

from .user import User
from .lesson import Lesson
from .quiz import Quiz

__all__ = ["User", "Lesson", "Quiz"]
