
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import Table, { Column } from '../../../components/Table';
import StatusBadge from '../../../components/StatusBadge';
import { COLORS, SPACING } from '../../../constants/theme';

const MOCK_STUDENTS = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'Accepted' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'Pending' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'Accepted' },
];

export default function CourseDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [students, setStudents] = useState(MOCK_STUDENTS);

    const handleUpload = () => {
        // Mock upload
        Alert.alert("File Upload", "Select an Excel file (Mock)", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Upload", onPress: () => {
                    Alert.alert("Success", "Students imported successfully");
                    setStudents([...students, { id: '4', name: 'Alice', email: 'alice@example.com', status: 'Pending' }]);
                }
            }
        ]);
    };

    const handleSendInvites = () => {
        Alert.alert("Invites Sent", "Email invites sent to all pending students.");
    };

    const columns: Column[] = [
        { key: 'name', title: 'Name', width: 200 },
        { key: 'email', title: 'Email', width: 250 },
        {
            key: 'status',
            title: 'Status',
            width: 120,
            render: (item) => (
                <StatusBadge
                    status={item.status}
                    type={item.status === 'Accepted' ? 'success' : 'warning'}
                />
            )
        },
        {
            key: 'actions',
            title: 'Actions',
            width: 120,
            align: 'right',
            render: (item) => (
                <Button
                    title="History"
                    size="small"
                    variant="outline"
                    onPress={() => router.push(`/teacher/students/${item.id}` as any)}
                />
            )
        }
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.courseCode}>CS301</Text>
                    <Text style={styles.title}>Software Engineering</Text>
                </View>
                <Button
                    title="Start Live Session"
                    onPress={() => router.push('/teacher/session/live' as any)}
                    style={{ marginLeft: 'auto' }}
                />
            </View>

            <View style={styles.actionsRow}>
                <Card padding="m" style={{ flex: 1, marginRight: SPACING.m }}>
                    <View style={styles.actionCardContent}>
                        <Ionicons name="cloud-upload-outline" size={32} color={COLORS.primary} style={{ marginBottom: 8 }} />
                        <Text style={styles.actionTitle}>Import Students</Text>
                        <Text style={styles.actionDesc}>Upload .xlsx or .csv file</Text>
                        <Button title="Upload File" variant="outline" onPress={handleUpload} size="small" style={{ marginTop: 8 }} />
                    </View>
                </Card>

                <Card padding="m" style={{ flex: 1 }}>
                    <View style={styles.actionCardContent}>
                        <Ionicons name="mail-outline" size={32} color={COLORS.secondary} style={{ marginBottom: 8 }} />
                        <Text style={styles.actionTitle}>Invite Students</Text>
                        <Text style={styles.actionDesc}>Send invites to pending list</Text>
                        <Button title="Send Invites" variant="outline" onPress={handleSendInvites} size="small" style={{ marginTop: 8 }} />
                    </View>
                </Card>
            </View>

            <View style={styles.tableSection}>
                <Text style={styles.sectionTitle}>Enrolled Students</Text>
                <Table
                    columns={columns}
                    data={students}
                    keyExtractor={(item) => item.id}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: SPACING.l,
        paddingBottom: SPACING.xxl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        flexWrap: 'wrap',
        gap: SPACING.m,
    },
    courseCode: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '700',
        marginBottom: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.text,
    },
    actionsRow: {
        flexDirection: 'row',
        marginBottom: SPACING.xl,
        flexWrap: 'wrap',
    },
    actionCardContent: {
        alignItems: 'center',
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    actionDesc: {
        fontSize: 12,
        color: COLORS.textLight,
        marginBottom: 8,
    },
    tableSection: {
        marginTop: SPACING.s,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.m,
    },
});
