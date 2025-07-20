'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useSidebar } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useCreatePlayground } from '@/apis/playgrounds/playgrounds.api';
import { DomainEnum } from '@/types/enum';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Home, Loader2, ImageIcon, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import our refactored components and hooks
import {
    PlaygroundHeader,
    PlaygroundInputOutput,
    ModelInfoSidebar,
    UploadSection,
    FaceTaggingDialog,
    PlaygroundGuide,
    ImageDisplay,
    usePlaygroundState,
    useImageUpload,
    useFaceTagging,
    usePlaygroundExecution,
    domains,
    ImageData,
} from './index';

export default function PlaygroundPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { state } = useSidebar();
    const router = useRouter();

    // Custom hooks for state management
    const {
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
    } = usePlaygroundState();

    const {
        uploadProgress,
        loadingImages,
        handleImageUpload,
        loadPlaygroundImages,
    } = useImageUpload({
        currentSession,
        setUploadedImages,
        refetchImages,
    });

    const {
        faceTagging,
        setFaceTagging,
        tagInput,
        setTagInput,
        startFaceTagging,
        handleTagFace,
    } = useFaceTagging({
        setUploadedImages,
        uploadedImages,
        currentSession,
    });

    const {
        input,
        setInput,
        output,
        setOutput,
        loading,
        progress,
        handleRun,
        copyToClipboard,
    } = usePlaygroundExecution();

    // Local state for modal and UI
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPlaygroundModel, setNewPlaygroundModel] = useState<
        DomainEnum | ''
    >('');
    const [showBboxes, setShowBboxes] = useState<{ [key: string]: boolean }>(
        {}
    );
    const [selectedImageModal, setSelectedImageModal] =
        useState<ImageData | null>(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const createPlaygroundMutation = useCreatePlayground();

    // Utility functions
    const createNewPlayground = async (domainName: DomainEnum) => {
        try {
            const domain = domains.find((d) => d.id === domainName);
            const domainDisplayName = domain?.name || 'New';

            const apiResult = await createPlaygroundMutation.mutateAsync({
                name: `${domainDisplayName} Playground`,
                domainName: domainName,
            });

            if (apiResult.success) {
                const newSession = {
                    id: apiResult.data.id,
                    title: apiResult.data.name,
                    domainName: apiResult.data.domainName,
                    createdAt: apiResult.data.createdAt,
                };
                setCurrentSession(newSession);
                setSelectedModel(domainName);

                router.push(`/playground?session=${apiResult.data.id}`);

                toast({
                    title: 'Success',
                    description: `Created ${domainDisplayName} playground`,
                });

                setShowCreateModal(false);
            }
        } catch (error: any) {
            console.error('Failed to create playground:', error);
            toast({
                title: 'Error',
                description:
                    error?.response?.data?.error ||
                    'Failed to create playground',
                variant: 'destructive',
            });
        }
    };

    const toggleImageBboxes = (imageId: string) => {
        setShowBboxes((prev) => ({
            ...prev,
            [imageId]: !prev[imageId],
        }));
    };

    const openImageModal = (image: ImageData) => {
        setSelectedImageModal(image);
        setIsImageModalOpen(true);
        setShowBboxes((prev) => ({
            ...prev,
            [image.id]: true,
        }));
    };

    const closeImageModal = () => {
        setSelectedImageModal(null);
        setIsImageModalOpen(false);
    };

    // Authentication check
    if (!user) {
        return (
            <div className="flex flex-col h-screen w-full">
                <PlaygroundHeader />
                <div className="flex-1 flex items-center justify-center p-8">
                    <Card className="max-w-md mx-auto border-border/50 shadow-lg">
                        <CardHeader className="text-center">
                            <CardTitle className="flex items-center justify-center gap-2">
                                <Home className="w-6 h-6" />
                                Welcome to AI Playground
                            </CardTitle>
                            <CardDescription>
                                Please sign in to access the AI models and
                                features
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <Button
                                onClick={() => router.push('/login')}
                                className="w-full"
                            >
                                Sign In to Continue
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Empty state - no playground selected
    if (!currentSession && !selectedModel) {
        return (
            <div className="flex flex-col h-screen w-full">
                <PlaygroundHeader />
                <div className="flex-1 h-[calc(100vh-4rem)] flex items-center justify-center p-8">
                    <div className="text-center space-y-8 max-w-2xl">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold">
                                AI Playground
                            </h1>
                            <p className="text-xl text-muted-foreground">
                                Choose an AI model to get started with your
                                experiments
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {domains.map((domain) => (
                                <Card
                                    key={domain.id}
                                    className="border-border/50 hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => {
                                        setNewPlaygroundModel(
                                            domain.id as DomainEnum
                                        );
                                        setShowCreateModal(true);
                                    }}
                                >
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-3">
                                            <div
                                                className={`p-3 rounded-lg ${domain.color}`}
                                            >
                                                <domain.icon className="w-6 h-6" />
                                            </div>
                                            {domain.name}
                                        </CardTitle>
                                        <CardDescription>
                                            {domain.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">
                                                {domain.category}
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="gap-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Create
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Dialog
                            open={showCreateModal}
                            onOpenChange={setShowCreateModal}
                        >
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Create New Playground
                                    </DialogTitle>
                                    <DialogDescription>
                                        Create a new playground session for{' '}
                                        {
                                            domains.find(
                                                (d) =>
                                                    d.id === newPlaygroundModel
                                            )?.name
                                        }
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setShowCreateModal(false)
                                        }
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            newPlaygroundModel &&
                                            createNewPlayground(
                                                newPlaygroundModel
                                            )
                                        }
                                        className="flex-1"
                                    >
                                        Create Playground
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        );
    }

    // Face Recognition Interface
    if (selectedModel === DomainEnum.FACE_RECOGNITION) {
        return (
            <div className="flex flex-col h-screen w-full">
                <PlaygroundHeader
                    domain={currentModel}
                    title={currentSession?.title}
                    showRefresh
                    onRefresh={() =>
                        currentSession &&
                        loadPlaygroundImages(currentSession.id)
                    }
                    isRefreshing={loadingImages || imagesLoading}
                />

                <div className="flex-1 h-[calc(100vh-4rem)] overflow-auto">
                    <div className="max-w-7xl mx-auto p-6 space-y-6">
                        {/* Upload Section */}
                        <UploadSection
                            currentSession={currentSession}
                            onImageUpload={handleImageUpload}
                            uploadProgress={uploadProgress}
                            loadingImages={loadingImages}
                            imagesLoading={imagesLoading}
                        />

                        {/* Upload Instructions */}
                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    How to Use Face Recognition
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ol className="space-y-2 text-sm text-muted-foreground">
                                    <li>1. Upload an image containing faces</li>
                                    <li>
                                        2. Wait for automatic face detection
                                    </li>
                                    <li>3. Tag detected faces with names</li>
                                    <li>
                                        4. View recognition results and manage
                                        your database
                                    </li>
                                </ol>
                            </CardContent>
                        </Card>

                        {/* Loading State */}
                        {(loadingImages || imagesLoading) && (
                            <Card className="border-border/50">
                                <CardContent className="flex items-center justify-center py-16">
                                    <div className="text-center space-y-4">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                                        <p className="text-sm text-muted-foreground">
                                            Loading images...
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Images Grid */}
                        {displayedImages.length > 0 && (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {displayedImages.map((image) => (
                                    <Card
                                        key={image.id}
                                        className="border-border/50"
                                    >
                                        <CardContent className="p-4">
                                            <div className="relative">
                                                <ImageDisplay
                                                    image={image}
                                                    className="w-full h-48 object-cover rounded-lg cursor-pointer"
                                                    onClick={() =>
                                                        openImageModal(image)
                                                    }
                                                />
                                                {image.status ===
                                                    'uploading' && (
                                                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                                        <div className="text-white text-center">
                                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                                            <p className="text-sm">
                                                                Uploading...
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                {image.status ===
                                                    'detecting' && (
                                                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                                        <div className="text-white text-center">
                                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                                            <p className="text-sm">
                                                                Detecting
                                                                faces...
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-3 space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium">
                                                        {image.faces.length}{' '}
                                                        face(s) detected
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(
                                                            image.createdAt
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {image.faces.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {image.faces
                                                            .slice(0, 3)
                                                            .map(
                                                                (face, idx) => (
                                                                    <Button
                                                                        key={
                                                                            idx
                                                                        }
                                                                        size="sm"
                                                                        variant={
                                                                            face.name
                                                                                ? 'default'
                                                                                : 'outline'
                                                                        }
                                                                        className="text-xs h-6 px-2"
                                                                        onClick={() =>
                                                                            face.milvusId &&
                                                                            startFaceTagging(
                                                                                image.id,
                                                                                face.milvusId
                                                                            )
                                                                        }
                                                                    >
                                                                        {face.name ||
                                                                            'Unknown'}
                                                                    </Button>
                                                                )
                                                            )}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {displayedImages.length === 0 &&
                            !loadingImages &&
                            !imagesLoading && (
                                <Card className="border-dashed border-2 border-border/50">
                                    <CardContent className="flex flex-col items-center justify-center py-16">
                                        <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">
                                            No Images Yet
                                        </h3>
                                        <p className="text-muted-foreground text-center max-w-md">
                                            Upload your first image to start
                                            using face recognition. The AI will
                                            automatically detect and help you
                                            tag faces.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                    </div>
                </div>

                {/* Face Tagging Dialog */}
                <FaceTaggingDialog
                    faceTagging={faceTagging}
                    setFaceTagging={setFaceTagging}
                    tagInput={tagInput}
                    setTagInput={setTagInput}
                    displayedImages={displayedImages}
                    onTagFace={handleTagFace}
                />

                {/* Image Detail Modal */}
                {selectedImageModal && (
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={closeImageModal}
                    >
                        <div
                            className="bg-background rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-border/50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-border/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <ImageIcon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold">
                                            Image Details
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedImageModal.faces.length}{' '}
                                            face(s) detected
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={closeImageModal}
                                    className="shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)]">
                                <div className="flex-1 p-6 lg:pr-3">
                                    <div className="relative bg-muted rounded-lg overflow-hidden">
                                        <ImageDisplay
                                            image={selectedImageModal}
                                            className="w-full h-auto max-h-96 object-contain"
                                        />
                                    </div>
                                </div>

                                <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-border/50 bg-muted/20">
                                    <div className="p-6 h-full overflow-y-auto">
                                        <div className="space-y-6">
                                            {selectedImageModal.faces.length ===
                                                0 &&
                                                selectedImageModal.status ===
                                                    'completed' && (
                                                    <Card>
                                                        <CardContent className="p-4 text-center">
                                                            <p className="text-sm text-muted-foreground">
                                                                No faces
                                                                detected in this
                                                                image
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                )}

                                            {selectedImageModal.faces.map(
                                                (face, index) => (
                                                    <Card
                                                        key={face.id}
                                                        className="border-border/50"
                                                    >
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="text-sm">
                                                                Face #
                                                                {index + 1}
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-3">
                                                            <div className="text-xs space-y-1">
                                                                <p>
                                                                    <strong>
                                                                        Confidence:
                                                                    </strong>{' '}
                                                                    {Math.round(
                                                                        face.confidence *
                                                                            100
                                                                    )}
                                                                    %
                                                                </p>
                                                                <p>
                                                                    <strong>
                                                                        Name:
                                                                    </strong>{' '}
                                                                    {face.name ||
                                                                        'Unknown'}
                                                                </p>
                                                            </div>
                                                            {face.milvusId && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        startFaceTagging(
                                                                            selectedImageModal.id,
                                                                            face.milvusId!
                                                                        )
                                                                    }
                                                                    className="w-full"
                                                                >
                                                                    {face.name
                                                                        ? 'Edit Name'
                                                                        : 'Tag Face'}
                                                                </Button>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Default playground interface for other models
    return (
        <div className="flex flex-col h-screen w-full">
            <PlaygroundHeader
                domain={currentModel}
                title={currentSession?.title}
                description={currentModel?.description}
            />

            <div className="flex-1 h-[calc(100vh-4rem)] overflow-auto">
                <div className="max-w-7xl mx-auto p-6">
                    <Tabs defaultValue="playground" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2 max-w-md">
                            <TabsTrigger value="playground">
                                Playground
                            </TabsTrigger>
                            <TabsTrigger value="guide">Guide</TabsTrigger>
                        </TabsList>

                        <TabsContent value="playground" className="space-y-6">
                            <div className="grid lg:grid-cols-3 gap-6">
                                {/* Model Info Sidebar */}
                                <ModelInfoSidebar
                                    domain={currentModel}
                                    loading={loading}
                                    progress={progress}
                                />

                                {/* Input/Output */}
                                <PlaygroundInputOutput
                                    domain={currentModel}
                                    input={input}
                                    setInput={setInput}
                                    output={output}
                                    loading={loading}
                                    progress={progress}
                                    onRun={() =>
                                        selectedModel &&
                                        handleRun(selectedModel)
                                    }
                                    onCopyOutput={() => copyToClipboard(output)}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="guide" className="space-y-6">
                            <PlaygroundGuide domain={currentModel} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
