from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database.connection import engine, Base, SessionLocal
from .utils.file_manager import ensure_directories

# Routers
from .routes import (
    auth,
    lessons,
    quizzes,

    admin_auth,     # /admin/iam/login, auto-login
    admin_panel,    # users, lessons, analytics
    admin_s3,

    admin_manage,   # ✅ /admin/admins /admin/sessions /admin/activity
    sessions_ws,    # ✅ /ws/iam
)

# Models
from .models.admin import Admin
from passlib.context import CryptContext


# --------------------------------------------------------
# INIT DATABASE + DIRECTORIES
# --------------------------------------------------------
Base.metadata.create_all(bind=engine)
ensure_directories()

app = FastAPI(
    title=settings.APP_NAME,
    description="GramTeach AI Backend",
    version="1.0.0",
)


# --------------------------------------------------------
# AUTO-CREATE SUPERADMIN
# --------------------------------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ADMIN_EMAIL = settings.ADMIN_EMAIL
ADMIN_PASSWORD = settings.ADMIN_PASSWORD

print(f"[Init] Loaded superadmin email → {ADMIN_EMAIL}")

if ADMIN_EMAIL and ADMIN_PASSWORD:
    db = SessionLocal()
    try:
        admin = db.query(Admin).filter(Admin.email == ADMIN_EMAIL).first()

        if not admin:
            admin = Admin(
                email=ADMIN_EMAIL,
                password_hash=pwd_context.hash(ADMIN_PASSWORD),
                is_superadmin=True,
            )
            db.add(admin)
            db.commit()
            print("[Init] Superadmin created")

        elif not admin.is_superadmin:
            admin.is_superadmin = True
            db.commit()
            print("[Init] Existing admin promoted → superadmin")

    finally:
        db.close()
else:
    print("[Init] ❌ ADMIN_EMAIL or ADMIN_PASSWORD missing in .env")


# --------------------------------------------------------
# CORS
# --------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------------
@app.get("/")
def health():
    return {
        "status": "running",
        "service": "GramTeach Backend",
        "message": "Backend online 🚀"
    }


# --------------------------------------------------------
# REGISTER ROUTERS (ORDER MATTERS)
# --------------------------------------------------------
app.include_router(auth.router)
app.include_router(lessons.router)
app.include_router(quizzes.router)

# ADMIN LOGIN (JWT)
app.include_router(admin_auth.router)        # /admin/iam/login

# ADMIN PANEL (already working)
app.include_router(admin_panel.router)

# S3
app.include_router(admin_s3.router)

# ✅ IAM REST (admins, sessions, activity, history)
app.include_router(admin_manage.router)      # /admin/*

# ✅ IAM WEBSOCKET
app.include_router(sessions_ws.router)       # /ws/iam


# --------------------------------------------------------
# LOCAL DEV
# --------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
