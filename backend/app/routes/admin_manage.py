from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional, Dict
from datetime import datetime
from passlib.context import CryptContext
import json

from ..database.connection import get_db
from ..models.admin import Admin
from .admin_auth import get_current_admin
from .sessions_ws import ws_push

router = APIRouter(prefix="/admin", tags=["IAM Management"])
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


# =====================================================
# ACTIVITY LOGGER (POSTGRES SAFE)
# =====================================================
def log_activity(db: Session, admin_id: int, action: str, meta: Optional[Dict] = None):
    db.execute(
        """
        INSERT INTO admin_activity (admin_id, action, meta, created_at)
        VALUES (:a, :act, :meta, :t)
        """,
        {
            "a": admin_id,
            "act": action,
            "meta": json.dumps(meta or {}),
            "t": datetime.utcnow(),
        },
    )
    db.commit()


# =====================================================
# SCHEMAS
# =====================================================
class CreateAdmin(BaseModel):
    email: EmailStr
    password: str
    role: str = "admin"


class ResetPassword(BaseModel):
    new_password: str


# =====================================================
# CREATE ADMIN
# =====================================================
@router.post("/create")
async def create_admin(
    payload: CreateAdmin,
    db: Session = Depends(get_db),
    current=Depends(get_current_admin),
):
    if not current.get("is_superadmin"):
        raise HTTPException(403, "Only superadmin can create admins")

    if db.query(Admin).filter(Admin.email == payload.email).first():
        raise HTTPException(400, "Admin already exists")

    admin = Admin(
        email=payload.email,
        password_hash=pwd.hash(payload.password),
        role=payload.role,
        is_superadmin=(payload.role == "superadmin"),
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    log_activity(db, current["id"], "create_admin", {"admin_id": admin.id})
    await ws_push("create_admin", {"admin_id": admin.id, "email": admin.email})

    return {"message": "Admin created", "admin_id": admin.id}


# =====================================================
# LIST ADMINS
# =====================================================
@router.get("/admins")
def list_admins(
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current=Depends(get_current_admin),
):
    if not current.get("is_superadmin"):
        raise HTTPException(403, "Only superadmin can view admins")

    query = db.query(Admin)
    if q:
        query = query.filter(Admin.email.ilike(f"%{q}%"))

    admins = query.order_by(Admin.id.desc()).all()

    return [
        {
            "id": a.id,
            "email": a.email,
            "role": a.role,
            "is_superadmin": a.is_superadmin,
            "created_at": a.created_at,
        }
        for a in admins
    ]


# =====================================================
# PROMOTE ADMIN
# =====================================================
@router.post("/promote/{admin_id}")
async def promote_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current=Depends(get_current_admin),
):
    if not current.get("is_superadmin"):
        raise HTTPException(403, "Only superadmin can promote")

    if admin_id == current["id"]:
        raise HTTPException(400, "You cannot promote yourself")

    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(404, "Admin not found")

    admin.role = "superadmin"
    admin.is_superadmin = True
    db.commit()

    log_activity(db, current["id"], "promote_admin", {"admin_id": admin_id})
    await ws_push("promote_admin", {"admin_id": admin_id})

    return {"message": "Admin promoted"}


# =====================================================
# DEMOTE ADMIN
# =====================================================
@router.post("/demote/{admin_id}")
async def demote_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current=Depends(get_current_admin),
):
    if not current.get("is_superadmin"):
        raise HTTPException(403, "Only superadmin can demote")

    if admin_id == current["id"]:
        raise HTTPException(400, "You cannot demote yourself")

    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(404, "Admin not found")

    if admin.is_superadmin:
        total = db.query(Admin).filter(Admin.is_superadmin == True).count()
        if total <= 1:
            raise HTTPException(400, "Cannot demote last superadmin")

    admin.role = "admin"
    admin.is_superadmin = False
    db.commit()

    log_activity(db, current["id"], "demote_admin", {"admin_id": admin_id})
    await ws_push("demote_admin", {"admin_id": admin_id})

    return {"message": "Admin demoted"}


