
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Sidebar, { SidebarItem } from './Sidebar';
import Header from './Header';
import { COLORS } from '../constants/theme';

interface DashboardLayoutProps {
    children: React.ReactNode;
    role: 'teacher' | 'student';
    title?: string;
    sidebarItems: SidebarItem[];
}

export default function DashboardLayout({ children, role, title = 'Dashboard', sidebarItems }: DashboardLayoutProps) {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 1024;
    const isTablet = width >= 768 && width < 1024;

    const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop);

    useEffect(() => {
        if (isDesktop) {
            setIsSidebarOpen(true);
        } else {
            setIsSidebarOpen(false);
        }
    }, [isDesktop]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        if (!isDesktop) setIsSidebarOpen(false);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <View style={styles.container}>
                {/* Sidebar for Desktop - Static */}
                {isDesktop && (
                    <View style={styles.staticSidebar}>
                        <Sidebar
                            role={role}
                            items={sidebarItems}
                            isOpen={true}
                            onClose={() => { }}
                        />
                    </View>
                )}

                {/* Main Content */}
                <View style={[
                    styles.main,
                    isDesktop && { marginLeft: 260 }
                ]}>
                    <Header
                        title={title}
                        onMenuPress={toggleSidebar}
                        showMenuButton={!isDesktop}
                    />
                    <View style={styles.content}>
                        {children}
                    </View>
                </View>

                {/* Mobile/Tablet Sidebar Overlay */}
                {!isDesktop && isSidebarOpen && (
                    <View style={styles.overlayContainer}>
                        <TouchableOpacity style={styles.backdrop} onPress={closeSidebar} activeOpacity={1} />
                        <View style={styles.mobileSidebar}>
                            <Sidebar
                                role={role}
                                items={sidebarItems}
                                isOpen={true}
                                onClose={closeSidebar}
                            />
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    staticSidebar: {
        width: 260,
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 20,
        borderRightWidth: 1,
        borderRightColor: COLORS.border,
    },
    main: {
        flex: 1,
        height: '100%',
        flexDirection: 'column',
    },
    content: {
        flex: 1,
        padding: 0,
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 50,
        flexDirection: 'row',
    },
    backdrop: {
        paddingRight: 60, // Leave some space to tap out if we want, or just full cover
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    mobileSidebar: {
        width: 280, // Slightly wider for mobile ease of use
        height: '100%',
        backgroundColor: COLORS.surface,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.1, shadowRadius: 10 },
            android: { elevation: 10 },
            web: { boxShadow: '4px 0 15px rgba(0,0,0,0.1)' },
        }),
    }
});
