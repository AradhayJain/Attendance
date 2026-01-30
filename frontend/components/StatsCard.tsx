
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { COLORS, SPACING } from '../constants/theme';

interface StatsCardProps {
    label: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    color?: string;
}

export default function StatsCard({ label, value, icon, color = COLORS.primary }: StatsCardProps) {
    return (
        <Card padding="m" style={styles.container}>
            <View style={styles.content}>
                <View>
                    <Text style={styles.label}>{label}</Text>
                    <Text style={styles.value}>{value}</Text>
                </View>
                <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon} size={24} color={color} />
                </View>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minWidth: 200,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 4,
    },
    value: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
    },
    iconContainer: {
        padding: 10,
        borderRadius: 12,
    },
});
