from integrates.mongo import get_client
from bson import ObjectId
from fastapi import HTTPException
from datetime import datetime

COLLECTION_NAME = "images"


async def get_image_data(id: str):
    try:
        # Get MongoDB client
        client = get_client()

        # Validate ObjectId format
        if not ObjectId.is_valid(id):
            raise HTTPException(status_code=400, detail="Invalid image ID format")

        # Query image from images collection
        image_doc = client.find_one(COLLECTION_NAME, {"_id": ObjectId(id)})
        print(f"Retrieved image document: {image_doc}")

        if not image_doc:
            raise HTTPException(status_code=404, detail="Image not found")

        # Convert ObjectId to string for JSON serialization
        image_doc["_id"] = str(image_doc["_id"])

        # Return image data with fileKey
        return {
            "id": image_doc["_id"],
            "file_key": image_doc.get("fileKey"),
            "user_id": image_doc.get("userId"),
            "playground_id": image_doc.get("playgroundId"),
            "faces": image_doc.get("faces", []),
            "created_at": image_doc.get("createdAt"),
            "updated_at": image_doc.get("updatedAt"),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


async def update_image_faces(id: str, milvus_id: str, face_data: dict):
    try:
        # Get MongoDB client
        client = get_client()

        # Validate ObjectId format
        if not ObjectId.is_valid(id):
            raise HTTPException(status_code=400, detail="Invalid image ID format")

        # Get existing document first
        existing_doc = client.find_one(COLLECTION_NAME, {"_id": ObjectId(id)})
        if not existing_doc:
            raise HTTPException(status_code=404, detail="Image not found")

        # Get existing faces or empty list
        existing_faces = existing_doc.get("faces", [])

        # Update specific face by milvusId
        updated_faces = update_face_by_milvus_id(existing_faces, milvus_id, face_data)

        # Update faces data
        result = client.update_one(
            COLLECTION_NAME,
            {"_id": ObjectId(id)},
            {"$set": {"faces": updated_faces, "updatedAt": datetime.utcnow()}},
        )

        return {
            "success": True,
            "modified_count": result.modified_count,
            "faces_count": len(updated_faces),
            "updated_milvus_id": milvus_id,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database update error: {str(e)}")


def update_face_by_milvus_id(
    existing_faces: list, milvus_id: str, face_data: dict
) -> list:
    """
    Update a specific face by milvusId.
    If milvusId exists, update that face with new data.
    If milvusId doesn't exist, add as new face.
    """
    # Create a copy of existing faces
    updated = existing_faces.copy()

    # Find existing face with same milvusId
    existing_index = None
    for i, existing_face in enumerate(updated):
        if existing_face.get("milvusId") == milvus_id:
            existing_index = i
            break

    # Ensure milvusId is in the face_data
    face_data["milvusId"] = milvus_id

    if existing_index is not None:
        # Merge existing face with new data
        updated[existing_index] = {**updated[existing_index], **face_data}
    else:
        # Add new face if milvusId not found
        updated.append(face_data)

    return updated


async def create_image_record(user_id: str, file_key: str, playground_id: str):
    try:
        # Get MongoDB client
        client = get_client()

        # Create image document
        image_doc = {
            "userId": user_id,
            "fileKey": file_key,
            "playgroundId": playground_id,
            "faces": [],
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        }

        # Insert into database
        result = client.insert_one(COLLECTION_NAME, image_doc)

        # Return created document with ID
        return {
            "id": str(result.inserted_id),
            "file_key": file_key,
            "user_id": user_id,
            "playground_id": playground_id,
            "faces": [],
            "created_at": image_doc["createdAt"],
            "updated_at": image_doc["updatedAt"],
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database create error: {str(e)}")
