# backend/app/celery_app.py

from celery import Celery
import os

# Use local Redis running in Docker
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "genai_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL,
)

# recommended config
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_time_limit=60*60,  # 1 hour limit per heavy task (adjust)
    task_soft_time_limit=60*50,
)
