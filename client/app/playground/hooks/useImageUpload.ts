import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUploadImageWithProgress } from '@/apis/upload/upload.api';
import { useCreateImage } from '@/apis/images/images.api';
import { ImageData, DetectedFace, PlaygroundSession } from '../types';
import { FACE_RECOG_URL } from '../constants';

interface UseImageUploadProps {
    currentSession: PlaygroundSession | null;
    setUploadedImages: React.Dispatch<React.SetStateAction<ImageData[]>>;
    refetchImages: () => void;
}

export const useImageUpload = ({
    currentSession,
    setUploadedImages,
    refetchImages,
}: UseImageUploadProps) => {
    const { toast } = useToast();
    const [uploadProgress, setUploadProgress] = useState<{
        [key: string]: number;
    }>({});
    const [loadingImages, setLoadingImages] = useState(false);

    const uploadImageMutation = useUploadImageWithProgress();
    const createImageMutation = useCreateImage();

    const detectFaces = async (imageId: string): Promise<DetectedFace[]> => {
        try {
            const response = await fetch(`${FACE_RECOG_URL}/api/face/detect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image_id: imageId,
                }),
            });

            if (!response.ok) {
                throw new Error(
                    `Face detection failed: ${response.statusText}`
                );
            }

            const data = await response.json();

            const faces: DetectedFace[] = (data.faces || []).map(
                (face: any) => ({
                    id: face.id || face.milvusId || `face_${Date.now()}`,
                    milvusId: face.milvusId,
                    bbox: {
                        x: face.bbox?.[0] || 0,
                        y: face.bbox?.[1] || 0,
                        width: face.bbox?.[2] || 0,
                        height: face.bbox?.[3] || 0,
                    },
                    confidence: face.confidence || 0.9,
                    name: face.name || face.personId,
                })
            );

            console.log(
                `Face detection completed for image ${imageId}:`,
                faces
            );
            return faces;
        } catch (error) {
            console.error('Error detecting faces:', error);

            // Fallback to mock data for development
            console.warn('Using mock face data due to API error');
            await new Promise((resolve) => setTimeout(resolve, 2000));

            return [
                {
                    id: 'mock_face_1',
                    milvusId:
                        'milvus_' + Math.random().toString(36).substr(2, 9),
                    bbox: { x: 100, y: 80, width: 120, height: 150 },
                    confidence: 0.95,
                },
                {
                    id: 'mock_face_2',
                    milvusId:
                        'milvus_' + Math.random().toString(36).substr(2, 9),
                    bbox: { x: 300, y: 120, width: 110, height: 140 },
                    confidence: 0.87,
                },
            ];
        }
    };

    const loadPlaygroundImages = async (playgroundId: string) => {
        setLoadingImages(true);
        try {
            await refetchImages();
        } catch (error) {
            console.error('Error loading playground images:', error);
        }
        setLoadingImages(false);
    };

    const handleImageUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file || !currentSession) return;

        const imageId = Math.random().toString(36).substr(2, 9);
        const newImage: ImageData = {
            id: imageId,
            url: '',
            supabaseUrl: '',
            faces: [],
            status: 'uploading',
            createdAt: new Date().toISOString(),
        };

        setUploadedImages((prev) => [newImage, ...prev]);
        setUploadProgress((prev) => ({ ...prev, [imageId]: 0 }));

        try {
            // Step 1: Upload image to Supabase
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => ({
                    ...prev,
                    [imageId]: Math.min(
                        (prev[imageId] || 0) + Math.random() * 20,
                        90
                    ),
                }));
            }, 200);

            const uploadResult = await uploadImageMutation.mutateAsync(file);
            clearInterval(progressInterval);
            setUploadProgress((prev) => ({ ...prev, [imageId]: 100 }));

            if (!uploadResult.success || !uploadResult.data) {
                throw new Error('Failed to upload image to Supabase');
            }

            // Step 2: Add image record to database
            const imageRecord = await createImageMutation.mutateAsync({
                playgroundId: currentSession.id,
                fileKey: uploadResult.data.fileKey,
                url: uploadResult.data.publicUrl,
                supabaseUrl: uploadResult.data.publicUrl,
                status: 'detecting',
            });

            if (!imageRecord.success) {
                throw new Error('Failed to create image record');
            }

            const dbImageId = imageRecord.data.id;

            // Update local state with detecting status
            setUploadedImages((prev) =>
                prev.map((img) =>
                    img.id === imageId
                        ? {
                              ...img,
                              id: dbImageId,
                              url: uploadResult.data.publicUrl,
                              supabaseUrl: uploadResult.data.publicUrl,
                              fileKey: uploadResult.data.fileKey,
                              status: 'detecting',
                          }
                        : img
                )
            );

            // Step 3: Face Detection
            const detectedFaces = await detectFaces(dbImageId);

            // Step 4: Refetch and cleanup
            await refetchImages();

            setTimeout(() => {
                setUploadedImages((prev) =>
                    prev.filter((img) => img.id !== dbImageId)
                );
            }, 1000);

            setTimeout(() => {
                setUploadProgress((prev) => {
                    const { [imageId]: _, ...rest } = prev;
                    return rest;
                });
            }, 1500);

            toast({
                title: 'Success',
                description: `Image processed! Detected ${detectedFaces.length} face(s)`,
            });
        } catch (error: any) {
            console.error('Upload failed:', error);
            setUploadedImages((prev) =>
                prev.map((img) =>
                    img.id === imageId ? { ...img, status: 'error' } : img
                )
            );
            setUploadProgress((prev) => {
                const { [imageId]: _, ...rest } = prev;
                return rest;
            });
            toast({
                title: 'Error',
                description: error.message || 'Failed to process image',
                variant: 'destructive',
            });
        }
    };

    return {
        uploadProgress,
        loadingImages,
        handleImageUpload,
        loadPlaygroundImages,
    };
};
