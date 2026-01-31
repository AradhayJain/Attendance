import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import StatsCard from '../../components/StatsCard';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function TeacherDashboard() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const { user, token } = useAuth();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            if (!user?.id || !token) return;
            try {
                // Fetch courses where this teacher is an instructor
                const response = await api.get('/ci', {
                    params: { teacherId: user.id }
                });

                // transform response to match UI needs
                // response.data.instructors is array of { course: {...}, ... }
                const fetchedCourses = response.data.instructors.map((item: any) => ({
                    id: item.course.id,
                    name: item.course.courseName,
                    code: item.course.courseCode,
                    students: 0, // We need another endpoint or aggregate to get student count per course
                    attendance: '--%' // Placeholder
                }));

                setCourses(fetchedCourses);
            } catch (error) {
                console.error("Failed to fetch teacher courses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [user, token]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading dashboard...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Overview</Text>
            </View>

            <View style={[
                styles.statsGrid,
                isMobile && { flexDirection: 'column', flexWrap: 'nowrap' }
            ]}>
                <View style={[styles.statsCardWrapper, !isMobile && { minWidth: 200 }]}>
                    <StatsCard label="Total Students" value="--" icon="people" color={COLORS.primary} />
                </View>
                <View style={[styles.statsCardWrapper, !isMobile && { minWidth: 200 }]}>
                    <StatsCard label="Active Courses" value={courses.length.toString()} icon="library" color={COLORS.secondary} />
                </View>
                <View style={[styles.statsCardWrapper, !isMobile && { minWidth: 200 }]}>
                    <StatsCard label="Avg. Attendance" value="--%" icon="bar-chart" color={COLORS.warning} />
                </View>
            </View>

            <View style={[styles.headerRow, { marginTop: SPACING.l, paddingTop: SPACING.l }]}>
                <Text style={styles.sectionTitle}>Your Courses</Text>
                <Button
                    title="Create Course"
                    onPress={() => router.push('/teacher/courses/create' as any)}
                    size="small"
                />
            </View>

            {courses.length === 0 ? (
                <View style={{ padding: SPACING.l, alignItems: 'center' }}>
                    <Text style={{ color: COLORS.textLight }}>You are not instructing any courses yet.</Text>
                </View>
            ) : (
                <View style={styles.courseGrid}>
                    {courses.map((course) => (
                        <Pressable
                            key={course.id}
                            onPress={() => router.push(`/teacher/courses/${course.id}` as any)}
                            style={({ pressed }) => [
                                styles.courseCardWrapper,
                                pressed && { opacity: 0.9 }
                            ]}
                        >
                            <Card padding="m" style={{ height: '100%' }}>
                                <View style={styles.courseHeader}>
                                    <View style={styles.iconBox}>
                                        <Text style={styles.courseIconText}>{course.code.substring(0, 2)}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.courseName}>{course.name}</Text>
                                        <Text style={styles.courseCode}>{course.code}</Text>
                                    </View>
                                    <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textLight} style={{ marginLeft: 'auto' }} />
                                </View>

                                <View style={styles.courseFooter}>
                                    <View style={styles.courseStat}>
                                        <Ionicons name="people-outline" size={16} color={COLORS.textLight} />
                                        <Text style={styles.statText}>{course.students} Students</Text>
                                    </View>
                                    <View style={styles.courseStat}>
                                        <Ionicons name="trending-up-outline" size={16} color={COLORS.success} />
                                        <Text style={[styles.statText, { color: COLORS.success }]}>{course.attendance}</Text>
                                    </View>
                                </View>
                            </Card>
                        </Pressable>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: SPACING.l,
        paddingBottom: SPACING.xxl,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.m,
    },
    statsCardWrapper: {
        flex: 1,
        minWidth: '100%', // Mobile first default, overrides below via style prop if needed
    },
    courseGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.m,
    },
    courseCardWrapper: {
        width: '100%',
        minWidth: 280,
        flex: 1,
    },
    courseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.m,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    courseIconText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
    },
    courseName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    courseCode: {
        fontSize: 14,
        color: COLORS.textLight,
    },
    courseFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.m,
        marginTop: 'auto',
    },
    courseStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 14,
        color: COLORS.textLight,
    },
});
