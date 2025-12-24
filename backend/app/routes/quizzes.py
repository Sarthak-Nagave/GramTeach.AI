from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from ..database.connection import get_db
from ..models.quiz import Quiz
from ..models.lesson import Lesson
from ..services.quiz_service import generate_quiz_questions

router = APIRouter(prefix="/quizzes", tags=["Quiz"])


@router.post("/generate/{lesson_id}")
def generate_quiz(lesson_id: int, db: Session = Depends(get_db)):

    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(404, "Lesson not found")

    questions = generate_quiz_questions(lesson.topic, 4)

    db.query(Quiz).filter(Quiz.lesson_id == lesson_id).delete()

    for q in questions:
        db.add(
            Quiz(
                lesson_id=lesson_id,
                question=q["question"],
                options=q["options"],
                answer=q["answer"]
            )
        )

    db.commit()

    return {"status": "success", "quiz_count": len(questions)}


@router.get("/{lesson_id}")
def get_quiz(lesson_id: int, db: Session = Depends(get_db)):

    quiz = db.query(Quiz).filter(Quiz.lesson_id == lesson_id).all()
    if not quiz:
        raise HTTPException(404, "Quiz not available")

    return [
        {
            "id": q.id,
            "question": q.question,
            "options": q.options,
            "answer": q.answer,
        }
        for q in quiz
    ]


@router.post("/{lesson_id}/submit")
def submit_quiz_score(lesson_id: int, data: dict, db: Session = Depends(get_db)):

    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(404, "Lesson not found")

    lesson.quiz_score = data.get("score")
    lesson.quiz_total = data.get("total")
    lesson.quiz_passed = data.get("passed")

    db.commit()

    return {"status": "saved", "lesson_id": lesson_id}
