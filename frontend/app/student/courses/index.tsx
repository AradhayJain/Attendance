
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../../components/Card';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../constants/theme';

export default function StudentCourses() {
    const router = useRouter();

    const enrolled = [
        { id: '1', course: 'Software Engineering', attendance: '85%', teacher: 'Prof. Johnson' },
        { id: '2', course: 'Data Structures', attendance: '92%', teacher: 'Dr. Alan' },
        { id: '3', course: 'Web Development', attendance: '78%', teacher: 'Prof. Smith' },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.pageTitle}>My Courses</Text>
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
                                <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
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
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: SPACING.l,
        paddingBottom: SPACING.xxl,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.l,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.m,
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
    iconBox: {
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
