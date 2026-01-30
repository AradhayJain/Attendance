
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';

interface HeaderProps {
    title: string;
    onMenuPress: () => void;
    showMenuButton?: boolean;
}

export default function Header({ title, onMenuPress, showMenuButton = true }: HeaderProps) {
    return (
        <View style={styles.container}>
            {showMenuButton && (
                <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
                    <Ionicons name="menu" size={24} color={COLORS.text} />
                </TouchableOpacity>
            )}
            <Text style={styles.title}>{title}</Text>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="person-circle-outline" size={26} color={COLORS.text} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 64,
        backgroundColor: COLORS.surface,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        ...SHADOWS.soft,
        zIndex: 10,
    },
    menuButton: {
        marginRight: SPACING.m,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
    },
    actions: {
        marginLeft: 'auto',
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.m,
    },
    iconButton: {
        padding: 4,
    },
});
