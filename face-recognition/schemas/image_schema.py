from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class FaceDetection(BaseModel):
    """Schema for face detection data"""

    bbox: List[float] = Field(
        ..., description="Bounding box coordinates [x1, y1, x2, y2]"
    )
    name: str = Field(..., description="Person name")
    person_id: str = Field(..., description="Person ID")
    vector_id: str = Field(..., description="Vector ID in Milvus")


class ImageBase(BaseModel):
    """Base schema for image data"""

    user_id: str = Field(..., description="User ID who uploaded the image")
    file_key: str = Field(..., description="File key in storage")
    playground_id: str = Field(..., description="Playground ID")


class ImageCreate(ImageBase):
    """Schema for creating new image record"""

    pass


class ImageResponse(ImageBase):
    """Schema for image response"""

    id: str = Field(..., description="Image document ID")
    faces: List[FaceDetection] = Field(default=[], description="Detected faces")
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")

    class Config:
        from_attributes = True


class FaceDetectionRequest(BaseModel):
    """Schema for face detection request"""

    image_id: str = Field(..., description="Image ID to process")


class FaceDetectionResponse(BaseModel):
    """Schema for face detection response"""

    success: bool = Field(..., description="Success status")
    faces: List[FaceDetection] = Field(..., description="Detected faces")
    execution_time: float = Field(..., description="Processing time in seconds")
    faces_count: int = Field(..., description="Number of faces detected")


class ImageUpdateFaces(BaseModel):
    """Schema for updating faces data"""

    faces: List[FaceDetection] = Field(..., description="Updated faces data")
