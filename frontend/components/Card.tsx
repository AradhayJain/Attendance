
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING } from '../constants/theme';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'elevated' | 'flat' | 'outlined';
    padding?: keyof typeof SPACING;
}

export default function Card({ children, style, variant = 'elevated', padding = 'l' }: CardProps) {
    const getStyle = () => {
        switch (variant) {
            case 'flat':
                return { backgroundColor: COLORS.surface };
            case 'outlined':
                return { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border };
            default:
                return { backgroundColor: COLORS.surface, ...SHADOWS.soft };
        }
    };

    return (
        <View style={[
            styles.card,
            getStyle(),
            { padding: SPACING[padding] },
            style
        ]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: BORDER_RADIUS.l,
        marginBottom: SPACING.m,
    },
});
