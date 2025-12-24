from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime
from ..database.connection import Base   # ✅ FIXED — correct Base import


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)

    # Required for login
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)

    # Optional name (your JWT expects this)
    name = Column(String, nullable=True)

    # Role system
    role = Column(String, default="admin", nullable=False)
    is_superadmin = Column(Boolean, default=False, nullable=False)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
