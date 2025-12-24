from fastapi import APIRouter, HTTPException, Depends, Header, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime
from jose import jwt, JWTError
import uuid

from ..database.connection import get_db
from ..models.admin import Admin
from ..config import settings
from .sessions_ws import ws_push

router = APIRouter(prefix="/admin/iam", tags=["IAM Authentication"])

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = settings.JWT_SECRET
JWT_ALGORITHM = settings.JWT_ALGORITHM or "HS256"
SUPERADMIN_EMAIL = settings.ADMIN_EMAIL


# ============================================================
# CREATE TOKEN (NO EXPIRY)
# ============================================================
def create_admin_token(admin: Admin, jti: str) -> str:
    payload = {
        "sub": admin.email,
        "id": admin.id,
        "role": admin.role,
        "is_admin": True,
        "is_superadmin": bool(admin.is_superadmin),
        "jti": jti,
        "iat": int(datetime.utcnow().timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


# ============================================================
# DECODE TOKEN
# ============================================================
def decode_token(token: str, db: Session) -> dict:
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={"verify_exp": False},
        )

        if payload.get("is_admin") is not True:
            raise HTTPException(401, "Invalid admin token")

        admin = db.query(Admin).filter(Admin.id == payload.get("id")).first()
        if not admin:
            raise HTTPException(401, "Admin no longer exists")

        return payload

    except JWTError:
        raise HTTPException(401, "Invalid admin token")


# ============================================================
# CURRENT ADMIN
# ============================================================
def get_current_admin(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
) -> dict:
    if not authorization:
        raise HTTPException(401, "Missing Authorization header")

    scheme, token = authorization.split()
    if scheme.lower() != "bearer":
        raise HTTPException(401, "Invalid Authorization header")

    return decode_token(token, db)


# ============================================================
# SCHEMAS
# ============================================================
class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class AdminCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "admin"


# ============================================================
# LOGIN (HISTORY + SESSION + WS)
# ============================================================
@router.post("/login")
async def login(
    data: AdminLogin,
    request: Request,
    db: Session = Depends(get_db),
):
    admin = db.query(Admin).filter(Admin.email == data.email).first()
    success = admin and pwd.verify(data.password, admin.password_hash)

    # ---------- LOGIN HISTORY ----------
    db.execute(
        """
        INSERT INTO admin_login_history
        (admin_id, email, ip, user_agent, success, created_at)
        VALUES (:a, :e, :ip, :ua, :s, :t)
        """,
        {
            "a": admin.id if admin else None,
            "e": data.email,
            "ip": request.client.host if request.client else None,
            "ua": request.headers.get("user-agent"),
            "s": bool(success),
            "t": datetime.utcnow(),
        },
    )

    if not success:
        db.commit()
        await ws_push("login_history", {"email": data.email, "success": False})
        raise HTTPException(401, "Invalid admin credentials")

    # ---------- CREATE SESSION ----------
    jti = str(uuid.uuid4())

    db.execute(
        """
        INSERT INTO admin_sessions
        (admin_id, admin_email, token_jti, ip, ua, created_at)
        VALUES (:id, :email, :jti, :ip, :ua, :t)
        """,
        {
            "id": admin.id,
            "email": admin.email,
            "jti": jti,
            "ip": request.client.host if request.client else None,
            "ua": request.headers.get("user-agent"),
            "t": datetime.utcnow(),
        },
    )

    db.commit()

    await ws_push("login", {"email": admin.email})

    return {"access_token": create_admin_token(admin, jti)}


# ============================================================
# AUTO SUPERADMIN LOGIN
# ============================================================
@router.post("/auto-login")
def auto_login(db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == SUPERADMIN_EMAIL).first()

    if not admin or not admin.is_superadmin:
        raise HTTPException(403, "Superadmin not found")

    jti = str(uuid.uuid4())
    return {"access_token": create_admin_token(admin, jti)}


# ============================================================
# CREATE ADMIN (SUPERADMIN)
# ============================================================
@router.post("/create")
def create_admin(
    data: AdminCreate,
    db: Session = Depends(get_db),
    current=Depends(get_current_admin),
):
    if not current["is_superadmin"]:
        raise HTTPException(403, "Only superadmin can create admins")

    if db.query(Admin).filter(Admin.email == data.email).first():
        raise HTTPException(400, "Admin already exists")

    admin = Admin(
        email=data.email,
        role=data.role,
        is_superadmin=(data.role == "superadmin"),
        password_hash=pwd.hash(data.password),
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    return {"message": "Admin created", "admin_id": admin.id}


# ============================================================
# LIST ADMINS
# ============================================================
@router.get("/admins")
def list_admins(
    db: Session = Depends(get_db),
    current=Depends(get_current_admin),
):
    if not current["is_superadmin"]:
        raise HTTPException(403, "Only superadmin allowed")

    admins = db.query(Admin).order_by(Admin.id.desc()).all()

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


# ============================================================
# DELETE ADMIN
# ============================================================
@router.delete("/delete/{admin_id}")
def delete_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current=Depends(get_current_admin),
):
    if not current["is_superadmin"]:
        raise HTTPException(403, "Only superadmin can delete admins")

    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(404, "Admin not found")

    if admin.id == current["id"]:
        raise HTTPException(400, "You cannot delete yourself")

    if admin.is_superadmin:
        count = db.query(Admin).filter(Admin.is_superadmin == True).count()
        if count <= 1:
            raise HTTPException(400, "Cannot delete last superadmin")

    db.delete(admin)
    db.commit()

    return {"message": "Admin deleted"}
