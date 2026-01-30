
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Card from '../../../components/Card';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { COLORS, SPACING } from '../../../constants/theme';

export default function CreateCourse() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: '',
        code: '',
        batch: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = () => {
        if (!form.name || !form.code) {
            // In a real app we'd show inline errors, using Alert for now on mobile/web 
            // (On web Alert might be native dialog)
            alert("Please fill in required fields");
            return;
        }

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            // Navigate to the new course details (using ID '1' as placeholder)
            router.replace('/teacher/courses/1' as any);
        }, 1000);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Create New Course</Text>
                <Text style={styles.subtitle}>Add a new course to start tracking attendance.</Text>
            </View>

            <View style={styles.formContainer}>
                <Card padding="l">
                    <Input
                        label="Course Name"
                        placeholder="e.g. Software Engineering"
                        value={form.name}
                        onChangeText={(text) => setForm({ ...form, name: text })}
                    />
                    <Input
                        label="Course Code"
                        placeholder="e.g. CS301"
                        value={form.code}
                        onChangeText={(text) => setForm({ ...form, code: text })}
                    />
                    <Input
                        label="Semester / Batch (Optional)"
                        placeholder="e.g. Fall 2023 / Batch A"
                        value={form.batch}
                        onChangeText={(text) => setForm({ ...form, batch: text })}
                    />

                    <View style={styles.actions}>
                        <Button
                            title="Cancel"
                            variant="outline"
                            onPress={() => router.back()}
                            style={{ flex: 1, marginRight: SPACING.m }}
                        />
                        <Button
                            title="Create Course"
                            onPress={handleSubmit}
                            isLoading={loading}
                            style={{ flex: 1 }}
                        />
                    </View>
                </Card>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: SPACING.l,
        maxWidth: 800,
        width: '100%',
        alignSelf: 'center',
    },
    header: {
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.s,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textLight,
    },
    formContainer: {
        width: '100%',
    },
    actions: {
        flexDirection: 'row',
        marginTop: SPACING.m,
    },
});
