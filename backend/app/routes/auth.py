# backend/app/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database.connection import get_db
from ..models.user import User
from ..schemas import UserResponse
from ..dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=UserResponse)
def login_or_register(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Login or auto-register user using ONLY Firebase token.
    No body parameters required.
    """

    uid = current_user["uid"]
    email = current_user.get("email")
    name = current_user.get("name")

    # Check if user exists in DB
    db_user = db.query(User).filter(User.uid == uid).first()

    # Create user if new
    if not db_user:
        db_user = User(
            uid=uid,
            email=email,
            name=name,
            is_admin=False
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        print(f"[AUTH] Auto-created new user → {uid}")

    return db_user
