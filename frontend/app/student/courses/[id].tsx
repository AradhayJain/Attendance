
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Card from '../../../components/Card';
import Table, { Column } from '../../../components/Table';
import StatusBadge from '../../../components/StatusBadge';
import Button from '../../../components/Button';
import { COLORS, SPACING } from '../../../constants/theme';

export default function StudentCourseDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    // Mock Data
    const history = [
        { date: '2023-10-25', time: '10:05 AM', status: 'Present' },
        { date: '2023-10-23', time: '-', status: 'Absent' },
        { date: '2023-10-21', time: '10:02 AM', status: 'Present' },
    ];

    const columns: Column[] = [
        { key: 'date', title: 'Date', width: 150 },
        { key: 'time', title: 'Time Marked', width: 150 },
        {
            key: 'status',
            title: 'Status',
            width: 120,
            render: (item) => (
                <StatusBadge
                    status={item.status}
                    type={item.status === 'Present' ? 'success' : 'error'}
                />
            )
        },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Software Engineering</Text>
                <Text style={styles.subtitle}>Prof. Johnson</Text>
            </View>

            <View style={styles.statsRow}>
                <Card style={styles.percentageCard} padding="l">
                    <Text style={styles.percentageLabel}>Attendance Score</Text>
                    <Text style={styles.percentageValue}>85%</Text>
                </Card>

                <Card style={styles.upcomingCard} padding="l">
                    <Text style={styles.upcomingTitle}>Upcoming Session</Text>
                    <Text style={styles.upcomingDate}>Today, 10:00 AM</Text>
                    <Button
                        title="Join Live Session"
                        size="small"
                        onPress={() => router.push('/student/attendance/mark' as any)}
                        style={{ marginTop: 'auto' }}
                    />
                </Card>
            </View>

            <Text style={styles.sectionTitle}>Attendance History</Text>
            <Table
                columns={columns}
                data={history}
                keyExtractor={(item) => item.date}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: SPACING.l,
        paddingBottom: SPACING.xxl,
    },
    header: {
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textLight,
    },
    statsRow: {
        flexDirection: 'row',
        gap: SPACING.m,
        marginBottom: SPACING.xl,
        flexWrap: 'wrap',
    },
    percentageCard: {
        flex: 1,
        minWidth: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    percentageLabel: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 8,
    },
    percentageValue: {
        fontSize: 48,
        fontWeight: '800',
        color: COLORS.primary,
    },
    upcomingCard: {
        flex: 2,
        minWidth: 300,
    },
    upcomingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    upcomingDate: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: SPACING.m,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.m,
    },
});
