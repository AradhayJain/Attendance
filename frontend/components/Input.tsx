
import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
    label: string;
    error?: string;
    icon?: string;
}

export default function Input({ label, error, style, icon, ...props }: InputProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                {icon && (
                    <Ionicons
                        name={icon as any}
                        size={20}
                        color={COLORS.textLight}
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={[
                        styles.input,
                        error ? styles.inputError : null,
                        icon ? { paddingLeft: 40 } : null,
                        style
                    ]}
                    placeholderTextColor={COLORS.textLight}
                    {...props}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.m,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.text,
        marginBottom: SPACING.s,
    },
    inputWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    input: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.m,
        paddingHorizontal: SPACING.m,
        paddingVertical: 12,
        fontSize: 16,
        color: COLORS.text,
    },
    icon: {
        position: 'absolute',
        left: SPACING.m,
        zIndex: 1,
    },
    inputError: {
        borderColor: COLORS.error,
    },
    errorText: {
        marginTop: 4,
        fontSize: 12,
        color: COLORS.error,
    },
});
