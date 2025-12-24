# backend/app/services/s3_service.py

import os
import mimetypes
import boto3
from botocore.exceptions import ClientError
from ..config import settings

s3 = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION
)

def upload_to_s3(file_path: str, filename: str, public: bool = False):
    print("\n==================== S3 UPLOAD ====================")
    print("Local file:", file_path)
    print("Filename:", filename)

    if not os.path.exists(file_path):
        raise Exception(f"❌ File does not exist → {file_path}")

    bucket = settings.S3_BUCKET
    region = settings.AWS_REGION   # ✅ FIXED typo
    s3_key = f"videos/{filename}"

    print("📦 Bucket:", bucket)
    print("🗝️ Key:", s3_key)

    mime, _ = mimetypes.guess_type(file_path)
    mime = mime or "video/mp4"

    extra_args = {"ContentType": mime}

    try:
        s3.upload_file(
            Filename=file_path,
            Bucket=bucket,
            Key=s3_key,
            ExtraArgs=extra_args
        )
        print("✅ Upload success!")
    except ClientError as e:
        print("❌ S3 Upload Error:", e)
        raise Exception(f"S3 upload failed: {e}")

    # ---------- permanent public URL ----------
    public_url = f"https://{bucket}.s3.amazonaws.com/{s3_key}"
    print("🔗 PUBLIC URL:", public_url)
    print("====================================================\n")
    return public_url
