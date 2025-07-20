from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import JSONResponse
from typing import List
import time
from services.mongo_service import get_image_data
from integrates.supabase import download_file
from services.face_service import (
    face_detection_service,
)
from schemas.image_schema import FaceDetectionRequest
from services.milvus_service import MilvusService
from services.mongo_service import update_image_faces


router = APIRouter()


@router.post("/detect")
async def detect_faces(request: FaceDetectionRequest):
    """Basic face detection without name suggestions"""
    try:
        start_time = time.time()
        # Get image data from MongoDB
        data = await get_image_data(id=request.image_id)
        # Download the image file from Supabase
        result = await download_file(file_key=data["file_key"])
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        # Perform face detection
        faces = await face_detection_service(local_path=result["local_path"])
        # Save faces embedding data to Milvus
        milvus_service = MilvusService()
        for face in faces:
            embedding = face.get("embedding")
            if embedding:
                milvus_id = milvus_service.save_face_embedding(embedding=embedding)
                face["milvusId"] = milvus_id

                # Update individual face in MongoDB
                await update_image_faces(
                    id=request.image_id,
                    milvus_id=milvus_id,
                    face_data={
                        "milvusId": milvus_id,
                        "bbox": face.get("bbox", []),
                        "personId": face.get("personId", "unknown"),
                    },
                )
        execution_time = round(time.time() - start_time, 4)
        return JSONResponse(
            status_code=200,
            content={"success": True, "faces": faces, "execution_time": execution_time},
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face detection failed: {str(e)}")
