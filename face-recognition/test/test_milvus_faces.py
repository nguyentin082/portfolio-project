#!/usr/bin/env python3
"""
Test script for Milvus face recognition integration
"""

import sys
import os
import asyncio
import json
from typing import Dict, List

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from services.milvus_face_service import get_face_recognition_service
from integrates.milvus import get_face_milvus_client
import numpy as np


async def test_milvus_connection():
    """Test Milvus connection"""
    print("🔗 Testing Milvus Connection...")
    print("=" * 50)

    try:
        client = get_face_milvus_client()
        if client.connected:
            print("✅ Milvus connected successfully")
            print(f"📊 Collection: {client.collection_name}")
            return True
        else:
            print("❌ Milvus connection failed")
            return False
    except Exception as e:
        print(f"❌ Milvus connection error: {e}")
        return False


def create_sample_face_data() -> Dict:
    """Create sample face data for testing"""
    # Create sample data similar to InsightFace output
    sample_face = {
        "bbox": np.array([897.22, 343.30, 940.63, 401.90], dtype=np.float32),
        "kps": np.array(
            [
                [908.6, 364.9],
                [929.7, 364.4],
                [919.3, 374.7],
                [910.5, 386.1],
                [927.9, 385.7],
            ],
            dtype=np.float32,
        ),
        "det_score": np.float32(0.89),
        "embedding": np.random.randn(512).astype(
            np.float32
        ),  # Random 512-dim embedding
    }
    return sample_face


async def test_save_face():
    """Test saving face to Milvus"""
    print("\n💾 Testing Face Saving...")
    print("=" * 50)

    try:
        service = get_face_recognition_service()
        sample_face = create_sample_face_data()

        # Test saving face
        face_id = await service.milvus_client.save_face_embedding(
            face_data=sample_face,
            image_id="test_image_123",
            person_id="test_person_1",
            person_name="John Doe",
        )

        print(f"✅ Face saved successfully with ID: {face_id}")
        return face_id

    except Exception as e:
        print(f"❌ Error saving face: {e}")
        return None


async def test_search_faces():
    """Test searching similar faces"""
    print("\n🔍 Testing Face Search...")
    print("=" * 50)

    try:
        service = get_face_recognition_service()

        # Create query embedding (similar to saved face)
        query_embedding = np.random.randn(512).tolist()

        # Search for similar faces
        results = await service.search_person_faces(query_embedding)

        print(f"✅ Search completed. Found {len(results)} similar faces")
        for i, face in enumerate(results):
            print(
                f"  {i+1}. {face['person_name']} (similarity: {face['similarity_score']:.3f})"
            )

        return results

    except Exception as e:
        print(f"❌ Error searching faces: {e}")
        return []


async def test_face_recognition_workflow():
    """Test complete face recognition workflow"""
    print("\n🤖 Testing Complete Face Recognition Workflow...")
    print("=" * 50)

    try:
        service = get_face_recognition_service()

        # Create sample faces data (multiple faces)
        faces_data = [
            create_sample_face_data(),
            create_sample_face_data(),
            create_sample_face_data(),
        ]

        # Process faces
        results = await service.process_detected_faces(
            faces_data=faces_data, image_id="workflow_test_image"
        )

        print(f"✅ Workflow completed successfully")
        print(f"📊 Total faces: {results['total_faces']}")
        print(f"👥 Recognized faces: {len(results['recognized_faces'])}")
        print(f"🆕 New faces: {len(results['new_faces'])}")

        return results

    except Exception as e:
        print(f"❌ Error in workflow: {e}")
        return None


async def test_person_registration():
    """Test registering a new person"""
    print("\n👤 Testing Person Registration...")
    print("=" * 50)

    try:
        service = get_face_recognition_service()
        sample_face = create_sample_face_data()

        # Register new person
        face_id = await service.register_new_person(
            face_data=sample_face,
            image_id="registration_test_image",
            person_name="Jane Smith",
        )

        print(f"✅ Person registered successfully with face ID: {face_id}")
        return face_id

    except Exception as e:
        print(f"❌ Error registering person: {e}")
        return None


async def run_all_tests():
    """Run all Milvus tests"""
    print("🧪 Milvus Face Recognition Test Suite")
    print("=" * 60)

    # Test 1: Connection
    connection_ok = await test_milvus_connection()
    if not connection_ok:
        print("❌ Cannot proceed without Milvus connection")
        return

    # Test 2: Save face
    saved_face_id = await test_save_face()

    # Test 3: Search faces
    search_results = await test_search_faces()

    # Test 4: Person registration
    registered_face_id = await test_person_registration()

    # Test 5: Complete workflow
    workflow_results = await test_face_recognition_workflow()

    # Summary
    print("\n📋 Test Summary")
    print("=" * 60)
    print(f"✅ Connection: {'PASS' if connection_ok else 'FAIL'}")
    print(f"✅ Save Face: {'PASS' if saved_face_id else 'FAIL'}")
    print(f"✅ Search Faces: {'PASS' if search_results else 'FAIL'}")
    print(f"✅ Register Person: {'PASS' if registered_face_id else 'FAIL'}")
    print(f"✅ Complete Workflow: {'PASS' if workflow_results else 'FAIL'}")


if __name__ == "__main__":
    asyncio.run(run_all_tests())
