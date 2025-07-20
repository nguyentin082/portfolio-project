import instance from '@/lib/axios';
import { useMutation, useQuery } from '@tanstack/react-query';

// Response interfaces
export interface UploadImageResponse {
    success: boolean;
    data: {
        fileKey: string;
        publicUrl: string;
        originalName: string;
    };
    error?: string;
}

export interface PresignedUrlResponse {
    success: boolean;
    data: {
        presignedUrl: string;
        fileKey: string;
        expiresAt: string;
    };
    error?: string;
}

// API Functions
export async function uploadImage(file: File): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await instance.post('/upload/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

export async function getPresignedUrl(
    fileKey: string,
    expiresIn?: number
): Promise<PresignedUrlResponse> {
    const params = new URLSearchParams({ fileKey });
    if (expiresIn) {
        params.append('expiresIn', expiresIn.toString());
    }

    const response = await instance.get(`/upload?${params.toString()}`);
    return response.data;
}

// React Query hooks
export function useUploadImage() {
    return useMutation({
        mutationFn: uploadImage,
        onSuccess: (data) => {
            console.log('Image uploaded successfully:', data.data.publicUrl);
        },
        onError: (error: any) => {
            console.error(
                'Upload failed:',
                error?.response?.data?.error || error.message
            );
        },
    });
}

export function usePresignedUrl(fileKey: string, expiresIn?: number) {
    return useQuery({
        queryKey: ['presigned-url', fileKey, expiresIn],
        queryFn: () => getPresignedUrl(fileKey, expiresIn),
        enabled: !!fileKey, // Only run query if fileKey is provided
        staleTime: 1000 * 60 * 30, // 30 minutes
        refetchOnWindowFocus: false,
    });
}

// Helper function for uploading images with progress tracking
export function useUploadImageWithProgress() {
    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);

            const response = await instance.post('/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        console.log(`Upload Progress: ${percentCompleted}%`);
                    }
                },
            });
            return response.data;
        },
    });
}
