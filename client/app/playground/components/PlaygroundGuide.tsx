'use client';

import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Info, CheckCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Domain } from '../types';

interface PlaygroundGuideProps {
    domain?: Domain;
}

export const PlaygroundGuide: React.FC<PlaygroundGuideProps> = ({ domain }) => {
    if (!domain) return null;

    return (
        <Card className="border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    {domain.name} Guide
                </CardTitle>
                <CardDescription>
                    How to use this AI model effectively
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="font-medium mb-3">Usage Guide:</h4>
                    <p className="text-muted-foreground leading-relaxed">
                        {domain.guide}
                    </p>
                </div>
                <Separator />
                <div>
                    <h4 className="font-medium mb-3">Example:</h4>
                    <p className="text-muted-foreground leading-relaxed">
                        {domain.example}
                    </p>
                </div>
                <Separator />
                <div>
                    <h4 className="font-medium mb-3">Features:</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {domain.features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
