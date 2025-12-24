from fastapi import Header, HTTPException
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from .config import settings
from .database.connection import SessionLocal
from .models.admin import Admin

# MUST MATCH admin_auth.py EXACTLY
JWT_SECRET = settings.JWT_SECRET
JWT_ALGORITHM = settings.JWT_ALGORITHM or "HS256"


# =========================================================
# DECODE ADMIN TOKEN (NO EXPIRY CHECK)
# =========================================================
def decode_admin_token(token: str) -> dict:
    """
    Decode admin JWT.
    EXPIRY IS DISABLED (Unlimited Login).
    """
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={"verify_exp": False},  # 🔥 IMPORTANT
        )

        if payload.get("is_admin") is not True:
            raise HTTPException(401, "Invalid admin token")

        return payload

    except JWTError:
        raise HTTPException(401, "Invalid admin token")


# =========================================================
# AUTH DEPENDENCY
# =========================================================
def get_current_admin(authorization: str = Header(None)):
    """
    Validates Authorization header and returns admin context.
    """

    if not authorization:
        raise HTTPException(401, "Missing Authorization header")

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(401, "Invalid Authorization header format")

    token = parts[1].strip()
    payload = decode_admin_token(token)

    admin_id = payload.get("id")
    email = payload.get("sub")
    is_superadmin = bool(payload.get("is_superadmin"))

    if not admin_id or not email:
        raise HTTPException(401, "Invalid token payload")

    db: Session = SessionLocal()
    try:
        admin = db.query(Admin).filter(Admin.id == admin_id).first()
        if not admin:
            raise HTTPException(403, "Admin not found")

        return {
            "id": admin.id,
            "email": admin.email,
            "is_superadmin": bool(admin.is_superadmin),
        }

    finally:
        db.close()
