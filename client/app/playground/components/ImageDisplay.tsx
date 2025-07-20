'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useImageUrl } from '@/apis/images/images.api';
import { ImageData } from '../types';

interface ImageDisplayProps {
    image: ImageData;
    onClick?: () => void;
    className?: string;
    onImageLoad?: (dimensions: { width: number; height: number }) => void;
    'data-image-id'?: string;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({
    image,
    onClick,
    className,
    onImageLoad,
    'data-image-id': dataImageId,
}) => {
    // Use fileKey to get presigned URL if available, otherwise use existing URL
    const { data: presignedUrl, isLoading } = useImageUrl(image.fileKey || '');

    const imageUrl = presignedUrl || image.url || image.supabaseUrl || '';

    if (isLoading && !image.url) {
        return (
            <div className="flex items-center justify-center h-full bg-muted">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <img
            src={imageUrl || '/placeholder.svg'}
            alt="Uploaded"
            className={className}
            onClick={onClick}
            data-image-id={dataImageId}
            onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                if (onImageLoad) {
                    onImageLoad({
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                    });
                }
            }}
        />
    );
};
