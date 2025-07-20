'use client';

import type React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth-provider';
import { signInMutation } from '@/apis/auth/auth.api';
import { Loader2, Bot, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    // Use the API mutation
    const loginMutation = signInMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Use the mutation to call API
            const response = await loginMutation.mutateAsync({
                email,
                password,
            });

            if (response.success && response.data) {
                // Also call the auth provider signIn to update context
                const { error } = await signIn(email, password);

                if (!error) {
                    toast({
                        title: 'Success',
                        description: 'Logged in successfully!',
                    });
                    router.push('/playground');
                } else {
                    toast({
                        title: 'Error',
                        description: error.message,
                        variant: 'destructive',
                    });
                }
            } else {
                toast({
                    title: 'Error',
                    description: response.error || 'Login failed',
                    variant: 'destructive',
                });
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description:
                    error?.response?.data?.error || 'Network error occurred',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center space-y-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Portfolio
                    </Link>
                    <div className="flex items-center justify-center gap-2">
                        <Bot className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold">
                            AI Playground
                        </span>
                    </div>
                </div>

                <Card className="border-border/50">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-center">
                            Sign in to access your AI playground
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="demo@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="password123"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loginMutation.isPending}
                            >
                                {loginMutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Sign In
                            </Button>
                        </form>
                        <div className="mt-4 text-center text-sm">
                            {"Don't have an account? "}
                            <Link
                                href="/register"
                                className="text-primary hover:underline"
                            >
                                Sign up
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
