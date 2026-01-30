
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function StudentDashboard() {
    const router = useRouter();
    const [invites, setInvites] = useState([
        { id: '101', course: 'Database Systems', teacher: 'Prof. Smith' },
    ]);

    const enrolled = [
        { id: '1', course: 'Software Engineering', attendance: '85%', teacher: 'Prof. Johnson' },
        { id: '2', course: 'Data Structures', attendance: '92%', teacher: 'Dr. Alan' },
    ];

    const handleAccept = (id: string) => {
        Alert.alert("Course Joined", "You have successfully joined Database Systems.");
        setInvites(invites.filter(i => i.id !== id));
    };

    const handleReject = (id: string) => {
        setInvites(invites.filter(i => i.id !== id));
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {invites.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Course Invites</Text>
                    <View style={styles.grid}>
                        {invites.map((invite) => (
                            <Card key={invite.id} padding="m" style={styles.inviteCard}>
                                <View style={styles.inviteHeader}>
                                    <View style={styles.inviteIcon}>
                                        <Ionicons name="mail-unread-outline" size={24} color={COLORS.primary} />
                                    </View>
                                    <View>
                                        <Text style={styles.courseName}>{invite.course}</Text>
                                        <Text style={styles.teacherName}>{invite.teacher}</Text>
                                    </View>
                                </View>
                                <View style={styles.inviteActions}>
                                    <Button
                                        title="Reject"
                                        variant="outline"
                                        size="small"
                                        onPress={() => handleReject(invite.id)}
                                        style={{ flex: 1, marginRight: 8, borderColor: COLORS.error }}
                                    />
                                    <Button
                                        title="Accept"
                                        size="small"
                                        onPress={() => handleAccept(invite.id)}
                                        style={{ flex: 1 }}
                                    />
                                </View>
                            </Card>
                        ))}
                    </View>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Enrolled Courses</Text>
                <View style={styles.grid}>
                    {enrolled.map((course) => (
                        <Pressable
                            key={course.id}
                            onPress={() => router.push(`/student/courses/${course.id}` as any)}
                            style={({ pressed }) => [
                                styles.courseWrapper,
                                pressed && { opacity: 0.9 }
                            ]}
                        >
                            <Card padding="m" style={{ height: '100%' }}>
                                <View style={styles.courseHeader}>
                                    <View style={[styles.inviteIcon, { backgroundColor: '#ECFDF5' }]}>
                                        <Ionicons name="book-outline" size={24} color={COLORS.secondary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.courseName}>{course.course}</Text>
                                        <Text style={styles.teacherName}>{course.teacher}</Text>
                                    </View>
                                    <View style={styles.attendanceBadge}>
                                        <Text style={styles.attendanceText}>{course.attendance}</Text>
                                    </View>
                                </View>
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: course.attendance as any }]} />
                                </View>
                                <Text style={styles.progressLabel}>Overall Attendance</Text>
                            </Card>
                        </Pressable>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: SPACING.l,
        paddingBottom: SPACING.xxl,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.m,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.m,
    },
    inviteCard: {
        width: '100%',
        maxWidth: 350,
    },
    inviteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    inviteIcon: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.m,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    courseName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    teacherName: {
        fontSize: 14,
        color: COLORS.textLight,
    },
    inviteActions: {
        flexDirection: 'row',
    },
    courseWrapper: {
        flex: 1,
        minWidth: 300,
        maxWidth: 400,
    },
    courseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    attendanceBadge: {
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    attendanceText: {
        color: '#065F46',
        fontWeight: '700',
        fontSize: 14,
    },
    progressBar: {
        height: 8,
        backgroundColor: COLORS.border,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 4,
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.secondary,
    },
    progressLabel: {
        fontSize: 12,
        color: COLORS.textLight,
    },
});
