'use client';

import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
    Upload,
    CheckCircle,
    Loader2,
    User,
    Eye,
    AlertCircle,
} from 'lucide-react';

interface UploadSectionProps {
    currentSession?: any;
    onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    uploadProgress: { [key: string]: number };
    loadingImages: boolean;
    imagesLoading: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
    currentSession,
    onImageUpload,
    uploadProgress,
    loadingImages,
    imagesLoading,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Upload Stats */}
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <Upload className="w-4 h-4" />
                        Upload Images
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">0</div>
                        <p className="text-xs text-muted-foreground">
                            Images Processed
                        </p>
                    </div>
                    <div className="relative">
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={onImageUpload}
                            disabled={!currentSession}
                            className="cursor-pointer"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-sm text-muted-foreground">
                                Choose image file
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Face Detection Stats */}
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <Eye className="w-4 h-4" />
                        Face Detection
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            0
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Faces Detected
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-muted-foreground">
                            Ready for detection
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Recognition Stats */}
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4" />
                        Face Recognition
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            0
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Faces Tagged
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span className="text-xs text-muted-foreground">
                            Upload images to start
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
