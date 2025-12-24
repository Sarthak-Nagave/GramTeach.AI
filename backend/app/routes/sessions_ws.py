from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
import asyncio
from datetime import datetime
from jose import jwt, JWTError

from ..database.connection import SessionLocal
from ..models.admin import Admin
from ..config import settings

router = APIRouter(prefix="/ws", tags=["IAM WebSocket"])

JWT_SECRET = settings.JWT_SECRET
JWT_ALGORITHM = settings.JWT_ALGORITHM or "HS256"


# ===============================================================
# CONNECTION MANAGER
# ===============================================================
class WSManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, data: dict):
        dead = []
        for ws in self.active:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)

        for ws in dead:
            self.disconnect(ws)


manager = WSManager()


# ===============================================================
# JWT VALIDATION (MATCHES admin_auth)
# ===============================================================
def validate_admin_token(token: str, db: Session):
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={"verify_exp": False},  # unlimited login
        )

        if payload.get("is_admin") is not True:
            return None

        admin_id = payload.get("id")
        if not admin_id:
            return None

        admin = db.query(Admin).filter(Admin.id == admin_id).first()
        if not admin:
            return None

        return payload

    except JWTError:
        return None


# ===============================================================
# WEBSOCKET ENDPOINT (SUPERADMIN ONLY)
# ===============================================================
@router.websocket("/iam")
async def iam_socket(websocket: WebSocket):
    """
    ws://localhost:8000/ws/iam?token=<JWT>
    """

    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        return

    db = SessionLocal()
    try:
        payload = validate_admin_token(token, db)

        if not payload or payload.get("is_superadmin") is not True:
            await websocket.close(code=1008)
            return

        # ✅ Accept connection
        await manager.connect(websocket)

        # ✅ Initial handshake
        await websocket.send_json({
            "event": "connected",
            "time": datetime.utcnow().isoformat(),
            "message": "Connected to GramTeach.AI IAM WebSocket",
        })

        while True:
            await asyncio.sleep(15)

    except WebSocketDisconnect:
        manager.disconnect(websocket)

    finally:
        db.close()


# ===============================================================
# PUSH EVENTS FROM BACKEND
# ===============================================================
async def ws_push(event_type: str, data: dict):
    await manager.broadcast({
        "event": event_type,
        "data": data,
        "time": datetime.utcnow().isoformat(),
    })
