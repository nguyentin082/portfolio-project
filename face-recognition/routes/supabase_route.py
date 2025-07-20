from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from fastapi.responses import JSONResponse
from typing import Optional
import time
from integrates.supabase import upload_file, download_file, get_presigned_url

router = APIRouter()


@router.post("/upload")
async def upload_file_to_storage(file: UploadFile = File(...)):
    try:
        start_time = time.time()
        file_content = await file.read()
        result = await upload_file(
            file_content=file_content,
            file_name=file.filename,
            mimetype=file.content_type,
        )
        result["execution_time"] = round(time.time() - start_time, 4)
        return JSONResponse(
            status_code=200 if result["success"] else 400, content=result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/download")
async def download_file_from_storage(
    file_key: str = Query(...),
    local_path: Optional[str] = Query("temp/download"),
):
    try:
        start_time = time.time()
        result = await download_file(file_key=file_key, local_path=local_path)
        result["execution_time"] = round(time.time() - start_time, 4)
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        return JSONResponse(status_code=200, content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")


@router.get("/presigned-url")
async def generate_presigned_url_endpoint(
    file_key: str = Query(...),
    expires_in: int = Query(3600, description="URL expiration time in seconds"),
):
    try:
        start_time = time.time()
        result = await get_presigned_url(file_key=file_key, expires_in=expires_in)
        result["execution_time"] = round(time.time() - start_time, 4)
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        return JSONResponse(status_code=200, content=result)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Presigned URL generation failed: {str(e)}"
        )
