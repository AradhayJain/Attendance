
import React from 'react';
import { View, Text, StyleSheet, ScrollView, ViewStyle, Platform } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

export interface Column {
    key: string;
    title: string;
    width?: number | string;
    align?: 'left' | 'center' | 'right';
    render?: (item: any) => React.ReactNode;
}

interface TableProps {
    columns: Column[];
    data: any[];
    keyExtractor: (item: any) => string;
    containerStyle?: ViewStyle;
}

export default function Table({ columns, data, keyExtractor, containerStyle }: TableProps) {
    return (
        <View style={[styles.container, containerStyle]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={Platform.OS === 'web'}>
                <View>
                    {/* Header */}
                    <View style={styles.headerRow}>
                        {columns.map((col) => (
                            <View
                                key={col.key}
                                style={[
                                    styles.cell,
                                    col.width ? { width: col.width as any } : { minWidth: 120 },
                                    { justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start' }
                                ]}
                            >
                                <Text style={styles.headerText}>{col.title}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Rows */}
                    {data.map((item, index) => (
                        <View key={keyExtractor(item)} style={[styles.row, index === data.length - 1 && styles.lastRow]}>
                            {columns.map((col) => (
                                <View
                                    key={col.key}
                                    style={[
                                        styles.cell,
                                        col.width ? { width: col.width as any } : { minWidth: 120 },
                                        { justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start' }
                                    ]}
                                >
                                    {col.render ? col.render(item) : (
                                        <Text style={styles.cellText}>{item[col.key]}</Text>
                                    )}
                                </View>
                            ))}
                        </View>
                    ))}

                    {data.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No data available</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.m,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    lastRow: {
        borderBottomWidth: 0,
    },
    cell: {
        padding: SPACING.m,
    },
    headerText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textLight,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cellText: {
        fontSize: 14,
        color: COLORS.text,
    },
    emptyContainer: {
        padding: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    emptyText: {
        color: COLORS.textLight,
    },
});
