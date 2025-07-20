import cv2
import os
import numpy as np


def draw_bounding_boxes(image_path, faces, output_path):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Could not read image: {image_path}")
    # Draw bounding boxes for each detected face
    for i, face in enumerate(faces):
        bbox = face["bbox"]
        det_score = face["det_score"]
        # Handle different types for det_score
        if hasattr(det_score, "__len__") and len(det_score) == 1:
            score_value = float(det_score[0])
        elif hasattr(det_score, "item"):
            score_value = det_score.item()
        else:
            score_value = float(det_score)

        # Convert bbox to integers
        x1, y1, x2, y2 = [int(coord) for coord in bbox]
        # Draw rectangle (bounding box)
        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 5)
        # Draw confidence score
        label = f"Face {i+1}: {score_value:.3f}"
        cv2.putText(
            image, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2
        )
        # Draw keypoints if available
        if "kps" in face and len(face["kps"]) > 0:
            kps = face["kps"]
            try:
                kps_array = np.array(kps)
                if kps_array.ndim == 1:
                    kps_array = kps_array.reshape(-1, 2)
                # Draw keypoints
                for kp in kps_array:
                    if len(kp) >= 2:
                        cv2.circle(image, (int(kp[0]), int(kp[1])), 2, (255, 0, 0), -1)
            except Exception as e:
                print(f"Could not draw keypoints: {e}")

    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    # Save the image with bounding boxes
    success = cv2.imwrite(output_path, image)
    if not success:
        raise ValueError(f"Could not save image to: {output_path}")

    return output_path


def display_image(image_path, window_title="Image - Press any key to quit"):
    try:
        # Read and display the saved image
        result_image = cv2.imread(image_path)
        if result_image is not None:
            # Create window and display image
            cv2.imshow(window_title, result_image)
            print("Press any key in the image window to close...")
            # Wait for key press, then close the window
            cv2.waitKey(0)
            cv2.destroyAllWindows()
            print("Image window closed.")
            return True
        else:
            print("Could not load the image for display")
            return False
    except Exception as display_error:
        print(f"Could not display image: {display_error}")
        print("Image saved but display failed - you can view it manually")
        return False


def draw_keypoints(image_path, faces, output_path):
    try:
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not read image: {image_path}")

        for idx, face in enumerate(faces):
            kps = face.get("kps")

            if isinstance(kps, np.ndarray) and kps.shape == (5, 2):
                for i, (x, y) in enumerate(kps):
                    cv2.circle(image, (int(x), int(y)), 6, (0, 0, 255), -1)
                    cv2.putText(
                        image,
                        str(i + 1),
                        (int(x) + 3, int(y) - 3),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.4,
                        (255, 0, 0),
                        1,
                    )
            else:
                print(
                    f"[Warn] Face {idx} has invalid keypoints: {type(kps)}, shape: {getattr(kps, 'shape', 'N/A')}"
                )
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        success = cv2.imwrite(output_path, image)
        if not success:
            raise ValueError(f"Could not save image to: {output_path}")

        return output_path

    except Exception as e:
        print(f"[Error] draw_keypoints failed: {e}")
        return None
