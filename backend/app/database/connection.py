from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..config import settings
from .base_class import Base   # ✅ import Base from the new file

# PostgreSQL engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,            # keeps console clean
    pool_pre_ping=True,    # auto-reconnect to avoid stale DB errors
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Provides DB session to FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
