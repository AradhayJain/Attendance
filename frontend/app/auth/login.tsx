
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, Link } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const role = (params.role as 'student' | 'teacher') || 'student';
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const endpoint = `/auth/login/${role}`;
            const response = await api.post(endpoint, { emailId: email, password });

            const { token, user } = response.data; // Adjust based on actual API response structure

            // Backend returns: 
            // Student: { student: { name: ... }, token: ... }
            // Teacher: { teacher: { name: ... }, token: ... }

            const userData = role === 'student' ? response.data.student : response.data.teacher;

            await login(role, token, userData);
            Alert.alert("Success", `Welcome back, ${userData.name}!`);

            // Navigation handled by AuthContext
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.msg || "Login failed. Please check your credentials.";
            Alert.alert("Login Failed", message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={[styles.iconCircle, { backgroundColor: role === 'student' ? '#E0E7FF' : '#D1FAE5' }]}>
                        <Ionicons
                            name={role === 'student' ? "school" : "people"}
                            size={40}
                            color={role === 'student' ? COLORS.primary : COLORS.secondary}
                        />
                    </View>
                    <Text style={styles.title}>{role === 'student' ? 'Student' : 'Teacher'} Login</Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Email Address"
                        placeholder="john@example.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        icon="mail-outline"
                    />
                    <Input
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        icon="lock-closed-outline"
                    />

                    <Button
                        title={loading ? "Signing in..." : "Sign In"}
                        onPress={handleLogin}
                        disabled={loading}
                        style={{ marginTop: SPACING.m }}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <Link href={`/auth/register/${role}` as any} asChild>
                            <Text style={styles.link}>Register here</Text>
                        </Link>
                    </View>

                    <Button
                        title="Back to Home"
                        variant="ghost"
                        onPress={() => router.replace('/')}
                        style={{ marginTop: SPACING.s }}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.l,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.m,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.xs,
        textTransform: 'capitalize',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textLight,
    },
    form: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.l,
    },
    footerText: {
        color: COLORS.textLight,
    },
    link: {
        color: COLORS.primary,
        fontWeight: '600',
    },
});
