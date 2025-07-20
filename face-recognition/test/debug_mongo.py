"""
Quick MongoDB debug script
Run this to quickly check your MongoDB connection and find image IDs
"""

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from integrates.mongo import get_client
from bson import ObjectId


def quick_debug():
    print("🔍 Quick MongoDB Debug")
    print("=" * 30)

    try:
        # Get client
        client = get_client()
        print("✅ Client connected")

        # Check database
        db_name = client.db.name
        print(f"📍 Database: {db_name}")

        # Check collections
        collections = client.db.list_collection_names()
        print(f"📚 Collections: {collections}")

        # Check images collection
        if "images" in collections:
            count = client.db["images"].count_documents({})
            print(f"🖼️  Images count: {count}")

            if count > 0:
                # Get first 3 images
                print("\n📋 Sample images:")
                docs = list(client.find("images", {}).limit(3))
                for i, doc in enumerate(docs, 1):
                    print(f"  {i}. {doc['_id']} -> {doc.get('fileKey', 'No fileKey')}")

                # Test with first ID
                first_id = str(docs[0]["_id"])
                print(f"\n🎯 Testing with ID: {first_id}")

                # Test ObjectId conversion
                try:
                    obj_id = ObjectId(first_id)
                    print(f"✅ ObjectId valid: {obj_id}")

                    # Test query
                    result = client.find_one("images", {"_id": obj_id})
                    if result:
                        print(
                            f"✅ Query successful: {result.get('fileKey', 'No fileKey')}"
                        )
                    else:
                        print("❌ Query returned None")

                except Exception as e:
                    print(f"❌ ObjectId error: {e}")
            else:
                print("📭 No images found")
        else:
            print("❌ 'images' collection not found")

    except Exception as e:
        print(f"💥 Error: {e}")


if __name__ == "__main__":
    quick_debug()
