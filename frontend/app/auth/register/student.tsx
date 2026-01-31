
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { COLORS, SPACING } from '../../../constants/theme';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function StudentRegisterScreen() {
    const router = useRouter();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        rollNo: '',
        department: '',
        program: 'B_TECH'
    });

    const handleChange = (key: string, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleRegister = async () => {
        const { name, email, password, rollNo, department, program } = form;

        if (!name || !email || !password || !rollNo || !department) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/register/student', {
                name,
                emailId: email,
                password,
                rollNo,
                department,
                program
            });

            const { token, student } = response.data;
            await login('student', token, student);
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
                    <View style={[styles.iconCircle, { backgroundColor: '#E0E7FF' }]}>
                        <Ionicons name="school" size={40} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>Student Registration</Text>
                    <Text style={styles.subtitle}>Create your student account</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Full Name"
                        placeholder="John Doe"
                        value={form.name}
                        onChangeText={(t) => handleChange('name', t)}
                        icon="person-outline"
                    />
                    <Input
                        label="Email Address"
                        placeholder="john@example.com"
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
                        label="Roll Number"
                        placeholder="e.g. 2023CS101"
                        value={form.rollNo}
                        onChangeText={(t) => handleChange('rollNo', t)}
                        autoCapitalize="characters"
                        icon="id-card-outline"
                    />
                    <Input
                        label="Department"
                        placeholder="e.g. CSE"
                        value={form.department}
                        onChangeText={(t) => handleChange('department', t)}
                        autoCapitalize="characters"
                        icon="business-outline"
                    />
                    {/* Simplified Program Selection for now - could be a dropdown later */}
                    <View style={{ marginBottom: SPACING.m }}>
                        <Text style={{ marginBottom: 8, fontWeight: '500', color: COLORS.text }}>Program</Text>
                        <View style={{ flexDirection: 'row', gap: SPACING.m }}>
                            <Button
                                title="B.Tech"
                                onPress={() => handleChange('program', 'B_TECH')} // Note: Using backend enum value
                                variant={form.program === 'B_TECH' ? 'primary' : 'outline'}
                                size="small"
                                style={{ flex: 1 }}
                            />
                            <Button
                                title="M.Tech"
                                onPress={() => handleChange('program', 'M_TECH')}
                                variant={form.program === 'M_TECH' ? 'primary' : 'outline'}
                                size="small"
                                style={{ flex: 1 }}
                            />
                        </View>
                    </View>

                    <Button
                        title={loading ? "Creating Account..." : "Register"}
                        onPress={handleRegister}
                        disabled={loading}
                        style={{ marginTop: SPACING.m }}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <Link href="/auth/login?role=student" asChild>
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
