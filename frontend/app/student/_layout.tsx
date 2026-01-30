
import React from 'react';
import { Slot } from 'expo-router';
import DashboardLayout from '../../components/DashboardLayout';
import { SidebarItem } from '../../components/Sidebar';

export default function StudentLayout() {
    const sidebarItems: SidebarItem[] = [
        { label: 'Dashboard', icon: 'grid-outline', path: '/student/dashboard' },
        { label: 'My Courses', icon: 'book-outline', path: '/student/courses' }, // We'll map this to dashboard for now or a list
        { label: 'Mark Attendance', icon: 'scan-outline', path: '/student/attendance/mark' },
    ];

    return (
        <DashboardLayout role="student" title="Student Dashboard" sidebarItems={sidebarItems}>
            <Slot />
        </DashboardLayout>
    );
}
