'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Loader2 } from 'lucide-react';
import { Domain } from '../types';

interface PlaygroundHeaderProps {
    domain?: Domain;
    title?: string;
    description?: string;
    showRefresh?: boolean;
    onRefresh?: () => void;
    isRefreshing?: boolean;
}

export const PlaygroundHeader: React.FC<PlaygroundHeaderProps> = ({
    domain,
    title,
    description,
    showRefresh = false,
    onRefresh,
    isRefreshing = false,
}) => {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/50 px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1 flex items-center gap-3">
                {domain && (
                    <div className={`p-2 rounded-lg ${domain.color}`}>
                        <domain.icon className="w-5 h-5" />
                    </div>
                )}
                <div>
                    <h1 className="text-lg font-semibold">
                        {title || domain?.name || 'AI Playground'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {description || domain?.description}
                    </p>
                </div>
            </div>
            {domain && (
                <Badge variant="outline" className="hidden sm:flex">
                    {domain.category}
                </Badge>
            )}
            {showRefresh && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="gap-2"
                >
                    {isRefreshing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <RefreshCw className="w-4 h-4" />
                    )}
                    Refresh
                </Button>
            )}
        </header>
    );
};
