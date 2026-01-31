
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import api from '../../services/api'; // Import api
import { useAuth } from '../../context/AuthContext'; // Import useAuth

export default function StudentDashboard() {
    const router = useRouter();
    const { user, token } = useAuth();
    const [invites, setInvites] = useState<any[]>([]);
    const [enrolled, setEnrolled] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [invitesRes, enrolledRes] = await Promise.all([
                api.get('/enroll/invitations'),
                api.get('/enroll/enrolled')
            ]);
            setInvites(invitesRes.data.enrollments || []);
            setEnrolled(enrolledRes.data.enrollments || []);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    const handleAccept = async (id: string, courseName: string) => {
        try {
            await api.patch(`/enroll/${id}/register`);
            Alert.alert("Success", `You have joined ${courseName}`);
            fetchData(); // Refresh data
        } catch (error) {
            Alert.alert("Error", "Failed to join course");
        }
    };

    const handleReject = async (id: string) => {
        try {
            await api.delete(`/enroll/${id}`); // Assuming delete unenrolls/removes invite
            setInvites(invites.filter(i => i.id !== id));
        } catch (error) {
            Alert.alert("Error", "Failed to reject invite");
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading dashboard...</Text>
            </View>
        );
    }

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
                                        <Text style={styles.courseName}>{invite.course.courseName}</Text>
                                        <Text style={styles.teacherName}>{invite.course.courseCode}</Text>
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
                                        onPress={() => handleAccept(invite.id, invite.course.courseName)}
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
                {enrolled.length === 0 ? (
                    <View style={{ padding: SPACING.l, alignItems: 'center' }}>
                        <Text style={{ color: COLORS.textLight }}>No enrolled courses yet.</Text>
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {enrolled.map((enrollment) => (
                            <Pressable
                                key={enrollment.id}
                                onPress={() => router.push(`/student/courses/${enrollment.course.id}` as any)}
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
                                            <Text style={styles.courseName}>{enrollment.course.courseName}</Text>
                                            <Text style={styles.teacherName}>{enrollment.course.courseCode}</Text>
                                        </View>
                                        <View style={styles.attendanceBadge}>
                                            {/* Placeholder for attendance % until we have an endpoint for it */}
                                            <Text style={styles.attendanceText}>--%</Text>
                                        </View>
                                    </View>
                                    <View style={styles.progressBar}>
                                        <View style={[styles.progressFill, { width: '0%' }]} />
                                    </View>
                                    <Text style={styles.progressLabel}>Overall Attendance</Text>
                                </Card>
                            </Pressable>
                        ))}
                    </View>
                )}
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
