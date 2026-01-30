
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Card from '../../../components/Card';
import StatsCard from '../../../components/StatsCard';
import Table, { Column } from '../../../components/Table';
import StatusBadge from '../../../components/StatusBadge';
import { COLORS, SPACING } from '../../../constants/theme';

export default function StudentHistory() {
    const { id } = useLocalSearchParams();

    // Mock Data
    const history = [
        { date: '2023-10-25', time: '10:05 AM', status: 'Present' },
        { date: '2023-10-23', time: '-', status: 'Absent' },
        { date: '2023-10-21', time: '10:02 AM', status: 'Present' },
        { date: '2023-10-19', time: '10:00 AM', status: 'Present' },
        { date: '2023-10-17', time: '-', status: 'Absent' },
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
                <Text style={styles.title}>Student Attendance History</Text>
                <Text style={styles.subtitle}>John Doe - Roll No: 12345</Text>
            </View>

            <View style={styles.statsGrid}>
                <View style={styles.statWrapper}><StatsCard label="Total Classes" value="20" icon="calendar" color={COLORS.primary} /></View>
                <View style={styles.statWrapper}><StatsCard label="Present" value="15" icon="checkmark-circle" color={COLORS.success} /></View>
                <View style={styles.statWrapper}><StatsCard label="Absent" value="5" icon="close-circle" color={COLORS.error} /></View>
            </View>

            <Card style={styles.chartCard} padding="l">
                <Text style={styles.sectionTitle}>Attendance Trend</Text>
                <View style={styles.chartContainer}>
                    {/* Mock Chart: Last 10 classes */}
                    {[1, 1, 0, 1, 1, 1, 0, 1, 1, 0].map((status, index) => (
                        <View key={index} style={styles.chartBarWrapper}>
                            <View
                                style={[
                                    styles.chartBar,
                                    {
                                        height: status ? 40 : 10,
                                        backgroundColor: status ? COLORS.success : COLORS.error
                                    }
                                ]}
                            />
                            <Text style={styles.chartLabel}>{index + 1}</Text>
                        </View>
                    ))}
                </View>
                <Text style={styles.chartFooter}>Last 10 Sessions</Text>
            </Card>

            <Text style={[styles.sectionTitle, { marginTop: SPACING.l }]}>Detailed History</Text>
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
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textLight,
        marginTop: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.m,
        marginBottom: SPACING.l,
    },
    statWrapper: {
        flex: 1,
        minWidth: 150,
    },
    chartCard: {
        marginBottom: SPACING.m,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.m,
    },
    chartContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 80,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingBottom: 8,
    },
    chartBarWrapper: {
        alignItems: 'center',
        flex: 1,
    },
    chartBar: {
        width: 12,
        borderRadius: 4,
    },
    chartLabel: {
        fontSize: 10,
        color: COLORS.textLight,
        marginTop: 4,
    },
    chartFooter: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 8,
        textAlign: 'center',
    },
});
