import { DomainEnum } from '@/types/enum';
import { Eye, Bot, Brain } from 'lucide-react';
import { Domain } from './types';
import { FACE_AGENT_API_URL } from '@/core/config';

export const domains: Domain[] = [
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
            'Advanced text generation with natural language processing',
        icon: Brain,
        category: 'Natural Language Processing',
        guide: 'Enter a prompt and the AI will generate relevant text content.',
        example: 'Try: "Write a short story about a robot learning to paint"',
        color: 'bg-purple-500/10 text-purple-600 border-purple-200',
        features: [
            'Creative writing',
            'Content generation',
            'Multi-language',
            'Contextual',
        ],
    },
];

export const FACE_RECOG_URL = FACE_AGENT_API_URL;
