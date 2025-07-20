'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { authSignIn } from '@/apis/auth/auth.api';
import { UserType } from '@/types/type';
import Cookies from 'js-cookie';

interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    const signIn = async (email: string, password: string) => {
        setLoading(true);

        try {
            const response = await authSignIn({ email, password });

            if (response.success && response.data) {
                const { user: userData, token } = response.data;

                // Transform API user to our User interface
                const user: User = {
                    id: userData.id,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                };

                setUser(user);

                // Store token and user data
                Cookies.set('authToken', token, { expires: 7 }); // 7 days
                localStorage.setItem('user', JSON.stringify(user));

                setLoading(false);
                return { error: null };
            } else {
                setLoading(false);
                return { error: { message: response.error || 'Login failed' } };
            }
        } catch (error: any) {
            setLoading(false);
            return {
                error: {
                    message:
                        error?.response?.data?.error ||
                        'Network error occurred',
                },
            };
        }
    };

    const signOut = async () => {
        setUser(null);
        Cookies.remove('authToken');
        localStorage.removeItem('user');
    };

    // Check for existing user on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const token = Cookies.get('authToken');

        if (savedUser && token) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const value = {
        user,
        loading,
        signIn,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
