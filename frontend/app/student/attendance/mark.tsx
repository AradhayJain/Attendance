
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { COLORS, SPACING } from '../../../constants/theme';

export default function MarkAttendance() {
    const router = useRouter();
    const [marked, setMarked] = useState(false);

    const handleMark = () => {
        // Simulate API
        setTimeout(() => {
            setMarked(true);
        }, 500);
    };

    if (marked) {
        return (
            <View style={styles.container}>
                <Card style={styles.successCard} padding="xl">
                    <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
                    <Text style={styles.successTitle}>Attendance Marked!</Text>
                    <Text style={styles.successText}>You have been marked present for Software Engineering.</Text>
                    <Button
                        title="Back to Dashboard"
                        onPress={() => router.replace('/student/dashboard' as any)}
                        style={{ marginTop: SPACING.l, width: '100%' }}
                    />
                </Card>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Card style={styles.card} padding="xl">
                <View style={styles.iconContainer}>
                    <Ionicons name="radio" size={48} color={COLORS.error} />
                </View>
                <Text style={styles.title}>Live Session Active</Text>
                <Text style={styles.subtitle}>Software Engineering - Prof. Johnson</Text>

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>Session started at 10:00 AM</Text>
                    <Text style={styles.infoText}>Please mark your attendance now.</Text>
                </View>

                <Button
                    title="Mark Attendance"
                    size="large"
                    onPress={handleMark}
                    style={{ width: '100%' }}
                />
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: SPACING.l,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FEE2E2',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.l,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textLight,
        marginBottom: SPACING.xl,
        textAlign: 'center',
    },
    infoBox: {
        backgroundColor: '#F3F4F6',
        padding: SPACING.m,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    infoText: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 4,
    },
    successCard: {
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
        marginTop: SPACING.m,
        marginBottom: 8,
    },
    successText: {
        fontSize: 16,
        color: COLORS.textLight,
        textAlign: 'center',
    },
});
