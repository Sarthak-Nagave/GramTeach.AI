# backend/app/auth_admin.py

from fastapi import HTTPException
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional

from .config import settings

# ---------------------------------------------------------
# CONFIG
# ---------------------------------------------------------
JWT_SECRET = settings.JWT_SECRET
JWT_ALG = settings.JWT_ALGORITHM or "HS256"
ADMIN_JWT_EXPIRE_MINUTES = 12 * 60  # 12 hours


# ---------------------------------------------------------
# TOKEN CREATION (Matches admin_auth.py)
# ---------------------------------------------------------
def create_hidden_admin_token(email: str, admin_id: int, is_superadmin: bool):
    """
    Used ONLY for your hidden fallback admin login (optional).
    Not used for normal admin login.
    """

    expire = datetime.utcnow() + timedelta(minutes=ADMIN_JWT_EXPIRE_MINUTES)

    payload = {
        "sub": email,
        "id": admin_id,
        "is_admin": True,
        "is_superadmin": is_superadmin,
        "exp": expire,
        "iat": datetime.utcnow(),
    }

    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


# ---------------------------------------------------------
# DECODE TOKEN (Must match deps_admin.py)
# ---------------------------------------------------------
def decode_hidden_admin_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])

        if payload.get("is_admin") is not True:
            return None

        return payload

    except JWTError:
        return None
