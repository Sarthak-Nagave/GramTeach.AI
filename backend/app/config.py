# backend/app/config.py

import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Path to backend/.env
BASE_DIR = Path(__file__).resolve().parent.parent  
ENV_PATH = BASE_DIR / ".env"

print("ENV PATH USING =", ENV_PATH)

class Settings(BaseSettings):
    # ---------------------------------------------------------
    # APP CONFIG
    # ---------------------------------------------------------
    APP_NAME: str = "GenAI Teaching Platform"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # global temp storage used everywhere
    TEMP_DIR: str = "./tmp"

    # ---------------------------------------------------------
    # DATABASE
    # ---------------------------------------------------------
    DATABASE_URL: str

    # ---------------------------------------------------------
    # SECURITY / JWT
    # ---------------------------------------------------------
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"

    # ---------------------------------------------------------
    # ADMIN AUTH CONFIG
    # ---------------------------------------------------------
    ADMIN_EMAIL: str | None = None
    ADMIN_PASSWORD: str | None = None              # optional plain text
    ADMIN_PASSWORD_HASH: str | None = None         # optional hashed
    ADMIN_JWT_EXPIRE_MINUTES: int = 12 * 60        # 12 hours

    # ---------------------------------------------------------
    # AI KEYS
    # ---------------------------------------------------------
    OPENAI_API_KEY: str
    GROQ_API_KEY: str
    ELEVENLABS_API_KEY: str
    STABILITY_API_KEY: str

    # ---------------------------------------------------------
    # FIREBASE
    # ---------------------------------------------------------
    FIREBASE_PROJECT_ID: str
    FIREBASE_PRIVATE_KEY: str
    FIREBASE_CLIENT_EMAIL: str

    # ---------------------------------------------------------
    # AWS S3 STORAGE
    # ---------------------------------------------------------
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str
    S3_BUCKET: str

    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH),
        extra="ignore"
    )


settings = Settings()

# ---------------------------------------------------------
# Ensure TMP directory exists
# ---------------------------------------------------------
try:
    os.makedirs(settings.TEMP_DIR, exist_ok=True)
    print(f"[Init] Temp directory ready: {settings.TEMP_DIR}")
except Exception as e:
    print("[ERROR] Could not initialize TEMP_DIR:", e)

print("Loaded ADMIN_EMAIL =", settings.ADMIN_EMAIL)