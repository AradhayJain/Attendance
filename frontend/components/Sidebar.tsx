
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useRouter, usePathname } from 'expo-router';

export interface SidebarItem {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    path: string;
}

interface SidebarProps {
    items: SidebarItem[];
    isOpen: boolean;
    onClose?: () => void;
    role: 'teacher' | 'student';
}

export default function Sidebar({ items, isOpen, onClose, role }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handleNavigate = (path: string) => {
        router.push(path as any);
        if (onClose) onClose();
    };

    const handleLogout = () => {
        router.replace('/');
    };

    if (!isOpen) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="scan-circle" size={32} color={COLORS.primary} />
                <Text style={styles.appName}>Attendance</Text>
            </View>

            <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{role.toUpperCase()}</Text>
            </View>

            <ScrollView style={styles.content}>
                {items.map((item) => {
                    const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                    return (
                        <TouchableOpacity
                            key={item.path}
                            style={[
                                styles.item,
                                isActive && styles.activeItem
                            ]}
                            onPress={() => handleNavigate(item.path)}
                        >
                            <Ionicons
                                name={item.icon}
                                size={22}
                                color={isActive ? COLORS.primary : COLORS.textLight}
                            />
                            <Text style={[
                                styles.itemText,
                                isActive && styles.activeItemText
                            ]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
                <Text style={[styles.itemText, { color: COLORS.error }]}>
                    Logout
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 260,
        backgroundColor: COLORS.surface,
        height: '100%',
        borderRightWidth: 1,
        borderRightColor: COLORS.border,
        padding: SPACING.m,
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 100, // Ensure it's above content on mobile if absolute
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.l,
        paddingHorizontal: SPACING.s,
    },
    appName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginLeft: SPACING.s,
    },
    roleBadge: {
        backgroundColor: '#EEF2FF',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: SPACING.l,
        marginLeft: SPACING.s,
    },
    roleText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        borderRadius: BORDER_RADIUS.m,
        marginBottom: SPACING.xs,
    },
    activeItem: {
        backgroundColor: '#EEF2FF', // COLORS.primaryLight
    },
    itemText: {
        fontSize: 15,
        color: COLORS.textLight,
        marginLeft: SPACING.m,
        fontWeight: '500',
    },
    activeItemText: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    logoutItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        marginTop: 'auto',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
});
