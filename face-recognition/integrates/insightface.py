import insightface
from insightface.app import FaceAnalysis
import cv2
from pymilvus import Collection, FieldSchema, CollectionSchema, DataType, connections

model = FaceAnalysis(
    name="buffalo_l",
    providers=["CUDAExecutionProvider", "CPUExecutionProvider"],
    root=".",
    allowed_modules=["detection", "recognition"],
)


def face_detection(image_path: str) -> list:
    """Face detection using InsightFace with proper data conversion"""
    try:
        model.prepare(ctx_id=0, det_size=(640, 640))
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Image not found or cannot be read: {image_path}")

        # Get faces from InsightFace
        faces = model.get(img)

        # Convert numpy arrays to JSON-serializable format
        serializable_faces = []
        for face in faces:
            face_data = {}
            for key, value in face.items():
                if hasattr(value, "tolist"):  # numpy array
                    face_data[key] = value.tolist()
                elif hasattr(value, "item"):  # numpy scalar
                    face_data[key] = value.item()
                else:
                    face_data[key] = value
            serializable_faces.append(face_data)

        return serializable_faces

    except Exception as e:
        raise e
