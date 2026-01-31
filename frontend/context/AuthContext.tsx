import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';
import api from '../services/api';

type Role = 'student' | 'teacher' | null;

interface User {
    id: string;
    name: string;
    email: string;
    // Add other fields as needed based on backend response
}

interface AuthContextType {
    user: User | null;
    role: Role;
    token: string | null;
    isLoading: boolean;
    login: (role: 'student' | 'teacher', token: string, user: User) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<Role>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        const loadSession = async () => {
            try {
                const storedToken = await SecureStore.getItemAsync('auth_token');
                const storedRole = await SecureStore.getItemAsync('user_role');
                const storedUser = await SecureStore.getItemAsync('user_data');

                if (storedToken && storedRole && storedUser) {
                    setToken(storedToken);
                    setRole(storedRole as Role);
                    setUser(JSON.parse(storedUser));
                    // Optional: Verify token with backend here

                }
            } catch (e) {
                console.error('Failed to load session', e);
            } finally {
                setIsLoading(false);
            }
        };

        loadSession();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === 'auth';
        const inStudentGroup = segments[0] === 'student';
        const inTeacherGroup = segments[0] === 'teacher';

        if (!user && !inAuthGroup && segments[0] !== undefined) {
            // If not logged in and trying to access protected routes, redirect to landing
            // Assuming landing page is '/' which matches segments[0] === undefined or specialized check
            if (inStudentGroup || inTeacherGroup) {
                router.replace('/');
            }
        } else if (user && role === 'student' && !inStudentGroup) {
            router.replace('/student/dashboard');
        } else if (user && role === 'teacher' && !inTeacherGroup) {
            router.replace('/teacher/dashboard');
        }
    }, [user, role, segments, isLoading]);

    const login = async (newRole: 'student' | 'teacher', newToken: string, newUser: User) => {
        setRole(newRole);
        setToken(newToken);
        setUser(newUser);

        await SecureStore.setItemAsync('auth_token', newToken);
        await SecureStore.setItemAsync('user_role', newRole);
        await SecureStore.setItemAsync('user_data', JSON.stringify(newUser));
    };

    const logout = async () => {
        setRole(null);
        setToken(null);
        setUser(null);

        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('user_role');
        await SecureStore.deleteItemAsync('user_data');
        router.replace('/');
    };

    return (
        <AuthContext.Provider value={{ user, role, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
