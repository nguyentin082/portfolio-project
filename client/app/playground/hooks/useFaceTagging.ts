import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUpdateFace } from '@/apis/images/images.api';
import { FaceTaggingState, ImageData } from '../types';

interface UseFaceTaggingProps {
    setUploadedImages: React.Dispatch<React.SetStateAction<ImageData[]>>;
    uploadedImages: ImageData[];
    currentSession: any;
}

export const useFaceTagging = ({
    setUploadedImages,
    uploadedImages,
    currentSession,
}: UseFaceTaggingProps) => {
    const { toast } = useToast();
    const [faceTagging, setFaceTagging] = useState<FaceTaggingState>({
        imageId: '',
        faceId: '',
        isOpen: false,
        recommendations: [],
        loading: false,
    });
    const [tagInput, setTagInput] = useState('');

    const updateFaceMutation = useUpdateFace();

    const getFaceRecommendations = async (
        imageId: string,
        milvusId: string
    ): Promise<string[]> => {
        try {
            // Mock implementation for now
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const mockNames = [
                'John Smith',
                'Sarah Johnson',
                'Michael Brown',
                'Emma Wilson',
                'David Lee',
            ];
            return mockNames.slice(0, Math.floor(Math.random() * 3) + 2);
        } catch (error) {
            console.error('Error getting face recommendations:', error);
            return [];
        }
    };

    const updateFaceInfo = async (
        imageId: string,
        milvusId: string,
        name: string
    ) => {
        try {
            const response = await updateFaceMutation.mutateAsync({
                imageId,
                milvusId,
                data: {
                    personId: name,
                    name: name,
                },
            });

            console.log(
                `Face info updated for image ${imageId}, milvus ${milvusId}:`,
                name
            );
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Error updating face info:', error);
            return null;
        }
    };

    const startFaceTagging = async (imageId: string, milvusId: string) => {
        setFaceTagging({
            imageId,
            faceId: milvusId,
            isOpen: true,
            recommendations: [],
            loading: true,
        });

        const recommendations = await getFaceRecommendations(imageId, milvusId);
        setFaceTagging((prev) => ({
            ...prev,
            recommendations,
            loading: false,
        }));
    };

    const handleTagFace = async (
        imageId: string,
        milvusId: string,
        name: string
    ) => {
        try {
            await updateFaceInfo(imageId, milvusId, name);

            setUploadedImages((prev) =>
                prev.map((img) =>
                    img.id === imageId
                        ? {
                              ...img,
                              faces: img.faces.map((face) =>
                                  face.milvusId === milvusId
                                      ? { ...face, name }
                                      : face
                              ),
                          }
                        : img
                )
            );

            setFaceTagging({
                imageId: '',
                faceId: '',
                isOpen: false,
                recommendations: [],
                loading: false,
            });
            setTagInput('');

            toast({
                title: 'Success',
                description: `Tagged face as "${name}"`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to tag face',
                variant: 'destructive',
            });
        }
    };

    return {
        faceTagging,
        setFaceTagging,
        tagInput,
        setTagInput,
        startFaceTagging,
        handleTagFace,
    };
};
