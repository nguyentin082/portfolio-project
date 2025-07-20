'use client';

import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock } from 'lucide-react';
import { Domain } from '../types';

interface ModelInfoSidebarProps {
    domain?: Domain;
    loading?: boolean;
    progress?: number;
}

export const ModelInfoSidebar: React.FC<ModelInfoSidebarProps> = ({
    domain,
    loading = false,
    progress = 0,
}) => {
    if (!domain) return null;

    const getProgressText = () => {
        if (progress < 30) return 'Initializing AI model...';
        if (progress < 60) return 'Processing your input...';
        if (progress < 90) return 'Generating response...';
        return 'Finalizing output...';
    };

    return (
        <div className="space-y-6">
            {/* Model Info */}
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <domain.icon className="w-5 h-5" />
                        {domain.name}
                    </CardTitle>
                    <CardDescription>{domain.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{domain.category}</Badge>
                        {domain.features.slice(0, 2).map((feature, index) => (
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
                        <h4 className="text-sm font-medium">Quick Example:</h4>
                        <p className="text-sm text-muted-foreground">
                            {domain.example}
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
                        <Progress value={progress} className="w-full" />
                        <p className="text-xs text-muted-foreground">
                            {getProgressText()}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
