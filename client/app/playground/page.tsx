'use client';

import { DialogTrigger } from '@/components/ui/dialog';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth-provider';
import {
    Eye,
    Bot,
    Brain,
    Play,
    Info,
    Loader2,
    Upload,
    ImageIcon,
    User,
    Plus,
    RefreshCw,
    X,
    Check,
    Sparkles,
    Copy,
    Download,
    Zap,
    Clock,
    CheckCircle,
    AlertCircle,
    Home,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import {
    usePlaygrounds,
    useCreatePlayground,
    CreatePlaygroundDto,
} from '@/apis/playgrounds/playgrounds.api';
import {
    useUploadImage,
    useUploadImageWithProgress,
} from '@/apis/upload/upload.api';
import {
    useImagesByPlayground,
    useCreateImage,
    useUpdateFace,
    useImageUrl,
    ImageData as ApiImageData,
} from '@/apis/images/images.api';
import axiosInstance from '@/lib/axios';
import { NEST_SERVER_API_URL, FACE_AGENT_API_URL } from '@/core/config';
import { DomainEnum } from '@/types/enum';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

// Component to display image with presigned URL
const ImageDisplay: React.FC<{
    image: ImageData;
    onClick?: () => void;
    className?: string;
    onImageLoad?: (dimensions: { width: number; height: number }) => void;
    'data-image-id'?: string;
}> = ({
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

// Component for face preview in dialog
const FacePreview: React.FC<{
    currentImage: ImageData;
    currentFace: DetectedFace;
}> = ({ currentImage, currentFace }) => {
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

const domains = [
    {
        id: DomainEnum.FACE_RECOGNITION,
        name: 'Face Recognition AI',
        description:
            'Advanced face detection and recognition with high accuracy',
        icon: Eye,
        category: 'Computer Vision',
        guide: 'Upload an image and the AI will detect faces. You can then tag detected faces with names for future recognition.',
        example:
            'Upload a photo with people and tag them with their names for future recognition.',
        color: 'bg-blue-500/10 text-blue-600 border-blue-200',
        features: [
            'Real-time detection',
            'Face tagging',
            'High accuracy',
            'Multiple faces',
        ],
    },
    {
        id: DomainEnum.VEXERE_ASSISTANT,
        name: 'Vexere Assistant',
        description: 'Intelligent travel booking and customer support chatbot',
        icon: Bot,
        category: 'Natural Language Processing',
        guide: 'Ask questions about travel booking, schedules, or general travel assistance.',
        example:
            "Try asking: 'What buses are available from Ho Chi Minh to Da Lat tomorrow?'",
        color: 'bg-green-500/10 text-green-600 border-green-200',
        features: [
            'Travel booking',
            'Schedule queries',
            'Route planning',
            '24/7 support',
        ],
    },
    {
        id: 'text-generator',
        name: 'AI Text Generator',
        description:
            'Creative text generation powered by advanced language models',
        icon: Brain,
        category: 'Natural Language Processing',
        guide: 'Provide a prompt and the AI will generate creative text based on your input.',
        example: "Try: 'Write a short story about a robot learning to paint'",
        color: 'bg-purple-500/10 text-purple-600 border-purple-200',
        features: [
            'Creative writing',
            'Story generation',
            'Content creation',
            'Multiple styles',
        ],
    },
];

interface DetectedFace {
    id: string;
    milvusId: string;
    bbox: { x: number; y: number; width: number; height: number };
    confidence: number;
    name?: string;
}

interface ImageData {
    id: string;
    url: string;
    supabaseUrl: string;
    fileKey?: string;
    faces: DetectedFace[];
    status: 'uploading' | 'detecting' | 'completed' | 'error';
    createdAt: string;
}

interface PlaygroundSession {
    id: string;
    title: string;
    domainName: DomainEnum;
    createdAt: Date;
    lastUsed: Date;
}

interface FaceTaggingState {
    imageId: string;
    faceId: string;
    isOpen: boolean;
    recommendations: string[];
    loading: boolean;
}

// ----- API ENDPOINTS -----
const SERVER_URL = NEST_SERVER_API_URL;
const FACE_RECOG_URL = FACE_AGENT_API_URL;
const isServerReady = SERVER_URL.length > 0;

export default function PlaygroundPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { state, toggleSidebar } = useSidebar();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [selectedModel, setSelectedModel] = useState<DomainEnum | ''>('');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentSession, setCurrentSession] =
        useState<PlaygroundSession | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPlaygroundModel, setNewPlaygroundModel] = useState<
        DomainEnum | ''
    >('');

    // React Query hooks
    const {
        data: playgroundsData,
        isLoading: playgroundsLoading,
        refetch: refetchPlaygrounds,
    } = usePlaygrounds();
    const createPlaygroundMutation = useCreatePlayground();

    // Custom upload hook with progress tracking
    const uploadImageMutation = useUploadImageWithProgress();

    // Images API hooks
    const {
        data: imagesData,
        isLoading: imagesLoading,
        refetch: refetchImages,
    } = useImagesByPlayground(currentSession?.id || '');
    const createImageMutation = useCreateImage();
    const updateFaceMutation = useUpdateFace();

    // Face Recognition specific states
    const [uploadedImages, setUploadedImages] = useState<ImageData[]>([]);
    const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
    const [loadingImages, setLoadingImages] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{
        [key: string]: number;
    }>({});
    const [showBboxes, setShowBboxes] = useState<{ [key: string]: boolean }>(
        {}
    );

    // Track image dimensions for accurate bbox calculation
    const [imageDimensions, setImageDimensions] = useState<{
        [key: string]: { width: number; height: number };
    }>({});

    // Modal states for image detail view
    const [selectedImageModal, setSelectedImageModal] =
        useState<ImageData | null>(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    // Compute displayed images from API data or local state
    const displayedImages = React.useMemo(() => {
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
                            // Convert [x1, y1, x2, y2] to {x, y, width, height}
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

            // Keep ALL local images that are in progress (uploading/detecting)
            // even if they exist in API - this preserves detecting state
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

            // Merge: Local images (with detecting state) take precedence
            const allImages = [...localUploadingImages, ...filteredApiImages];

            // Sort by createdAt date (newest first)
            return allImages.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA; // Descending order (newest first)
            });
        }

        // Sort uploadedImages as well when no API data
        return uploadedImages.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA; // Descending order (newest first)
        });
    }, [imagesData, uploadedImages]);
    const [faceTagging, setFaceTagging] = useState<FaceTaggingState>({
        imageId: '',
        faceId: '',
        isOpen: false,
        recommendations: [],
        loading: false,
    });
    const [tagInput, setTagInput] = useState('');

    const isCollapsed = state === 'collapsed';

    /* get URL params once per render */
    const sessionId = searchParams.get('session');
    const modelParam = searchParams.get('model');

    /* load session / model when the actual param values change */
    useEffect(() => {
        if (sessionId && playgroundsData?.success) {
            // Find session from API data
            const playground = playgroundsData.data.find(
                (p) => p.id === sessionId
            );
            if (playground) {
                const session: PlaygroundSession = {
                    id: playground.id,
                    title: playground.name,
                    domainName: playground.domainName,
                    createdAt: new Date(playground.createdAt),
                    lastUsed: new Date(playground.updatedAt),
                };
                setCurrentSession(session);
                setSelectedModel(session.domainName);

                // Load images for face recognition playground
                if (session.domainName === DomainEnum.FACE_RECOGNITION) {
                    loadPlaygroundImages(sessionId);
                }
            }
        } else if (
            modelParam &&
            domains.find((m) => m.id === (modelParam as DomainEnum))
        ) {
            setSelectedModel(modelParam as DomainEnum);
            setCurrentSession(null);
        }
    }, [sessionId, modelParam, playgroundsData]);

    const currentModel = domains.find((m) => m.id === selectedModel);

    // API Functions
    const loadPlaygroundImages = async (playgroundId: string) => {
        setLoadingImages(true);
        try {
            // Refetch images from API using React Query
            await refetchImages();
        } catch (error) {
            console.error('Error loading playground images:', error);
        }
        setLoadingImages(false);
    };

    const detectFaces = async (imageId: string): Promise<DetectedFace[]> => {
        try {
            // Call Face Recognition API with database image ID
            const response = await fetch(`${FACE_RECOG_URL}/api/face/detect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image_id: imageId, // Use database image ID
                }),
            });

            if (!response.ok) {
                throw new Error(
                    `Face detection failed: ${response.statusText}`
                );
            }

            const data = await response.json();

            // Convert API response to our face format
            const faces: DetectedFace[] = (data.faces || []).map(
                (face: any) => ({
                    id: face.id || face.milvusId || `face_${Date.now()}`,
                    milvusId: face.milvusId,
                    bbox: {
                        x: face.bbox?.[0] || 0,
                        y: face.bbox?.[1] || 0,
                        width: face.bbox?.[2] || 0,
                        height: face.bbox?.[3] || 0,
                    },
                    confidence: face.confidence || 0.9,
                    name: face.name || face.personId,
                })
            );

            // Note: The Milvus service will auto-save embed face data
            // Note: The API will auto-update image face data with milvusId and bbox

            console.log(
                `Face detection completed for image ${imageId}:`,
                faces
            );
            return faces;
        } catch (error) {
            console.error('Error detecting faces:', error);

            // Fallback to mock data for development
            console.warn('Using mock face data due to API error');
            await new Promise((resolve) => setTimeout(resolve, 2000));

            return [
                {
                    id: 'mock_face_1',
                    milvusId:
                        'milvus_' + Math.random().toString(36).substr(2, 9),
                    bbox: { x: 100, y: 80, width: 120, height: 150 },
                    confidence: 0.95,
                },
                {
                    id: 'mock_face_2',
                    milvusId:
                        'milvus_' + Math.random().toString(36).substr(2, 9),
                    bbox: { x: 300, y: 120, width: 110, height: 140 },
                    confidence: 0.87,
                },
            ];
        }
    };

    const getFaceRecommendations = async (
        imageId: string,
        milvusId: string
    ): Promise<string[]> => {
        try {
            if (isServerReady) {
                const response = await axiosInstance.get(
                    `/faces/${milvusId}/recommendations`
                );

                return response.data.recommendations || [];
            }

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
            // Use the specific endpoint: PUT /images/:id/faces/:milvusId
            const response = await updateFaceMutation.mutateAsync({
                imageId,
                milvusId,
                data: {
                    personId: name, // Use personId field as per API
                    name: name, // Also include name for backward compatibility
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

    const createNewPlayground = async (domainName: DomainEnum) => {
        try {
            const domain = domains.find((d) => d.id === domainName);
            const domainDisplayName = domain?.name || 'New';

            // Use React Query mutation to create playground
            const apiResult = await createPlaygroundMutation.mutateAsync({
                name: `${domainDisplayName} Playground`,
                domainName: domainName,
            });

            if (apiResult.success) {
                const newSession: PlaygroundSession = {
                    id: apiResult.data.id,
                    title: apiResult.data.name,
                    domainName: apiResult.data.domainName,
                    createdAt: new Date(apiResult.data.createdAt),
                    lastUsed: new Date(apiResult.data.updatedAt),
                };

                setCurrentSession(newSession);
                setSelectedModel(domainName);
                setShowCreateModal(false);

                // Refetch playgrounds to update the list
                refetchPlaygrounds();

                router.push(`/playground?session=${newSession.id}`);

                toast({
                    title: 'Playground Created',
                    description: `New ${domainDisplayName} playground created!`,
                });
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

    const handleImageUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file || !currentSession) return;

        const imageId = Math.random().toString(36).substr(2, 9);
        const newImage: ImageData = {
            id: imageId,
            url: '',
            supabaseUrl: '',
            faces: [],
            status: 'uploading',
            createdAt: new Date().toISOString(),
        };

        setUploadedImages((prev) => [newImage, ...prev]);
        setUploadProgress((prev) => ({ ...prev, [imageId]: 0 }));

        try {
            // Step 1: Upload image to Supabase
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => ({
                    ...prev,
                    [imageId]: Math.min(
                        (prev[imageId] || 0) + Math.random() * 20,
                        90
                    ),
                }));
            }, 200);

            const uploadResult = await uploadImageMutation.mutateAsync(file);
            clearInterval(progressInterval);
            setUploadProgress((prev) => ({ ...prev, [imageId]: 100 }));

            if (!uploadResult.success || !uploadResult.data) {
                throw new Error('Failed to upload image to Supabase');
            }

            // Step 2: Add image record to database
            const imageRecord = await createImageMutation.mutateAsync({
                playgroundId: currentSession.id,
                fileKey: uploadResult.data.fileKey,
                url: uploadResult.data.publicUrl,
                supabaseUrl: uploadResult.data.publicUrl,
                status: 'detecting',
            });

            if (!imageRecord.success) {
                throw new Error('Failed to create image record');
            }

            const dbImageId = imageRecord.data.id;

            // Update local state with detecting status
            setUploadedImages((prev) =>
                prev.map((img) =>
                    img.id === imageId
                        ? {
                              ...img,
                              id: dbImageId,
                              url: uploadResult.data.publicUrl,
                              supabaseUrl: uploadResult.data.publicUrl,
                              fileKey: uploadResult.data.fileKey,
                              status: 'detecting',
                          }
                        : img
                )
            );

            // Step 3: Face Detection with Face Recognition API
            // Keep detecting state visible throughout the entire process
            const detectedFaces = await detectFaces(dbImageId);

            // Step 4: Wait for API to complete, then refetch to get updated data
            await refetchImages();

            // Step 5: Only after refetch completes, wait a bit more then cleanup
            // This ensures detecting overlay stays visible until everything is done
            setTimeout(() => {
                setUploadedImages((prev) =>
                    prev.filter((img) => img.id !== dbImageId)
                );
            }, 1000); // Increased delay to ensure API data is fully loaded

            // Remove progress after completion
            setTimeout(() => {
                setUploadProgress((prev) => {
                    const { [imageId]: _, ...rest } = prev;
                    return rest;
                });
            }, 1500);

            toast({
                title: 'Success',
                description: `Image processed! Detected ${detectedFaces.length} face(s)`,
            });
        } catch (error: any) {
            console.error('Upload failed:', error);
            setUploadedImages((prev) =>
                prev.map((img) =>
                    img.id === imageId ? { ...img, status: 'error' } : img
                )
            );
            setUploadProgress((prev) => {
                const { [imageId]: _, ...rest } = prev;
                return rest;
            });
            toast({
                title: 'Error',
                description: error.message || 'Failed to process image',
                variant: 'destructive',
            });
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

            if (currentSession) {
                const updatedImages = uploadedImages.map((img) =>
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
                );
            }

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

    const toggleImageBboxes = (imageId: string) => {
        setShowBboxes((prev) => ({
            ...prev,
            [imageId]: !prev[imageId],
        }));
    };

    const openImageModal = (image: ImageData) => {
        setSelectedImageModal(image);
        setIsImageModalOpen(true);
        // Initialize bbox visibility for this image in modal
        setShowBboxes((prev) => ({
            ...prev,
            [image.id]: true,
        }));
    };

    const closeImageModal = () => {
        setSelectedImageModal(null);
        setIsImageModalOpen(false);
    };

    const handleRun = async () => {
        if (!user) {
            toast({
                title: 'Authentication Required',
                description: 'Please sign in to use the AI playground',
                variant: 'destructive',
            });
            return;
        }

        if (!selectedModel || !input.trim()) {
            toast({
                title: 'Missing Information',
                description: 'Please select a model and provide input',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        setProgress(0);

        // Simulate progress
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + Math.random() * 15;
            });
        }, 200);

        try {
            await new Promise((resolve) => setTimeout(resolve, 2000));

            let mockOutput = '';
            switch (selectedModel) {
                case DomainEnum.VEXERE_ASSISTANT:
                    mockOutput = `🚌 **Travel Assistant Response**

I found several bus options for your journey:

**Available Routes:**
1. **VIP Bus** - Departure: 08:00 AM - Price: 250,000 VND
   - Comfortable seating, WiFi, refreshments
   - Duration: 6 hours
   
2. **Sleeper Bus** - Departure: 10:30 PM - Price: 300,000 VND
   - Fully reclining beds, air conditioning
   - Duration: 7 hours (overnight)
   
3. **Standard Bus** - Departure: 02:00 PM - Price: 180,000 VND
   - Basic seating, air conditioning
   - Duration: 8 hours

Would you like me to help you book any of these options? I can also provide information about pickup locations and amenities.`;
                    break;
                case DomainEnum.FACE_RECOGNITION:
                    mockOutput = `**Face Recognition Analysis Complete**

✅ **Detection Results:**
- Total faces detected: 3
- Average confidence: 94.2%
- Processing time: 1.8 seconds

📊 **Face Analysis:**
1. **Person A** - Confidence: 97.5%
   - Age range: 25-35
   - Gender: Female
   - Expression: Smiling
   
2. **Person B** - Confidence: 92.1%
   - Age range: 30-40
   - Gender: Male  
   - Expression: Neutral
   
3. **Person C** - Confidence: 93.0%
   - Age range: 20-30
   - Gender: Female
   - Expression: Happy

🎯 **Recommendations:** Tag detected faces with names for improved future recognition accuracy.`;
                    break;
                default:
                    mockOutput = 'AI processing completed successfully!';
            }

            setProgress(100);
            setTimeout(() => {
                setOutput(mockOutput);
                setLoading(false);
                setProgress(0);
                toast({
                    title: 'Success',
                    description: 'AI processing completed!',
                });
            }, 300);
        } catch (error) {
            clearInterval(progressInterval);
            setLoading(false);
            setProgress(0);
            toast({
                title: 'Error',
                description: 'Failed to process AI request',
                variant: 'destructive',
            });
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast({
                title: 'Copied!',
                description: 'Output copied to clipboard',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to copy to clipboard',
                variant: 'destructive',
            });
        }
    };

    // Get current face being tagged
    const getCurrentFace = () => {
        if (!faceTagging.isOpen) return null;
        const image = displayedImages.find(
            (img) => img.id === faceTagging.imageId
        );
        if (!image) return null;
        return image.faces.find((face) => face.milvusId === faceTagging.faceId);
    };

    const getCurrentImage = () => {
        if (!faceTagging.isOpen) return null;
        return displayedImages.find((img) => img.id === faceTagging.imageId);
    };

    if (!user) {
        return (
            <div className="flex flex-col h-screen w-full">
                {/* Header without sidebar trigger */}
                <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/50 px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold">AI Playground</h1>
                        <p className="text-sm text-muted-foreground">
                            Please sign in to access the playground
                        </p>
                    </div>
                </header>

                <div className="flex-1 flex items-center justify-center p-8">
                    <Card className="max-w-md mx-auto border-border/50 shadow-lg">
                        <CardHeader className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                                <Bot className="w-8 h-8 text-primary" />
                            </div>
                            <CardTitle className="text-xl">
                                Authentication Required
                            </CardTitle>
                            <CardDescription>
                                Please sign in to access the AI playground and
                                start experimenting
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <Button asChild size="lg" className="w-full">
                                <a href="/login">
                                    <User className="w-4 h-4 mr-2" />
                                    Sign In
                                </a>
                            </Button>
                            <Button
                                variant="outline"
                                asChild
                                size="lg"
                                className="w-full bg-transparent"
                            >
                                <a href="/">
                                    <Home className="w-4 h-4 mr-2" />
                                    Back to Portfolio
                                </a>
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
                <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/50 px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <SidebarTrigger className="-ml-1" />
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold">AI Playground</h1>
                        <p className="text-sm text-muted-foreground">
                            Experiment with cutting-edge AI models
                        </p>
                    </div>
                </header>

                <div className="flex-1 h-[calc(100vh-4rem)] flex items-center justify-center p-8">
                    <div className="text-center space-y-8 max-w-2xl">
                        <div className="space-y-6">
                            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-2xl flex items-center justify-center border border-border/50">
                                <Bot className="w-16 h-16 text-primary" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-3xl font-bold tracking-tight">
                                    Welcome to AI Playground
                                </h2>
                                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                                    Create a new playground to start
                                    experimenting with powerful AI models
                                </p>
                            </div>
                        </div>

                        <Dialog
                            open={showCreateModal}
                            onOpenChange={setShowCreateModal}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    size="lg"
                                    className="gap-2 text-base px-8 py-6"
                                >
                                    <Plus className="w-5 h-5" />
                                    Create New Playground
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-xl">
                                        Create New Playground
                                    </DialogTitle>
                                    <DialogDescription>
                                        Choose an AI model to start
                                        experimenting with
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-6">
                                    <div className="grid gap-4">
                                        {domains.map((domain) => (
                                            <Card
                                                key={domain.id}
                                                className={`cursor-pointer transition-all hover:border-primary/50 hover:shadow-md ${
                                                    newPlaygroundModel ===
                                                    domain.id
                                                        ? 'border-primary bg-primary/5 shadow-md'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    setNewPlaygroundModel(
                                                        domain.id as DomainEnum
                                                    )
                                                }
                                            >
                                                <CardContent className="p-6">
                                                    <div className="flex items-start gap-4">
                                                        <div
                                                            className={`p-3 rounded-xl ${domain.color}`}
                                                        >
                                                            <domain.icon className="w-6 h-6" />
                                                        </div>
                                                        <div className="flex-1 space-y-3">
                                                            <div>
                                                                <h3 className="font-semibold text-lg">
                                                                    {
                                                                        domain.name
                                                                    }
                                                                </h3>
                                                                <p className="text-muted-foreground">
                                                                    {
                                                                        domain.description
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    {
                                                                        domain.category
                                                                    }
                                                                </Badge>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {domain.features
                                                                        .slice(
                                                                            0,
                                                                            3
                                                                        )
                                                                        .map(
                                                                            (
                                                                                feature,
                                                                                index
                                                                            ) => (
                                                                                <Badge
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    variant="secondary"
                                                                                    className="text-xs"
                                                                                >
                                                                                    {
                                                                                        feature
                                                                                    }
                                                                                </Badge>
                                                                            )
                                                                        )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setShowCreateModal(false);
                                                setNewPlaygroundModel('');
                                            }}
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
                                            disabled={!newPlaygroundModel}
                                            className="flex-1"
                                        >
                                            <Zap className="w-4 h-4 mr-2" />
                                            Create Playground
                                        </Button>
                                    </div>
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
        const currentFace = getCurrentFace();
        const currentImage = getCurrentImage();

        return (
            <div className="flex flex-col h-screen w-full">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/50 px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <SidebarTrigger className="-ml-1" />
                    <div className="flex-1 flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Eye className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold">
                                {currentSession?.title || 'Face Recognition AI'}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Advanced face detection and recognition
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            currentSession &&
                            loadPlaygroundImages(currentSession.id)
                        }
                        disabled={loadingImages || imagesLoading}
                        className="gap-2"
                    >
                        {loadingImages ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <RefreshCw className="w-4 h-4" />
                        )}
                        Refresh
                    </Button>
                </header>

                <div className="flex-1 h-[calc(100vh-4rem)] overflow-auto">
                    <div className="max-w-7xl mx-auto p-6 space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="border-border/50">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg">
                                            <ImageIcon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Total Images
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {displayedImages.length}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-border/50">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-500/10 rounded-lg">
                                            <User className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Faces Detected
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {displayedImages.reduce(
                                                    (acc, img) =>
                                                        acc + img.faces.length,
                                                    0
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-border/50">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-500/10 rounded-lg">
                                            <CheckCircle className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Tagged Faces
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {displayedImages.reduce(
                                                    (acc, img) =>
                                                        acc +
                                                        img.faces.filter(
                                                            (f) => f.name
                                                        ).length,
                                                    0
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Upload Section */}
                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Upload className="w-5 h-5" />
                                    Upload Image
                                </CardTitle>
                                <CardDescription>
                                    Upload an image to detect and tag faces.
                                    Supported formats: JPG, PNG, WebP (max 10MB)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <Label
                                        htmlFor="image-upload"
                                        className={`cursor-pointer ${
                                            uploadImageMutation.isPending
                                                ? 'opacity-50 pointer-events-none'
                                                : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                                            {uploadImageMutation.isPending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <ImageIcon className="w-4 h-4" />
                                            )}
                                            {uploadImageMutation.isPending
                                                ? 'Uploading...'
                                                : 'Choose Image'}
                                        </div>
                                        <Input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={
                                                uploadImageMutation.isPending
                                            }
                                        />
                                    </Label>
                                    <div className="text-sm text-muted-foreground">
                                        <span className="font-medium">
                                            {displayedImages.length}
                                        </span>{' '}
                                        image(s) uploaded
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Loading State */}
                        {(loadingImages || imagesLoading) && (
                            <Card className="border-border/50">
                                <CardContent className="flex items-center justify-center py-12">
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                        <span className="text-muted-foreground">
                                            Loading playground images...
                                        </span>
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
                                        className="overflow-hidden border-border/50 hover:shadow-lg transition-all cursor-pointer group"
                                        onClick={() => openImageModal(image)}
                                    >
                                        <div className="aspect-square relative bg-muted">
                                            {image.url || image.fileKey ? (
                                                <div className="relative w-full h-full">
                                                    <ImageDisplay
                                                        image={image}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                        onImageLoad={(
                                                            dimensions
                                                        ) => {
                                                            setImageDimensions(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [image.id]:
                                                                        dimensions,
                                                                })
                                                            );
                                                        }}
                                                    />

                                                    {/* Detecting Overlay */}
                                                    {image.status ===
                                                        'detecting' && (
                                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                                            <div className="bg-background/95 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3 shadow-xl border border-border/50">
                                                                <Loader2 className="w-6 h-6 animate-spin text-primary flex-shrink-0" />
                                                                <div className="text-sm font-medium">
                                                                    Detecting...
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Status Badge */}
                                                    <div className="absolute top-3 right-3">
                                                        <Badge
                                                            variant={
                                                                image.status ===
                                                                'completed'
                                                                    ? 'default'
                                                                    : image.status ===
                                                                      'error'
                                                                    ? 'destructive'
                                                                    : 'secondary'
                                                            }
                                                            className="shadow-sm"
                                                        >
                                                            {image.status ===
                                                                'uploading' && (
                                                                <>
                                                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                                    Uploading
                                                                </>
                                                            )}
                                                            {image.status ===
                                                                'detecting' && (
                                                                <>
                                                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                                    Detecting
                                                                </>
                                                            )}
                                                            {image.status ===
                                                                'completed' && (
                                                                <>
                                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                                    {
                                                                        image
                                                                            .faces
                                                                            .length
                                                                    }{' '}
                                                                    face(s)
                                                                </>
                                                            )}
                                                            {image.status ===
                                                                'error' && (
                                                                <>
                                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                                    Error
                                                                </>
                                                            )}
                                                        </Badge>
                                                    </div>

                                                    {/* Click hint overlay */}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-border/50">
                                                            <div className="text-sm font-medium text-center">
                                                                Click to view
                                                                details
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full p-4">
                                                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-3" />
                                                    {uploadProgress[
                                                        image.id
                                                    ] !== undefined && (
                                                        <div className="w-full max-w-[80%]">
                                                            <Progress
                                                                value={
                                                                    uploadProgress[
                                                                        image.id
                                                                    ]
                                                                }
                                                                className="h-2"
                                                            />
                                                            <p className="text-xs text-muted-foreground mt-1 text-center">
                                                                Uploading...{' '}
                                                                {Math.round(
                                                                    uploadProgress[
                                                                        image.id
                                                                    ]
                                                                )}
                                                                %
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {displayedImages.length === 0 &&
                            !loadingImages &&
                            !imagesLoading && (
                                <Card className="border-dashed border-2 border-border/50">
                                    <CardContent className="flex flex-col items-center justify-center py-16">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-medium mb-2">
                                            No images uploaded yet
                                        </h3>
                                        <p className="text-muted-foreground text-center mb-6 max-w-sm">
                                            Upload your first image to start
                                            detecting and tagging faces with our
                                            advanced AI
                                        </p>
                                        <Label
                                            htmlFor="image-upload-empty"
                                            className={`cursor-pointer ${
                                                uploadImageMutation.isPending
                                                    ? 'opacity-50 pointer-events-none'
                                                    : ''
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                                                {uploadImageMutation.isPending ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Upload className="w-4 h-4" />
                                                )}
                                                {uploadImageMutation.isPending
                                                    ? 'Uploading...'
                                                    : 'Upload Image'}
                                            </div>
                                            <Input
                                                id="image-upload-empty"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                disabled={
                                                    uploadImageMutation.isPending
                                                }
                                            />
                                        </Label>
                                    </CardContent>
                                </Card>
                            )}
                    </div>
                </div>

                {/* Professional Image Detail Modal */}
                {selectedImageModal && (
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={closeImageModal}
                    >
                        <div
                            className="bg-background rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-border/50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-border/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <ImageIcon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold">
                                            Image Analysis
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

                            {/* Modal Content */}
                            <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)]">
                                {/* Image Display Section */}
                                <div className="flex-1 p-6 lg:pr-3">
                                    <div className="relative bg-muted rounded-lg overflow-hidden">
                                        <div
                                            className="w-full relative"
                                            style={{
                                                aspectRatio: imageDimensions[
                                                    selectedImageModal.id
                                                ]
                                                    ? `${
                                                          imageDimensions[
                                                              selectedImageModal
                                                                  .id
                                                          ].width
                                                      } / ${
                                                          imageDimensions[
                                                              selectedImageModal
                                                                  .id
                                                          ].height
                                                      }`
                                                    : 'auto',
                                                maxHeight: '70vh',
                                            }}
                                        >
                                            <ImageDisplay
                                                image={selectedImageModal}
                                                className="w-full h-full object-cover rounded-lg"
                                                data-image-id={
                                                    selectedImageModal.id
                                                }
                                                onImageLoad={(dimensions) => {
                                                    setImageDimensions(
                                                        (prev) => ({
                                                            ...prev,
                                                            [selectedImageModal.id]:
                                                                dimensions,
                                                        })
                                                    );
                                                }}
                                            />

                                            {/* Face Detection Overlays - Now with correct aspect ratio */}
                                            {selectedImageModal.status ===
                                                'completed' &&
                                                imageDimensions[
                                                    selectedImageModal.id
                                                ] &&
                                                selectedImageModal.faces.map(
                                                    (face) => {
                                                        const originalDim =
                                                            imageDimensions[
                                                                selectedImageModal
                                                                    .id
                                                            ];

                                                        return (
                                                            <div
                                                                key={
                                                                    face.milvusId
                                                                }
                                                                className="absolute border-2 border-primary bg-primary/10 transition-all duration-200 animate-in fade-in-0"
                                                                style={{
                                                                    left: `${
                                                                        (face
                                                                            .bbox
                                                                            .x /
                                                                            originalDim.width) *
                                                                        100
                                                                    }%`,
                                                                    top: `${
                                                                        (face
                                                                            .bbox
                                                                            .y /
                                                                            originalDim.height) *
                                                                        100
                                                                    }%`,
                                                                    width: `${
                                                                        (face
                                                                            .bbox
                                                                            .width /
                                                                            originalDim.width) *
                                                                        100
                                                                    }%`,
                                                                    height: `${
                                                                        (face
                                                                            .bbox
                                                                            .height /
                                                                            originalDim.height) *
                                                                        100
                                                                    }%`,
                                                                }}
                                                            >
                                                                {face.name && (
                                                                    <div className="absolute -top-8 left-0 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap shadow-lg">
                                                                        {
                                                                            face.name
                                                                        }
                                                                    </div>
                                                                )}
                                                                <div className="absolute -bottom-8 right-0 bg-black/80 text-white px-2 py-1 rounded-md text-xs">
                                                                    {Math.round(
                                                                        face.confidence *
                                                                            100
                                                                    )}
                                                                    %
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                        </div>
                                    </div>
                                </div>

                                {/* Face Details Panel */}
                                <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-border/50 bg-muted/20">
                                    <div className="p-6 h-full overflow-y-auto">
                                        <div className="space-y-6">
                                            {/* Status Section */}
                                            <div>
                                                <h3 className="text-lg font-semibold mb-3">
                                                    Status
                                                </h3>
                                                <Badge
                                                    variant={
                                                        selectedImageModal.status ===
                                                        'completed'
                                                            ? 'default'
                                                            : selectedImageModal.status ===
                                                              'error'
                                                            ? 'destructive'
                                                            : 'secondary'
                                                    }
                                                    className="shadow-sm"
                                                >
                                                    {selectedImageModal.status ===
                                                        'uploading' && (
                                                        <>
                                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                            Uploading
                                                        </>
                                                    )}
                                                    {selectedImageModal.status ===
                                                        'detecting' && (
                                                        <>
                                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                            Detecting
                                                        </>
                                                    )}
                                                    {selectedImageModal.status ===
                                                        'completed' && (
                                                        <>
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Analysis Complete
                                                        </>
                                                    )}
                                                    {selectedImageModal.status ===
                                                        'error' && (
                                                        <>
                                                            <AlertCircle className="w-3 h-3 mr-1" />
                                                            Error
                                                        </>
                                                    )}
                                                </Badge>
                                            </div>

                                            {/* Faces Section */}
                                            {selectedImageModal.faces.length >
                                                0 && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-3">
                                                        Detected Faces (
                                                        {
                                                            selectedImageModal
                                                                .faces.length
                                                        }
                                                        )
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {selectedImageModal.faces.map(
                                                            (face, index) => (
                                                                <div
                                                                    key={
                                                                        face.milvusId
                                                                    }
                                                                    className="p-4 bg-background rounded-lg border border-border/50 shadow-sm"
                                                                >
                                                                    <div className="flex items-start justify-between mb-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                                                                <User className="w-4 h-4 text-primary" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-medium text-sm">
                                                                                    Face
                                                                                    #
                                                                                    {index +
                                                                                        1}
                                                                                </p>
                                                                                <p className="text-xs text-muted-foreground">
                                                                                    Confidence:{' '}
                                                                                    {Math.round(
                                                                                        face.confidence *
                                                                                            100
                                                                                    )}

                                                                                    %
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {face.name ? (
                                                                        <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-md">
                                                                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                                                                            <span className="text-sm font-medium">
                                                                                {
                                                                                    face.name
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="space-y-2">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="w-full bg-transparent hover:bg-primary/5"
                                                                                onClick={() =>
                                                                                    startFaceTagging(
                                                                                        selectedImageModal.id,
                                                                                        face.milvusId
                                                                                    )
                                                                                }
                                                                            >
                                                                                <User className="w-3 h-3 mr-2" />
                                                                                Tag
                                                                                this
                                                                                face
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Empty State */}
                                            {selectedImageModal.faces.length ===
                                                0 &&
                                                selectedImageModal.status ===
                                                    'completed' && (
                                                    <div className="text-center py-8">
                                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                                            <User className="w-8 h-8 text-muted-foreground" />
                                                        </div>
                                                        <p className="text-muted-foreground">
                                                            No faces detected in
                                                            this image
                                                        </p>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Face Tagging Dialog */}
                <Dialog
                    open={faceTagging.isOpen}
                    onOpenChange={(open) => {
                        if (!open) {
                            setFaceTagging({
                                imageId: '',
                                faceId: '',
                                isOpen: false,
                                recommendations: [],
                                loading: false,
                            });
                            setTagInput('');
                        }
                    }}
                >
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Tag Face
                            </DialogTitle>
                            <DialogDescription>
                                Enter a name for this detected face or choose
                                from AI recommendations
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            {/* Face Preview */}
                            {currentImage && currentFace && (
                                <FacePreview
                                    currentImage={currentImage}
                                    currentFace={currentFace}
                                />
                            )}{' '}
                            {/* Name Input */}
                            <div className="space-y-2">
                                <Label htmlFor="face-name">Name</Label>
                                <Input
                                    id="face-name"
                                    placeholder="Enter person's name..."
                                    value={tagInput}
                                    onChange={(e) =>
                                        setTagInput(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === 'Enter' &&
                                            tagInput.trim()
                                        ) {
                                            handleTagFace(
                                                faceTagging.imageId,
                                                faceTagging.faceId,
                                                tagInput.trim()
                                            );
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
                                                    onClick={() =>
                                                        setTagInput(name)
                                                    }
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
                                    onClick={() => {
                                        setFaceTagging({
                                            imageId: '',
                                            faceId: '',
                                            isOpen: false,
                                            recommendations: [],
                                            loading: false,
                                        });
                                        setTagInput('');
                                    }}
                                    className="flex-1"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (tagInput.trim()) {
                                            handleTagFace(
                                                faceTagging.imageId,
                                                faceTagging.faceId,
                                                tagInput.trim()
                                            );
                                        }
                                    }}
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
            </div>
        );
    }

    // Default playground interface for other models
    return (
        <div className="flex flex-col h-screen w-full">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/50 px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <SidebarTrigger className="-ml-1" />
                <div className="flex-1 flex items-center gap-3">
                    {currentModel && (
                        <div className={`p-2 rounded-lg ${currentModel.color}`}>
                            <currentModel.icon className="w-5 h-5" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-lg font-semibold">
                            {currentSession?.title ||
                                currentModel?.name ||
                                'AI Playground'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {currentModel?.description}
                        </p>
                    </div>
                </div>
                <Badge variant="outline" className="hidden sm:flex">
                    {currentModel?.category}
                </Badge>
            </header>

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
                                {/* Model Info */}
                                <div className="space-y-6">
                                    <Card className="border-border/50">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                {currentModel && (
                                                    <currentModel.icon className="w-5 h-5" />
                                                )}
                                                {currentModel?.name}
                                            </CardTitle>
                                            <CardDescription>
                                                {currentModel?.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline">
                                                    {currentModel?.category}
                                                </Badge>
                                                {currentModel?.features
                                                    .slice(0, 2)
                                                    .map((feature, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {feature}
                                                        </Badge>
                                                    ))}
                                            </div>

                                            <Separator />

                                            <div className="space-y-2">
                                                <h4 className="text-sm font-medium">
                                                    Quick Example:
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {currentModel?.example}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Processing Stats */}
                                    {loading && (
                                        <Card className="border-border/50">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-sm">
                                                    <Clock className="w-4 h-4" />
                                                    Processing
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <Progress
                                                    value={progress}
                                                    className="w-full"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    {progress < 30 &&
                                                        'Initializing AI model...'}
                                                    {progress >= 30 &&
                                                        progress < 60 &&
                                                        'Processing your input...'}
                                                    {progress >= 60 &&
                                                        progress < 90 &&
                                                        'Generating response...'}
                                                    {progress >= 90 &&
                                                        'Finalizing output...'}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>

                                {/* Input/Output */}
                                <div className="lg:col-span-2 space-y-6">
                                    <Card className="border-border/50">
                                        <CardHeader>
                                            <CardTitle>Input</CardTitle>
                                            <CardDescription>
                                                Provide input for{' '}
                                                {currentModel?.name}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <Textarea
                                                placeholder={
                                                    currentModel?.id ===
                                                    'vexere-assistant'
                                                        ? 'Ask about travel booking, schedules, or assistance...'
                                                        : currentModel?.id ===
                                                          'text-generator'
                                                        ? 'Enter a prompt for text generation...'
                                                        : 'Enter your input...'
                                                }
                                                value={input}
                                                onChange={(e) =>
                                                    setInput(e.target.value)
                                                }
                                                rows={6}
                                                className="resize-none"
                                            />
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs text-muted-foreground">
                                                    {input.length} characters
                                                </div>
                                                <Button
                                                    onClick={handleRun}
                                                    disabled={
                                                        !input.trim() || loading
                                                    }
                                                    className="gap-2"
                                                >
                                                    {loading ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="w-4 h-4" />
                                                            Run AI Model
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border/50">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle>
                                                        Output
                                                    </CardTitle>
                                                    <CardDescription>
                                                        AI model results will
                                                        appear here
                                                    </CardDescription>
                                                </div>
                                                {output && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                copyToClipboard(
                                                                    output
                                                                )
                                                            }
                                                            className="gap-2"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                            Copy
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="gap-2 bg-transparent"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            Export
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="min-h-[300px] p-4 bg-muted/30 rounded-lg border border-border/50">
                                                {output ? (
                                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                                        <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                                                            {output}
                                                        </pre>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-center">
                                                        <div className="space-y-2">
                                                            <Bot className="w-8 h-8 text-muted-foreground mx-auto" />
                                                            <p className="text-muted-foreground">
                                                                Run an AI model
                                                                to see results
                                                                here
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="guide" className="space-y-6">
                            <Card className="border-border/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Info className="w-5 h-5" />
                                        {currentModel?.name} Guide
                                    </CardTitle>
                                    <CardDescription>
                                        How to use this AI model effectively
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h4 className="font-medium mb-3">
                                            Usage Guide:
                                        </h4>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {currentModel?.guide}
                                        </p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h4 className="font-medium mb-3">
                                            Example:
                                        </h4>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {currentModel?.example}
                                        </p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h4 className="font-medium mb-3">
                                            Features:
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {currentModel?.features.map(
                                                (feature, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                        <span className="text-sm">
                                                            {feature}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
