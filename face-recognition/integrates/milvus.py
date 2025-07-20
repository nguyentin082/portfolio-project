import os
import sys
import json
import uuid
import numpy as np
from typing import List, Dict, Any, Optional
from datetime import datetime

from core.config import (
    MILVUS_CLOUD_ENDPOINT,
    MILVUS_CLOUD_TOKEN,
)

try:
    from pymilvus import (
        connections,
        Collection,
        utility,
        FieldSchema,
        CollectionSchema,
        DataType,
    )

    MILVUS_AVAILABLE = True
except ImportError as e:
    MILVUS_AVAILABLE = False
    print(f"Import warning: {e}")

MILVUS_CLOUD_COLLECTION_NAME = "face_recognition"
EMBEDDING_DIM = 512  # InsightFace embedding dimension


class MilvusClient:
    def __init__(self):
        self.collection_name = MILVUS_CLOUD_COLLECTION_NAME
        self.collection = None
        self.connected = False

        if not MILVUS_AVAILABLE:
            raise ImportError("pymilvus not available - check installation")

    def _ensure_collection(self):
        """Ensure collection exists and is loaded"""
        if not utility.has_collection(self.collection_name):
            self._create_collection()
        else:
            self.collection = Collection(self.collection_name)
            self.collection.load()

    def _create_collection(self):
        """Create new collection with schema and index"""
        fields = [
            FieldSchema(
                name="id", dtype=DataType.VARCHAR, max_length=100, is_primary=True
            ),
            FieldSchema(
                name="embedding", dtype=DataType.FLOAT_VECTOR, dim=EMBEDDING_DIM
            ),
        ]

        schema = CollectionSchema(
            fields=fields, description="Face embeddings for recognition"
        )

        # Create collection
        self.collection = Collection(name=self.collection_name, schema=schema)

        # Create index for vector search
        index_params = {
            "metric_type": "COSINE",
            "index_type": "IVF_FLAT",
            "params": {"nlist": 1024},
        }

        self.collection.create_index(field_name="embedding", index_params=index_params)

        self.collection.load()

    def _connect(self):
        """Connect to Milvus cloud"""
        connections.connect(
            uri=MILVUS_CLOUD_ENDPOINT,
            token=MILVUS_CLOUD_TOKEN,
            secure=True,
        )
        self.connected = True

    def _ensure_ready(self):
        """Ensure client is connected and collection is ready"""
        if not self.connected:
            self._connect()

        if not self.collection:
            self._ensure_collection()

    def force_create_collection(self):
        """Force create collection even if it exists"""
        try:
            # Drop existing collection if it exists
            if utility.has_collection(self.collection_name):
                utility.drop_collection(self.collection_name)

            self._create_collection()
            print(f"Collection {self.collection_name} created successfully")
        except Exception as e:
            print(f"Error force creating collection: {e}")
            raise e

    def save_face_embedding(self, embedding: List[float]) -> str:
        """Save face embedding to Milvus"""
        try:
            self._ensure_ready()

            # Generate unique ID for this face
            face_id = str(uuid.uuid4())

            # Prepare data for insertion
            entities = [
                [face_id],  # id
                [embedding],  # embedding
            ]

            # Insert data
            self.collection.insert(entities)
            self.collection.flush()

            return face_id

        except Exception as e:
            # If collection not found error, try to recreate
            if "collection not found" in str(e).lower():
                print(f"Collection not found, attempting to create: {e}")
                try:
                    self.collection = None  # Reset collection
                    self._ensure_collection()  # Recreate collection

                    # Retry insertion
                    face_id = str(uuid.uuid4())
                    entities = [[face_id], [embedding]]
                    self.collection.insert(entities)
                    self.collection.flush()

                    return face_id
                except Exception as retry_error:
                    print(f"Retry failed: {retry_error}")
                    raise retry_error
            else:
                print(f"Save embedding error: {e}")
                raise e

    def search_similar_faces(
        self, embedding: List[float], limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Search for similar face embeddings"""
        try:
            self._ensure_ready()

            search_params = {"metric_type": "COSINE", "params": {"nprobe": 16}}

            results = self.collection.search(
                data=[embedding],
                anns_field="embedding",
                param=search_params,
                limit=limit,
                output_fields=["id"],
            )

            # Format results
            similar_faces = []
            for hit in results[0]:
                similar_faces.append(
                    {
                        "id": hit.entity.get("id"),
                        "distance": hit.distance,
                        "score": 1.0
                        - hit.distance,  # Convert distance to similarity score
                    }
                )

            return similar_faces

        except Exception as e:
            # If collection not found error, try to recreate
            if "collection not found" in str(e).lower():
                print(f"Collection not found during search, attempting to create: {e}")
                self.collection = None  # Reset collection
                self._ensure_collection()  # Recreate collection
                return []  # Return empty results for newly created collection
            else:
                print(f"Search error: {e}")
                raise e


# Global client instance
milvus_client = None


def get_face_milvus_client():
    """Get the global Milvus client instance with lazy initialization"""
    global milvus_client
    if milvus_client is None:
        milvus_client = MilvusClient()
    return milvus_client


def save_face_to_milvus(embedding: List[float]) -> str:
    """Convenience function to save face embedding"""
    client = get_face_milvus_client()
    return client.save_face_embedding(embedding)


def search_similar_faces_in_milvus(
    embedding: List[float], limit: int = 5
) -> List[Dict[str, Any]]:
    """Convenience function to search for similar faces"""
    client = get_face_milvus_client()
    return client.search_similar_faces(embedding, limit)
