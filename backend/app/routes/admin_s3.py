from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import boto3
from botocore.exceptions import ClientError

from ..config import settings
from ..deps_admin import get_current_admin

router = APIRouter(prefix="/admin/s3", tags=["Admin S3"])

# -------------------------------
# S3 CLIENT
# -------------------------------
s3 = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION,
)


# -------------------------------
# LIST FILES
# -------------------------------
@router.get("/list")
def list_files(admin=Depends(get_current_admin)):
    try:
        res = s3.list_objects_v2(Bucket=settings.S3_BUCKET)

        if "Contents" not in res:
            return {"files": []}

        files = []
        for obj in res["Contents"]:
            key = obj["Key"]

            # Create temporary signed URL for preview
            url = s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": settings.S3_BUCKET, "Key": key},
                ExpiresIn=3600,
            )

            files.append({
                "Key": key,
                "Size": obj["Size"],
                "LastModified": obj["LastModified"],
                "Url": url,
            })

        return {"files": files}

    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------
# DELETE FILE
# -------------------------------
@router.delete("/delete/{key}")
def delete_file(key: str, admin=Depends(get_current_admin)):
    try:
        s3.delete_object(Bucket=settings.S3_BUCKET, Key=key)
        return {"message": f"{key} deleted"}
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))
