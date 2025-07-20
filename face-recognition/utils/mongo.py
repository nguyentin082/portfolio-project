from integrates.mongo import get_client
from bson.objectid import ObjectId

COLLECTION_NAME = "images"


def create_image_record(image_data: dict):
    client = get_client()
    result = client.insert_one(COLLECTION_NAME, image_data)
    return str(result.inserted_id)


def get_image_record_by_id(image_id: str):
    client = get_client()
    result = client.find_one(COLLECTION_NAME, {"_id": ObjectId(image_id)})
    return result


def update_image_record(image_id: str, update_data: dict):
    client = get_client()
    result = client.update_one(
        COLLECTION_NAME, {"_id": ObjectId(image_id)}, {"$set": update_data}
    )
    return result.modified_count > 0


def delete_image_record(image_id: str):
    client = get_client()
    result = client.delete_one(COLLECTION_NAME, {"_id": ObjectId(image_id)})
    return result.deleted_count > 0
