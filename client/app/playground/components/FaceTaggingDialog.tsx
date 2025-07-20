'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Sparkles, X, Check } from 'lucide-react';
import { FacePreview } from './FacePreview';
import { ImageData, DetectedFace, FaceTaggingState } from '../types';

interface FaceTaggingDialogProps {
    faceTagging: FaceTaggingState;
    setFaceTagging: React.Dispatch<React.SetStateAction<FaceTaggingState>>;
    tagInput: string;
    setTagInput: (value: string) => void;
    displayedImages: ImageData[];
    onTagFace: (imageId: string, milvusId: string, name: string) => void;
}

export const FaceTaggingDialog: React.FC<FaceTaggingDialogProps> = ({
    faceTagging,
    setFaceTagging,
    tagInput,
    setTagInput,
    displayedImages,
    onTagFace,
}) => {
    const getCurrentFace = (): DetectedFace | null => {
        if (!faceTagging.isOpen) return null;
        const image = displayedImages.find(
            (img) => img.id === faceTagging.imageId
        );
        if (!image) return null;
        return (
            image.faces.find((face) => face.milvusId === faceTagging.faceId) ||
            null
        );
    };

    const getCurrentImage = (): ImageData | null => {
        if (!faceTagging.isOpen) return null;
        return (
            displayedImages.find((img) => img.id === faceTagging.imageId) ||
            null
        );
    };

    const currentFace = getCurrentFace();
    const currentImage = getCurrentImage();

    const handleClose = () => {
        setFaceTagging({
            imageId: '',
            faceId: '',
            isOpen: false,
            recommendations: [],
            loading: false,
        });
        setTagInput('');
    };

    const handleTagSubmit = () => {
        if (tagInput.trim()) {
            onTagFace(faceTagging.imageId, faceTagging.faceId, tagInput.trim());
        }
    };

    return (
        <Dialog open={faceTagging.isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Tag Face
                    </DialogTitle>
                    <DialogDescription>
                        Enter a name for this detected face or choose from AI
                        recommendations
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Face Preview */}
                    {currentImage && currentFace && (
                        <FacePreview
                            currentImage={currentImage}
                            currentFace={currentFace}
                        />
                    )}

                    {/* Name Input */}
                    <div className="space-y-2">
                        <Label htmlFor="face-name">Name</Label>
                        <Input
                            id="face-name"
                            placeholder="Enter person's name..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && tagInput.trim()) {
                                    handleTagSubmit();
                                }
                            }}
                        />
                    </div>

                    {/* AI Recommendations */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <Label className="text-sm font-medium">
                                AI Recommendations
                            </Label>
                        </div>

                        {faceTagging.loading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Getting AI recommendations...
                            </div>
                        ) : faceTagging.recommendations.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {faceTagging.recommendations.map(
                                    (name, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs bg-transparent hover:bg-primary/5"
                                            onClick={() => setTagInput(name)}
                                        >
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            {name}
                                        </Button>
                                    )
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No recommendations available
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            className="flex-1"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            onClick={handleTagSubmit}
                            disabled={!tagInput.trim()}
                            className="flex-1"
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Tag Face
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
