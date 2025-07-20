import instance from '@/lib/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPresignedUrl } from '@/apis/upload/upload.api';

// Types and Interfaces
export interface FaceData {
    id?: string;
    milvusId: string;
    bbox: number[];
    confidence?: number;
    personId?: string;
    name?: string;
}

export interface ImageData {
    id: string;
    userId: string;
    playgroundId: string;
    url?: string;
    supabaseUrl?: string;
    fileKey?: string;
    faces: FaceData[];
    status?: 'uploading' | 'detecting' | 'completed' | 'error';
    createdAt: string;
    updatedAt: string;
}

export interface ImagesResponse {
    success: boolean;
    data: ImageData[];
    error?: string;
}

export interface SingleImageResponse {
    success: boolean;
    data: ImageData;
    error?: string;
}

export interface CreateImageDto {
    playgroundId: string;
    url?: string;
    supabaseUrl?: string;
    fileKey?: string;
    faces?: FaceData[];
    status?: string;
}

export interface UpdateImageDto {
    url?: string;
    supabaseUrl?: string;
    fileKey?: string;
    faces?: FaceData[];
    status?: string;
}

export interface UpdateFaceDto {
    personId?: string;
    bbox?: number[];
    name?: string;
}

// Helper function to get image URL from fileKey
export async function getImageUrl(fileKey: string): Promise<string | null> {
    try {
        const response = await getPresignedUrl(fileKey);
        if (response.success && response.data.presignedUrl) {
            return response.data.presignedUrl;
        }
        return null;
    } catch (error) {
        console.error('Error getting presigned URL:', error);
        return null;
    }
}

// API Functions
export async function getImages(queryParams?: {
    playgroundId?: string;
    userId?: string;
}): Promise<ImagesResponse> {
    const params = new URLSearchParams();

    if (queryParams?.playgroundId || queryParams?.userId) {
        const whereConditions: any = {};

        if (queryParams.playgroundId) {
            whereConditions.playgroundId = queryParams.playgroundId;
        }

        if (queryParams.userId) {
            whereConditions.userId = queryParams.userId;
        }

        params.append('where', JSON.stringify(whereConditions));
    }

    const response = await instance.get(`/images?${params.toString()}`);

    // Resolve presigned URLs for images with fileKey
    if (response.data?.success && response.data?.data) {
        const imagesWithUrls = await Promise.all(
            response.data.data.map(async (img: any) => {
                if (img.fileKey && !img.url) {
                    const presignedUrl = await getImageUrl(img.fileKey);
                    return {
                        ...img,
                        url: presignedUrl,
                        supabaseUrl: presignedUrl,
                    };
                }
                return img;
            })
        );

        return {
            ...response.data,
            data: imagesWithUrls,
        };
    }

    return response.data;
}

export async function getImagesByPlayground(
    playgroundId: string
): Promise<ImagesResponse> {
    return getImages({ playgroundId });
}

export async function getImageById(id: string): Promise<SingleImageResponse> {
    const response = await instance.get(`/images/${id}`);
    return response.data;
}

export async function createImage(
    data: CreateImageDto
): Promise<SingleImageResponse> {
    const response = await instance.post('/images', data);
    return response.data;
}

export async function updateImage(
    id: string,
    data: UpdateImageDto
): Promise<SingleImageResponse> {
    const response = await instance.put(`/images/${id}`, data);
    return response.data;
}

export async function deleteImage(id: string): Promise<{ success: boolean }> {
    const response = await instance.delete(`/images/${id}`);
    return response.data;
}

export async function updateFace(
    imageId: string,
    milvusId: string,
    data: UpdateFaceDto
): Promise<SingleImageResponse> {
    const response = await instance.put(
        `/images/${imageId}/faces/${milvusId}`,
        data
    );
    return response.data;
}

// React Query hooks
export function useImages(queryParams?: {
    playgroundId?: string;
    userId?: string;
}) {
    return useQuery({
        queryKey: ['images', queryParams],
        queryFn: () => getImages(queryParams),
        enabled: !!queryParams?.playgroundId || !!queryParams?.userId, // Only run if we have filter params
        staleTime: 1000 * 60 * 2, // 2 minutes
        refetchOnWindowFocus: false,
    });
}

export function useImagesByPlayground(playgroundId: string) {
    return useQuery({
        queryKey: ['images', 'playground', playgroundId],
        queryFn: () => getImagesByPlayground(playgroundId),
        enabled: !!playgroundId,
        staleTime: 1000 * 60 * 2, // 2 minutes
        refetchOnWindowFocus: false,
    });
}

export function useImage(id: string) {
    return useQuery({
        queryKey: ['images', id],
        queryFn: () => getImageById(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });
}

export function useImageUrl(fileKey: string) {
    return useQuery({
        queryKey: ['image-url', fileKey],
        queryFn: () => getImageUrl(fileKey),
        enabled: !!fileKey,
        staleTime: 1000 * 60 * 30, // 30 minutes - URLs expire after some time
        refetchOnWindowFocus: false,
    });
}

export function useCreateImage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createImage,
        onSuccess: (data, variables) => {
            // Invalidate images queries for the playground
            queryClient.invalidateQueries({
                queryKey: ['images', 'playground', variables.playgroundId],
            });
            queryClient.invalidateQueries({
                queryKey: ['images'],
            });
        },
        onError: (error: any) => {
            console.error(
                'Failed to create image:',
                error?.response?.data?.error || error.message
            );
        },
    });
}

export function useUpdateImage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateImageDto }) =>
            updateImage(id, data),
        onSuccess: (data) => {
            // Invalidate specific image and related queries
            queryClient.invalidateQueries({
                queryKey: ['images', data.data.id],
            });
            queryClient.invalidateQueries({
                queryKey: ['images', 'playground', data.data.playgroundId],
            });
            queryClient.invalidateQueries({
                queryKey: ['images'],
            });
        },
        onError: (error: any) => {
            console.error(
                'Failed to update image:',
                error?.response?.data?.error || error.message
            );
        },
    });
}

export function useDeleteImage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteImage,
        onSuccess: () => {
            // Invalidate all images queries since we don't know the playground ID
            queryClient.invalidateQueries({
                queryKey: ['images'],
            });
        },
        onError: (error: any) => {
            console.error(
                'Failed to delete image:',
                error?.response?.data?.error || error.message
            );
        },
    });
}

export function useUpdateFace() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            imageId,
            milvusId,
            data,
        }: {
            imageId: string;
            milvusId: string;
            data: UpdateFaceDto;
        }) => updateFace(imageId, milvusId, data),
        onSuccess: (data) => {
            // Invalidate specific image and related queries
            queryClient.invalidateQueries({
                queryKey: ['images', data.data.id],
            });
            queryClient.invalidateQueries({
                queryKey: ['images', 'playground', data.data.playgroundId],
            });
        },
        onError: (error: any) => {
            console.error(
                'Failed to update face:',
                error?.response?.data?.error || error.message
            );
        },
    });
}
