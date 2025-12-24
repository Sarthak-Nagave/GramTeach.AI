# backend/app/models/iam_models.py

from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from ..database.base_class import Base


# ===============================================================
# Admin Sessions Table
# ===============================================================
class AdminSession(Base):
    __tablename__ = "admin_sessions"

    id = Column(Integer, primary_key=True, index=True)

    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=False)
    admin_email = Column(String, nullable=False)

    token_jti = Column(String, nullable=True)       # For optional JWT blacklisting
    ip = Column(String, nullable=True)              # IP address
    ua = Column(String, nullable=True)              # User Agent string

    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

    admin = relationship("Admin", backref="sessions")


# ===============================================================
# Login History Table
# ===============================================================
class AdminLoginHistory(Base):
    __tablename__ = "admin_login_history"

    id = Column(Integer, primary_key=True, index=True)

    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=True)
    email = Column(String, nullable=False)

    ip = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)

    success = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    admin = relationship("Admin", backref="login_history")


# ===============================================================
# Admin Activity Table
# ===============================================================
class AdminActivity(Base):
    __tablename__ = "admin_activity"

    id = Column(Integer, primary_key=True, index=True)

    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=True)

    action = Column(String, nullable=False)
    meta = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    admin = relationship("Admin", backref="activity_logs")
