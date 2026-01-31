
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    isLoading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
}

export default function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    isLoading = false,
    disabled = false,
    style,
}: ButtonProps) {
    const getBackgroundColor = () => {
        if (disabled) return COLORS.border;
        if (variant === 'primary') return COLORS.primary;
        if (variant === 'secondary') return COLORS.secondary;
        return 'transparent';
    };

    const getTextColor = () => {
        if (disabled) return COLORS.textLight;
        if (variant === 'outline' || variant === 'ghost') return COLORS.primary;
        return '#FFFFFF';
    };

    const getBorder = () => {
        if (variant === 'outline') return { borderWidth: 1, borderColor: COLORS.primary };
        return {};
    };

    const getPadding = () => {
        switch (size) {
            case 'small': return { paddingVertical: 6, paddingHorizontal: 12 };
            case 'large': return { paddingVertical: 16, paddingHorizontal: 32 };
            default: return { paddingVertical: 12, paddingHorizontal: 24 };
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor: getBackgroundColor() },
                getBorder(),
                getPadding(),
                style,
            ]}
            onPress={onPress}
            disabled={disabled || isLoading}
            activeOpacity={0.8}
        >
            {isLoading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <Text style={[styles.text, { color: getTextColor(), fontSize: size === 'large' ? 18 : 16 }]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: BORDER_RADIUS.m,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    text: {
        fontWeight: '600',
    },
});
