'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useImageUrl } from '@/apis/images/images.api';
import { ImageData, DetectedFace } from '../types';

interface FacePreviewProps {
    currentImage: ImageData;
    currentFace: DetectedFace;
}

export const FacePreview: React.FC<FacePreviewProps> = ({
    currentImage,
    currentFace,
}) => {
    const { data: presignedUrl } = useImageUrl(currentImage.fileKey || '');
    const imageUrl =
        presignedUrl || currentImage.url || currentImage.supabaseUrl || '';

    return (
        <div className="flex justify-center">
            <div className="relative">
                <div className="w-32 h-32 bg-muted rounded-lg overflow-hidden border-2 border-primary shadow-lg">
                    <div
                        className="relative w-full h-full"
                        style={{
                            backgroundImage: `url(${imageUrl})`,
                            backgroundSize: `${
                                (500 / currentFace.bbox.width) * 100
                            }% ${(300 / currentFace.bbox.height) * 100}%`,
                            backgroundPosition: `-${
                                (currentFace.bbox.x / currentFace.bbox.width) *
                                100
                            }% -${
                                (currentFace.bbox.y / currentFace.bbox.height) *
                                100
                            }%`,
                            backgroundRepeat: 'no-repeat',
                        }}
                    />
                </div>
                <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 shadow-sm">
                    {Math.round(currentFace.confidence * 100)}% confidence
                </Badge>
            </div>
        </div>
    );
};
