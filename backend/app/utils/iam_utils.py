# backend/app/utils/iam_utils.py

from datetime import datetime, timedelta
from typing import Optional
from fastapi import Request
from sqlalchemy.orm import Session

# Correct imports
from ..models.iam_models import (
    AdminSession,
    AdminLoginHistory,
    AdminActivity
)
from ..models.admin import Admin


# ===============================================================
# Extract IP + User-Agent from Request
# ===============================================================

def get_ip(request: Request) -> str:
    """
    Extract real client IP address (supports proxies & ngrok).
    """
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def get_ua(request: Request) -> str:
    """
    Extract client browser user-agent string.
    """
    return request.headers.get("user-agent", "unknown")


# ===============================================================
# LOGIN HISTORY
# ===============================================================

def record_login(
    db: Session,
    admin: Optional[Admin],
    email: str,
    request: Request,
    success: bool
):
    """
    Stores every login attempt (failed/successful).
    """

    entry = AdminLoginHistory(
        admin_id=admin.id if admin else None,
        email=email,
        ip=get_ip(request),
        user_agent=get_ua(request),
        success=success,
        created_at=datetime.utcnow(),
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry.id


# ===============================================================
# CREATE SESSION
# ===============================================================

def create_session(
    db: Session,
    admin: Admin,
    token_jti: Optional[str],
    request: Optional[Request] = None,
    hours: int = 12
):
    """
    Stores admin session for IAM Security Dashboard.
    """

    session = AdminSession(
        admin_id=admin.id,
        admin_email=admin.email,
        token_jti=token_jti,
        ip=get_ip(request) if request else "unknown",
        ua=get_ua(request) if request else "unknown",
        created_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(hours=hours),
    )

    db.add(session)
    db.commit()
    db.refresh(session)
    return session


# ===============================================================
# REVOKE / DELETE SESSION
# ===============================================================

def revoke_session(db: Session, session_id: int) -> bool:
    """
    Deletes a single active admin session.
    """
    row = db.query(AdminSession).filter(AdminSession.id == session_id).first()
    if not row:
        return False

    db.delete(row)
    db.commit()
    return True


# ===============================================================
# ACTIVITY LOGGING
# ===============================================================

def log_activity(
    db: Session,
    admin_id: Optional[int],
    action: str,
    meta: Optional[dict] = None
):
    """
    Logs superadmin activity (promote, delete, reset password, etc.)
    """

    entry = AdminActivity(
        admin_id=admin_id,
        action=action,
        meta=meta or {},
        created_at=datetime.utcnow()
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
