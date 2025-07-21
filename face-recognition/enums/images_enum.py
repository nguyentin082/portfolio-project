from enum import Enum


class ImageStatusEnum(str, Enum):
    UPLOADED = "uploaded"
    DETECTED = "detected"
    RECOGNIZED = "recognized"
    FAILED = "failed"
