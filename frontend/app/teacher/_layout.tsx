
import React from 'react';
import { Slot, Stack } from 'expo-router';
import DashboardLayout from '../../components/DashboardLayout';
import { SidebarItem } from '../../components/Sidebar';

export default function TeacherLayout() {
    const sidebarItems: SidebarItem[] = [
        { label: 'Dashboard', icon: 'grid-outline', path: '/teacher/dashboard' },
        { label: 'Create Course', icon: 'add-circle-outline', path: '/teacher/courses/create' },
        { label: 'Live Session', icon: 'radio-outline', path: '/teacher/session/live' },
    ];

    return (
        <DashboardLayout role="teacher" title="Teacher Dashboard" sidebarItems={sidebarItems}>
            <Slot />
        </DashboardLayout>
    );
}
