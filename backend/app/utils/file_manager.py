import os
import shutil
from ..config import settings

def cleanup_temp_files(file_paths: list):
    """
    Safely removes temporary files from the disk.
    Handles missing files & permission issues gracefully.
    """
    for path in file_paths:
        try:
            if path and os.path.exists(path):
                os.remove(path)
                print(f"[Cleanup] Deleted temp file: {path}")
        except PermissionError:
            print(f"[Cleanup] Permission denied deleting: {path}")
        except Exception as e:
            print(f"[Cleanup] Error deleting {path}: {e}")


def cleanup_temp_directory():
    """
    Cleans the entire temp directory (frames, leftovers, partial renders).
    Used after video creation or server restart.
    """
    temp_dir = settings.TEMP_DIR

    if os.path.exists(temp_dir):
        try:
            shutil.rmtree(temp_dir)
            os.makedirs(temp_dir, exist_ok=True)
            print(f"[Cleanup] Reset temporary directory: {temp_dir}")
        except Exception as e:
            print(f"[Cleanup] Could not reset temp directory: {e}")


def ensure_directories():
    """
    Ensures all required directories exist.
    This runs on startup to prevent runtime errors.
    """
    try:
        os.makedirs(settings.TEMP_DIR, exist_ok=True)
        print(f"[Init] Temp directory ready: {settings.TEMP_DIR}")
    except Exception as e:
        print(f"[Init] Failed to create temp directory: {e}")
