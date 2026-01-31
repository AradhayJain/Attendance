
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { COLORS, SPACING } from '../../../constants/theme';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function TeacherRegisterScreen() {
    const router = useRouter();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        email: '',
        password: '',
        department: '',
    });

    const handleChange = (key: string, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleRegister = async () => {
        const { email, password, department } = form;

        if (!email || !password || !department) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/register/teacher', {
                emailId: email,
                password,
                department,
            });

            const { token, teacher } = response.data;

            // Note: Teacher doesn't have a name in the request, but we might want to fake it or rely on email for now
            // Or we could ask for a name and just not send it to backend? 
            // The backend returns { id, emailId, department }
            // Let's create a partial User object
            const user = { ...teacher, name: teacher.email };

            await login('teacher', token, user);
            Alert.alert("Success", "Registration successful!");
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.msg || "Registration failed";
            Alert.alert("Registration Failed", message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
                        <Ionicons name="people" size={40} color={COLORS.secondary} />
                    </View>
                    <Text style={styles.title}>Teacher Registration</Text>
                    <Text style={styles.subtitle}>Create your instructor account</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Email Address"
                        placeholder="prof@college.edu"
                        value={form.email}
                        onChangeText={(t) => handleChange('email', t)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        icon="mail-outline"
                    />
                    <Input
                        label="Password"
                        placeholder="Create a password"
                        value={form.password}
                        onChangeText={(t) => handleChange('password', t)}
                        secureTextEntry
                        icon="lock-closed-outline"
                    />
                    <Input
                        label="Department"
                        placeholder="e.g. CSE"
                        value={form.department}
                        onChangeText={(t) => handleChange('department', t)}
                        autoCapitalize="characters"
                        icon="business-outline"
                    />

                    <Button
                        title={loading ? "Creating Account..." : "Register"}
                        onPress={handleRegister}
                        disabled={loading}
                        style={{ marginTop: SPACING.m }}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <Link href="/auth/login?role=teacher" asChild>
                            <Text style={styles.link}>Login here</Text>
                        </Link>
                    </View>
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
        padding: SPACING.l,
    },
    header: {
        alignItems: 'center',
        marginVertical: SPACING.xl,
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
