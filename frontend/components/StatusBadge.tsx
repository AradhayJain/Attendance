
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface StatusBadgeProps {
    status: string;
    type?: 'success' | 'warning' | 'error' | 'info';
}

export default function StatusBadge({ status, type = 'info' }: StatusBadgeProps) {
    const getColors = () => {
        switch (type) {
            case 'success': return { bg: '#D1FAE5', text: '#065F46' };
            case 'warning': return { bg: '#FEF3C7', text: '#92400E' };
            case 'error': return { bg: '#FEE2E2', text: '#991B1B' };
            default: return { bg: '#E0E7FF', text: '#3730A3' };
        }
    };

    const colors = getColors();

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Text style={[styles.text, { color: colors.text }]}>{status}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
});
