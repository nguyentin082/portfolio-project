import asyncio
import sys
import os

# Add the parent directory to the path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from integrates.mongo import get_client
from bson import ObjectId
from datetime import datetime


async def test_mongodb_connection():
    """Test MongoDB connection and basic operations"""
    print("🧪 Testing MongoDB Connection...")
    print("=" * 50)

    try:
        # Get MongoDB client
        client = get_client()
        print("✅ MongoDB client obtained successfully")

        # Test connection by pinging the server
        client.client.admin.command("ping")
        print("✅ MongoDB server ping successful")

        # List all databases
        databases = client.client.list_database_names()
        print(f"📋 Available databases: {databases}")

        # Get current database name
        current_db = client.db.name
        print(f"🎯 Current database: {current_db}")

        # List all collections in current database
        collections = client.db.list_collection_names()
        print(f"📚 Available collections: {collections}")

        return True

    except Exception as e:
        print(f"❌ MongoDB connection failed: {str(e)}")
        return False


async def test_images_collection():
    """Test images collection specifically"""
    print("\n🖼️  Testing Images Collection...")
    print("=" * 50)

    try:
        client = get_client()
        collection_name = "images"

        # Check if images collection exists
        if collection_name not in client.db.list_collection_names():
            print(f"⚠️  Collection '{collection_name}' does not exist")
            return False

        # Count total documents
        total_count = client.db[collection_name].count_documents({})
        print(f"📊 Total documents in '{collection_name}': {total_count}")

        if total_count == 0:
            print("⚠️  No documents found in images collection")
            return False

        # Get first 5 documents
        print(f"\n📝 First 5 documents:")
        documents = list(client.find(collection_name, {}).limit(5))

        for i, doc in enumerate(documents, 1):
            print(f"  {i}. ID: {doc['_id']}")
            print(f"     File Key: {doc.get('fileKey', 'N/A')}")
            print(f"     User ID: {doc.get('userId', 'N/A')}")
            print(f"     Playground ID: {doc.get('playgroundId', 'N/A')}")
            print(f"     Faces Count: {len(doc.get('faces', []))}")
            print(f"     Created: {doc.get('createdAt', 'N/A')}")
            print()

        return True

    except Exception as e:
        print(f"❌ Images collection test failed: {str(e)}")
        return False


async def test_specific_image_query(image_id: str = None):
    """Test querying a specific image"""
    print(f"\n🔍 Testing Specific Image Query...")
    print("=" * 50)

    try:
        client = get_client()
        collection_name = "images"

        # If no image_id provided, get the first one
        if not image_id:
            first_doc = client.find_one(collection_name, {})
            if not first_doc:
                print("❌ No documents found to test with")
                return False
            image_id = str(first_doc["_id"])
            print(f"🎯 Using first document ID: {image_id}")

        # Validate ObjectId format
        if not ObjectId.is_valid(image_id):
            print(f"❌ Invalid ObjectId format: {image_id}")
            return False

        print(f"🔍 Searching for image: {image_id}")

        # Query the specific image
        image_doc = client.find_one(collection_name, {"_id": ObjectId(image_id)})

        if image_doc:
            print("✅ Image found!")
            print(f"   ID: {image_doc['_id']}")
            print(f"   File Key: {image_doc.get('fileKey', 'N/A')}")
            print(f"   User ID: {image_doc.get('userId', 'N/A')}")
            print(f"   Playground ID: {image_doc.get('playgroundId', 'N/A')}")
            print(f"   Faces: {image_doc.get('faces', [])}")
            print(f"   Created: {image_doc.get('createdAt', 'N/A')}")
            print(f"   Updated: {image_doc.get('updatedAt', 'N/A')}")
            return True
        else:
            print(f"❌ Image not found with ID: {image_id}")
            return False

    except Exception as e:
        print(f"❌ Specific image query failed: {str(e)}")
        return False


async def test_crud_operations():
    """Test basic CRUD operations"""
    print(f"\n🔧 Testing CRUD Operations...")
    print("=" * 50)

    try:
        client = get_client()
        collection_name = "images"

        # Test CREATE
        print("📝 Testing CREATE operation...")
        test_doc = {
            "userId": "test_user_123",
            "fileKey": f"test-image-{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg",
            "playgroundId": "test_playground_123",
            "faces": [],
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        }

        result = client.insert_one(collection_name, test_doc)
        test_id = result.inserted_id
        print(f"✅ Document created with ID: {test_id}")

        # Test READ
        print("📖 Testing READ operation...")
        read_doc = client.find_one(collection_name, {"_id": test_id})
        if read_doc:
            print(f"✅ Document read successfully: {read_doc['fileKey']}")
        else:
            print("❌ Failed to read created document")
            return False

        # Test UPDATE
        print("✏️  Testing UPDATE operation...")
        update_result = client.update_one(
            collection_name,
            {"_id": test_id},
            {
                "$set": {
                    "faces": [{"name": "test_face"}],
                    "updatedAt": datetime.utcnow(),
                }
            },
        )
        if update_result.modified_count > 0:
            print("✅ Document updated successfully")
        else:
            print("❌ Failed to update document")

        # Test DELETE
        print("🗑️  Testing DELETE operation...")
        delete_result = client.delete_one(collection_name, {"_id": test_id})
        if delete_result.deleted_count > 0:
            print("✅ Document deleted successfully")
        else:
            print("❌ Failed to delete document")

        return True

    except Exception as e:
        print(f"❌ CRUD operations test failed: {str(e)}")
        return False


async def main():
    """Main test function"""
    print("🚀 MongoDB Connection Test Suite")
    print("=" * 50)

    # Test basic connection
    connection_ok = await test_mongodb_connection()
    if not connection_ok:
        print("\n💥 Basic connection failed. Please check your MongoDB configuration.")
        return

    # Test images collection
    images_ok = await test_images_collection()
    if not images_ok:
        print("\n⚠️  Images collection issues detected.")

    # Test specific image query
    query_ok = await test_specific_image_query()
    if not query_ok:
        print("\n⚠️  Specific image query issues detected.")

    # Test CRUD operations
    crud_ok = await test_crud_operations()
    if not crud_ok:
        print("\n⚠️  CRUD operations issues detected.")

    # Summary
    print("\n📊 Test Summary:")
    print("=" * 50)
    print(f"✅ Connection: {'PASS' if connection_ok else 'FAIL'}")
    print(f"✅ Images Collection: {'PASS' if images_ok else 'FAIL'}")
    print(f"✅ Query Operations: {'PASS' if query_ok else 'FAIL'}")
    print(f"✅ CRUD Operations: {'PASS' if crud_ok else 'FAIL'}")

    if all([connection_ok, images_ok, query_ok, crud_ok]):
        print("\n🎉 All tests passed! MongoDB is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Please check the issues above.")


if __name__ == "__main__":
    # Run the test
    asyncio.run(main())
