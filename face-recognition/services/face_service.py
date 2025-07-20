from fastapi import HTTPException
from typing import List, Dict, Optional
from integrates.insightface import face_detection


async def face_detection_service(local_path: str) -> List[Dict]:
    """Basic face detection without Milvus integration"""
    try:
        # Face detection using InsightFace
        faces = face_detection(local_path)
        if not faces:
            raise HTTPException(status_code=404, detail="No faces detected")
        return faces
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face detection failed: {str(e)}")
