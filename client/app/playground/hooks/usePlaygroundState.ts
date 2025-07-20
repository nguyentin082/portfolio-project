import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { DomainEnum } from '@/types/enum';
import { usePlaygrounds } from '@/apis/playgrounds/playgrounds.api';
import { useImagesByPlayground } from '@/apis/images/images.api';
import { ImageData, PlaygroundSession } from '../types';
import { domains } from '../constants';

export const usePlaygroundState = () => {
    const searchParams = useSearchParams();
    const [selectedModel, setSelectedModel] = useState<DomainEnum | ''>('');
    const [currentSession, setCurrentSession] =
        useState<PlaygroundSession | null>(null);
    const [uploadedImages, setUploadedImages] = useState<ImageData[]>([]);

    // React Query hooks
    const {
        data: playgroundsData,
        isLoading: playgroundsLoading,
        refetch: refetchPlaygrounds,
    } = usePlaygrounds();

    const {
        data: imagesData,
        isLoading: imagesLoading,
        refetch: refetchImages,
    } = useImagesByPlayground(currentSession?.id || '');

    // Get URL params
    const sessionId = searchParams.get('session');
    const modelParam = searchParams.get('model');

    // Load session/model when params change
    useEffect(() => {
        if (sessionId && playgroundsData?.success) {
            const playground = playgroundsData.data.find(
                (p) => p.id === sessionId
            );
            if (playground) {
                const session: PlaygroundSession = {
                    id: playground.id,
                    title: playground.name,
                    domainName: playground.domainName,
                    createdAt: playground.createdAt,
                };
                setCurrentSession(session);
                setSelectedModel(playground.domainName);
            }
        } else if (
            modelParam &&
            domains.find((m) => m.id === (modelParam as DomainEnum))
        ) {
            setSelectedModel(modelParam as DomainEnum);
            setCurrentSession(null);
        }
    }, [sessionId, modelParam, playgroundsData]);

    // Compute displayed images
    const displayedImages = useMemo(() => {
        if (imagesData?.success && imagesData.data) {
            // Convert API images to local format
            const apiImages = imagesData.data.map(
                (img): ImageData => ({
                    id: img.id,
                    url: img.url || img.supabaseUrl || '',
                    supabaseUrl: img.supabaseUrl || img.url || '',
                    fileKey: img.fileKey,
                    faces: img.faces.map((face) => ({
                        id: face.id || face.milvusId,
                        milvusId: face.milvusId,
                        bbox: {
                            x: face.bbox[0] || 0,
                            y: face.bbox[1] || 0,
                            width: (face.bbox[2] || 0) - (face.bbox[0] || 0),
                            height: (face.bbox[3] || 0) - (face.bbox[1] || 0),
                        },
                        confidence: face.confidence || 0,
                        name: face.name || face.personId || undefined,
                    })),
                    status: (img.status as any) || 'completed',
                    createdAt: img.createdAt,
                })
            );

            // Keep ALL local images that are in progress
            const localUploadingImages = uploadedImages.filter(
                (localImg) =>
                    localImg.status === 'uploading' ||
                    localImg.status === 'detecting'
            );

            // Only show API images that don't have a local counterpart in progress
            const filteredApiImages = apiImages.filter(
                (apiImg) =>
                    !localUploadingImages.some(
                        (localImg) => localImg.id === apiImg.id
                    )
            );

            // Merge and sort
            const allImages = [...localUploadingImages, ...filteredApiImages];
            return allImages.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA; // Descending order (newest first)
            });
        }

        return uploadedImages.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });
    }, [imagesData, uploadedImages]);

    const currentModel = domains.find((m) => m.id === selectedModel);

    return {
        selectedModel,
        setSelectedModel,
        currentSession,
        setCurrentSession,
        uploadedImages,
        setUploadedImages,
        displayedImages,
        currentModel,
        playgroundsData,
        playgroundsLoading,
        refetchPlaygrounds,
        imagesData,
        imagesLoading,
        refetchImages,
    };
};
