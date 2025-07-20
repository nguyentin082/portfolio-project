from supabase import create_client, Client
from core.config import SUPABASE_URL, SUPABASE_KEY, SUPABASE_BUCKET_NAME
from typing import Optional, Dict, Any
from pathlib import Path
import logging
from uuid import uuid4
import asyncio

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
logger = logging.getLogger(__name__)


async def upload_file(
    file_content: bytes,
    file_name: str,
    mimetype: Optional[str] = None,
) -> Dict[str, Any]:
    if not file_content:
        return {"success": False, "error": "File content is empty"}
    storage_file_name = f"{uuid4()}-{file_name}"
    try:
        response = await asyncio.to_thread(
            supabase.storage.from_(SUPABASE_BUCKET_NAME).upload,
            path=storage_file_name,
            file=file_content,
            file_options={"content-type": mimetype} if mimetype else None,
        )
        if hasattr(response, "error") and response.error:
            return {"success": False, "error": str(response.error)}
        return {
            "success": True,
            "file_key": storage_file_name,
            "bucket": SUPABASE_BUCKET_NAME,
            "size": len(file_content),
            "mimetype": mimetype,
        }
    except Exception as e:
        logger.error(f"Upload error: {e}")
        return {"success": False, "error": str(e)}


async def download_file(
    file_key: str, local_path: Optional[str] = "temp/download"
) -> Dict[str, Any]:
    try:
        file_key = f"{file_key}"
        content = await asyncio.to_thread(
            supabase.storage.from_(SUPABASE_BUCKET_NAME).download, file_key
        )
        if not content:
            return {"success": False, "error": "Download failed or file not found"}
        local_path = Path(local_path)
        local_path.mkdir(parents=True, exist_ok=True)
        file_path = local_path / file_key.split("/")[-1]
        with open(file_path, "wb") as f:
            f.write(content)
        return {
            "success": True,
            "file_name": file_key.split("/")[-1],
            "local_path": str(file_path),
            "bucket": SUPABASE_BUCKET_NAME,
            "size": len(content),
        }

    except Exception as e:
        logger.error(f"Download error: {e}")
        return {"success": False, "error": str(e)}


async def get_presigned_url(file_key: str, expires_in: int = 3600) -> Dict[str, Any]:
    try:
        response = await asyncio.to_thread(
            supabase.storage.from_(SUPABASE_BUCKET_NAME).create_signed_url,
            path=f"{file_key}",
            expires_in=expires_in,
        )

        signed_url = response.get("signedURL")
        if not signed_url:
            return {"success": False, "error": "Could not create signed URL"}

        return {
            "success": True,
            "file_name": file_key,
            "bucket": SUPABASE_BUCKET_NAME,
            "presigned_url": signed_url,
            "expires_in": expires_in,
        }

    except Exception as e:
        logger.error(f"Presigned URL error: {e}")
        return {"success": False, "error": str(e)}
