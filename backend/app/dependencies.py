# backend/app/dependencies.py

from fastapi import Header, HTTPException, Depends
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from sqlalchemy.orm import Session

from .config import settings
from .database.connection import get_db
from .models.user import User


# -------------------------------------------------
# FIREBASE ADMIN INIT (RUN ONCE)
# -------------------------------------------------
if not firebase_admin._apps:
    try:
        cred_dict = {
            "type": "service_account",
            "project_id": settings.FIREBASE_PROJECT_ID,
            "private_key_id": "dummy",
            "private_key": settings.FIREBASE_PRIVATE_KEY.replace("\\n", "\n"),
            "client_email": settings.FIREBASE_CLIENT_EMAIL,
            "token_uri": "https://oauth2.googleapis.com/token",
        }
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
        print("[Firebase] Initialized")
    except Exception as e:
        print("[Firebase Init Error]", e)
        raise


# -------------------------------------------------
# AUTH HANDLER → VERIFY FIREBASE JWT + AUTO DB USER
# -------------------------------------------------
def get_current_user(
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    """
    Validates Firebase ID Token.
    Auto-creates DB user.
    Marks user as admin if email == ADMIN_EMAIL.
    Returns clean user dict → {uid, email, name, is_admin}
    """

    if not authorization:
        raise HTTPException(401, "Missing Authorization header")

    # Extract token from "Bearer <token>" OR raw token
    token = authorization.strip()
    if token.lower().startswith("bearer "):
        token = token[7:].strip()

    if not token:
        raise HTTPException(401, "Missing Bearer token")

    # -------------------------------------------------
    # VERIFY FIREBASE TOKEN
    # -------------------------------------------------
    try:
        decoded = firebase_auth.verify_id_token(token)
    except Exception:
        raise HTTPException(401, "Invalid or expired Firebase token")

    uid = decoded.get("uid")
    email = decoded.get("email")
    name = decoded.get("name") or decoded.get("display_name")

    if not uid:
        raise HTTPException(401, "Token missing UID")

    # -------------------------------------------------
    # Determine admin status from settings
    # -------------------------------------------------
    admin_email = settings.ADMIN_EMAIL.lower() if settings.ADMIN_EMAIL else None
    is_admin_flag = bool(email and admin_email and email.lower() == admin_email)

    # -------------------------------------------------
    # LOOKUP USER IN DB
    # -------------------------------------------------
    user = db.query(User).filter(User.uid == uid).first()

    if not user:
        # CREATE USER
        try:
            user = User(
                uid=uid,
                email=email,
                name=name,
                is_admin=is_admin_flag,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        except Exception:
            db.rollback()
            raise HTTPException(500, "Failed to create user in DB")

    else:
        # UPDATE ADMIN FLAG IF NECESSARY
        if is_admin_flag and not user.is_admin:
            try:
                user.is_admin = True
                db.commit()
                db.refresh(user)
            except Exception:
                db.rollback()

    # -------------------------------------------------
    # RETURN CLEAN DICT
    # -------------------------------------------------
    return {
        "uid": user.uid,
        "email": user.email,
        "name": user.name,
        "is_admin": bool(user.is_admin),
    }
