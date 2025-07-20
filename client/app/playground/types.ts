import { DomainEnum } from '@/types/enum';
import { LucideIcon } from 'lucide-react';

export interface DetectedFace {
    id: string;
    milvusId?: string;
    bbox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    confidence: number;
    name?: string;
}

export interface ImageData {
    id: string;
    url: string;
    supabaseUrl?: string;
    fileKey?: string;
    faces: DetectedFace[];
    status: 'uploading' | 'detecting' | 'completed' | 'error';
    createdAt: string;
}

export interface PlaygroundSession {
    id: string;
    title: string;
    domainName: DomainEnum;
    createdAt?: string;
}

export interface FaceTaggingState {
    imageId: string;
    faceId: string;
    isOpen: boolean;
    recommendations: string[];
    loading: boolean;
}

export interface Domain {
    id: DomainEnum | string;
    name: string;
    description: string;
    icon: LucideIcon;
    category: string;
    guide: string;
    example: string;
    color: string;
    features: string[];
}