# =====================================================
# DELETE ADMIN
# =====================================================
@router.delete("/delete/{admin_id}")
async def delete_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current=Depends(get_current_admin),
):
    if not current.get("is_superadmin"):
        raise HTTPException(403, "Only superadmin can delete admins")

    if admin_id == current["id"]:
        raise HTTPException(400, "You cannot delete yourself")

    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(404, "Admin not found")

    if admin.is_superadmin:
        total = db.query(Admin).filter(Admin.is_superadmin == True).count()
        if total <= 1:
            raise HTTPException(400, "Cannot delete last superadmin")

    db.delete(admin)
    db.commit()

    log_activity(db, current["id"], "delete_admin", {"admin_id": admin_id})
    await ws_push("delete_admin", {"admin_id": admin_id})

    return {"message": "Admin deleted"}


# =====================================================
# RESET PASSWORD
# =====================================================
@router.post("/reset-password/{admin_id}")
async def reset_password(
    admin_id: int,
    payload: ResetPassword,
    db: Session = Depends(get_db),
    current=Depends(get_current_admin),
):
    if not current.get("is_superadmin"):
        raise HTTPException(403, "Only superadmin can reset passwords")

    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(404, "Admin not found")

    admin.password_hash = pwd.hash(payload.new_password)
    db.commit()

    log_activity(db, current["id"], "reset_password", {"admin_id": admin_id})
    await ws_push("reset_password", {"admin_id": admin_id})

    return {"message": "Password updated"}


# =====================================================
# ACTIVITY LOGS
# =====================================================
@router.get("/activity")
def activity_logs(
    db: Session = Depends(get_db),
    current=Depends(get_current_admin),
):
    if not current.get("is_superadmin"):
        raise HTTPException(403, "Only superadmin can view logs")

    rows = db.execute(
        "SELECT * FROM admin_activity ORDER BY created_at DESC LIMIT 200"
    ).fetchall()

    return [dict(r._mapping) for r in rows]


# =====================================================
# SESSIONS
# =====================================================
@router.get("/sessions")
def list_sessions(
    db: Session = Depends(get_db),
    current=Depends(get_current_admin),
):
    if not current.get("is_superadmin"):
        raise HTTPException(403, "Only superadmin can view sessions")

    rows = db.execute(
        "SELECT * FROM admin_sessions ORDER BY created_at DESC"
    ).fetchall()

    return [dict(r._mapping) for r in rows]

# =====================================================
# LOGIN HISTORY
# =====================================================
@router.get("/login-history")
def login_history(
    db: Session = Depends(get_db),
    current=Depends(get_current_admin),
):
    if not current.get("is_superadmin"):
        raise HTTPException(403, "Only superadmin can view login history")

    rows = db.execute(
        """
        SELECT id, admin_id, email, ip, user_agent, success, created_at
        FROM admin_login_history
        ORDER BY created_at DESC
        LIMIT 200
        """
    ).fetchall()

    return [dict(r._mapping) for r in rows]

# =====================================================
# REVOKE SESSION
# =====================================================
@router.delete("/sessions/{session_id}")
async def revoke_session(
    session_id: int,
    db: Session = Depends(get_db),
    current=Depends(get_current_admin),
):
    if not current.get("is_superadmin"):
        raise HTTPException(403, "Only superadmin can revoke sessions")

    row = db.execute(
        "SELECT id FROM admin_sessions WHERE id = :id",
        {"id": session_id},
    ).fetchone()

    if not row:
        raise HTTPException(404, "Session not found")

    db.execute("DELETE FROM admin_sessions WHERE id = :id", {"id": session_id})
    db.commit()

    log_activity(db, current["id"], "revoke_session", {"session_id": session_id})
    await ws_push("revoke_session", {"session_id": session_id})

    return {"message": "Session revoked"}
