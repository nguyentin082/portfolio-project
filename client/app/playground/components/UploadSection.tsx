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
    imagesData?: any[];
}

export const UploadSection: React.FC<UploadSectionProps> = ({
    currentSession,
    onImageUpload,
    uploadProgress,
    loadingImages,
    imagesLoading,
    imagesData = [],
}) => {
    // Calculate stats
    const imagesProcessed = imagesData.length;
    const facesDetected = imagesData.reduce(
        (acc, img) => acc + (img.faces?.length || 0),
        0
    );
    const facesTagged = imagesData.reduce(
        (acc, img) =>
            acc +
            (img.faces?.filter(
                (f: any) => f.personId && f.personId !== 'unknown'
            ).length || 0),
        0
    );
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Upload Stats */}
                <Card className="border border-border/50 hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <Upload className="w-5 h-5 text-green-500" />
                            <span className="text-green-600">
                                Upload Images
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">
                                {imagesProcessed}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Images Processed
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Face Detection Stats */}
                <Card className="border border-border/50 hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <Eye className="w-5 h-5 text-blue-500" />
                            <span className="text-blue-600">
                                Face Detection
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">
                                {facesDetected}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Faces Detected
                            </p>
                        </div>
                        {/* ...existing code... */}
                    </CardContent>
                </Card>

                {/* Recognition Stats */}
                <Card className="border border-border/50 hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <User className="w-5 h-5 text-yellow-500" />
                            <span className="text-yellow-600">
                                Face Recognition
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-600">
                                {facesTagged}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Faces Tagged
                            </p>
                        </div>
                        {/* ...existing code... */}
                    </CardContent>
                </Card>
            </div>
            <div className="mt-6 flex justify-center">
                <label className="block relative cursor-pointer w-full max-w-md">
                    <div className="flex items-center justify-center h-12 rounded-md border border-green-500 bg-green-50 dark:bg-green-900 hover:bg-green-100 dark:hover:bg-green-800 transition-colors gap-2">
                        <Upload className="w-5 h-5 text-green-500" />
                        <span className="text-base font-medium text-green-700 dark:text-green-300">
                            Choose image file to upload
                        </span>
                    </div>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={onImageUpload}
                        disabled={!currentSession}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                </label>
            </div>
        </>
    );
};
