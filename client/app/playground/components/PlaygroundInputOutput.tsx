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
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Play, Loader2, Copy, Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Domain } from '../types';

interface PlaygroundInputOutputProps {
    domain?: Domain;
    input: string;
    setInput: (value: string) => void;
    output: string;
    loading: boolean;
    progress: number;
    onRun: () => void;
    onCopyOutput: () => void;
}

export const PlaygroundInputOutput: React.FC<PlaygroundInputOutputProps> = ({
    domain,
    input,
    setInput,
    output,
    loading,
    progress,
    onRun,
    onCopyOutput,
}) => {
    const getPlaceholder = () => {
        if (domain?.id === 'vexere-assistant') {
            return 'Ask about travel booking, schedules, or assistance...';
        }
        if (domain?.id === 'text-generator') {
            return 'Enter a prompt for text generation...';
        }
        return 'Enter your input...';
    };

    return (
        <div className="lg:col-span-2 space-y-6">
            {/* Input Card */}
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle>Input</CardTitle>
                    <CardDescription>
                        Provide input for {domain?.name}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder={getPlaceholder()}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        rows={6}
                        className="resize-none"
                    />
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                            {input.length} characters
                        </div>
                        <Button
                            onClick={onRun}
                            disabled={!input.trim() || loading}
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

            {/* Output Card */}
            <Card className="border-border/50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Output</CardTitle>
                            <CardDescription>
                                AI model results will appear here
                            </CardDescription>
                        </div>
                        {output && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onCopyOutput}
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
                                    {domain?.icon && (
                                        <domain.icon className="w-8 h-8 text-muted-foreground mx-auto" />
                                    )}
                                    <p className="text-muted-foreground">
                                        Run an AI model to see results here
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
