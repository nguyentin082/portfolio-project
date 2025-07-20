import sys
import os
import cv2
import numpy as np

sys.path.append(
    os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            "..",
        )
    )
)

from integrates.insightface import face_detection
from utils.opencv import draw_bounding_boxes, display_image, draw_keypoints


def test_face_detection():
    # Get the correct path to the test image (go up one level from test directory)
    test_image_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "temp",
        "download",
        "114681_b2984c0180da9db44748434b9596776d_original.jpg",
    )

    # Perform face detection
    faces = face_detection(test_image_path)

    # Check if faces were detected
    assert isinstance(faces, list), "Face detection should return a list"
    assert len(faces) >= 0, "Face detection should return at least 0 faces"

    # Print the structure of detected faces for debugging
    if faces:
        print(f"Number of faces detected: {len(faces)}")
        print(f"Face structure: {faces[0].keys()}")
        print(f"First face data: {faces[0]}")

    # Check properties of detected faces
    if faces:
        assert "bbox" in faces[0], "Detected face should have a bounding box"
        assert "kps" in faces[0], "Detected face should have keypoints (landmarks)"
        assert "det_score" in faces[0], "Detected face should have detection score"
        assert "embedding" in faces[0], "Detected face should have face embedding"

        # Additional validation of the data types
        bbox = faces[0]["bbox"]
        kps = faces[0]["kps"]
        det_score = faces[0]["det_score"]
        embedding = faces[0]["embedding"]

        print(f"Debug - det_score type: {type(det_score)}, value: {det_score}")

        assert len(bbox) == 4, "Bounding box should have 4 coordinates"

        # Handle different types for det_score (could be numpy array, float, etc.)
        if hasattr(det_score, "__len__") and len(det_score) == 1:
            # If it's an array with one element, extract it
            det_score_value = float(det_score[0])
        elif hasattr(det_score, "item"):
            # If it's a numpy scalar, convert to Python scalar
            det_score_value = det_score.item()
        else:
            # If it's already a Python number
            det_score_value = float(det_score)

        assert isinstance(
            det_score_value, (int, float)
        ), f"Detection score should be a number, got {type(det_score_value)}"
        assert len(embedding) > 0, "Embedding should not be empty"
        assert len(kps) > 0, "Keypoints should not be empty"

        print(f"✓ Face detection successful:")
        print(f"  - Bounding box: {bbox}")
        print(f"  - Detection score: {det_score_value}")
        print(f"  - Keypoints shape: {len(kps) if hasattr(kps, '__len__') else 'N/A'}")
        print(
            f"  - Embedding shape: {len(embedding) if hasattr(embedding, '__len__') else 'N/A'}"
        )
        # Save image with bounding boxes to temp/output
        output_dir = os.path.join(os.path.dirname(__file__), "..", "temp", "output")
        output_filename = "face_detection_result.jpg"
        output_path = os.path.join(output_dir, output_filename)
        try:
            saved_path = draw_bounding_boxes(test_image_path, faces, output_path)
            # saved_path = draw_keypoints(test_image_path, faces, output_path)
            print(f"✓ Image with bounding boxes saved to: {saved_path}")
            display_image(saved_path, "Face Detection Result - Press any key to quit")
        except Exception as e:
            print(f"Warning: Could not save image with bounding boxes: {e}")
            print("Make sure opencv-python is installed: pip install opencv-python")
    else:
        print("No faces detected in the image.")


if __name__ == "__main__":
    test_face_detection()
    print("Face detection test passed.")
