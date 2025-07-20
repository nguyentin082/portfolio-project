"""
Service layer for face tagging using Milvus vector database
Simple face similarity search for name suggestion
"""

from typing import List, Dict, Optional
from integrates.milvus import (
    get_face_milvus_client,
    save_face_to_milvus,
)


class MilvusService:
    def __init__(self):
        self.milvus_client = get_face_milvus_client()

    def save_face_embedding(
        self,
        embedding: List[float],
    ) -> str:
        """Save a single face embedding to Milvus and return milvus_id"""
        return save_face_to_milvus(embedding)
