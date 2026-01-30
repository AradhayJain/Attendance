
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // added import
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Table, { Column } from '../../../components/Table';
import StatusBadge from '../../../components/StatusBadge';
import { COLORS, SPACING } from '../../../constants/theme';

export default function LiveSession() {
    const router = useRouter();
    const [timer, setTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(true);
    const [attendees, setAttendees] = useState<any[]>([]);

    // Simulate timer
    useEffect(() => {
        let interval: any;
        if (isRunning) {
            interval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    // Simulate students joining
    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => {
            const newStudent = {
                id: Date.now().toString(),
                name: `Student ${Math.floor(Math.random() * 100)}`,
                time: new Date().toLocaleTimeString(),
                status: 'Present'
            };
            setAttendees((prev) => [...prev, newStudent]);
        }, 5000); // New student every 5 seconds
        return () => clearInterval(interval);
    }, [isRunning]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleEndSession = () => {
        setIsRunning(false);
        Alert.alert("Session Ended", "Attendance has been saved.", [
            { text: "View Report" },
            { text: "Back to Course", onPress: () => router.back() }
        ]);
    };

    const columns: Column[] = [
        { key: 'name', title: 'Student Name', width: 200 },
        { key: 'time', title: 'Time Marked', width: 150 },
        {
            key: 'status',
            title: 'Status',
            width: 120,
            render: (item) => <StatusBadge status="Present" type="success" />
        },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Card padding="l" style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                    <View>
                        <Text style={styles.courseName}>Software Engineering</Text>
                        <View style={styles.statusBadge}>
                            <View style={[styles.statusDot, isRunning ? styles.dotActive : styles.dotInactive]} />
                            <Text style={styles.statusText}>{isRunning ? 'Session Live' : 'Session Ended'}</Text>
                        </View>
                    </View>
                    <Text style={styles.timer}>{formatTime(timer)}</Text>
                </View>

                <View style={styles.sessionControls}>
                    <Button
                        title={isRunning ? "End Attendance" : "Session Ended"}
                        variant={isRunning ? "primary" : "outline"}
                        style={{ backgroundColor: isRunning ? COLORS.error : undefined, borderColor: COLORS.error }}
                        onPress={handleEndSession}
                        disabled={!isRunning}
                    />
                    <Button
                        title="Export Report"
                        variant="secondary"
                        onPress={() => Alert.alert("Exported", "Session report downloaded.")}
                    />
                </View>
            </Card>

            <Text style={styles.sectionTitle}>Marked Present ({attendees.length})</Text>
            <Table
                columns={columns}
                data={attendees}
                keyExtractor={(item) => item.id}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: SPACING.l,
        paddingBottom: SPACING.xxl,
    },
    sessionCard: {
        marginBottom: SPACING.xl,
        backgroundColor: '#1F2937', // Dark theme for session card
    },
    sessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    courseName: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    dotActive: { backgroundColor: '#10B981' },
    dotInactive: { backgroundColor: '#9CA3AF' },
    statusText: {
        color: '#10B981',
        fontWeight: '600',
        fontSize: 12,
    },
    timer: {
        fontSize: 48,
        fontWeight: '800',
        color: '#FFF',
    },
    sessionControls: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.m,
    },
});
