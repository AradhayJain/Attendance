
import React from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions, ScrollView, Platform, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LandingPage() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;

  const handleRoleSelect = (role: 'student' | 'teacher') => {
    router.push(`/auth/login?role=${role}` as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { minHeight: height }]}>

        {/* Decorative Background Elements */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="scan-circle" size={isMobile ? 56 : 72} color={COLORS.primary} />
            <Text style={[styles.appName, isMobile && styles.appNameMobile]}>Attendance</Text>
          </View>
          <Text style={[styles.tagline, isMobile && styles.taglineMobile]}>
            Tracking simplified. {"\n"}
            <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Focus on learning.</Text>
          </Text>
          <Text style={styles.subtext}>
            Seamlessly manage attendance for physical and virtual classrooms with our AI-powered platform.
          </Text>
        </View>

        <View style={styles.actionSection}>
          <Text style={styles.actionTitle}>Continue as</Text>

          <View style={[styles.roleContainer, isMobile && styles.roleContainerMobile]}>
            {/* Student Card */}
            <Pressable
              style={({ pressed }) => [
                styles.roleCard,
                pressed && styles.roleCardPressed,
                isMobile && styles.roleCardMobile
              ]}
              onPress={() => handleRoleSelect('student')}
            >
              <View style={[styles.cardContent, isMobile && styles.cardContentMobile]}>
                <View style={[styles.iconCircle, { backgroundColor: '#E0E7FF' }]}>
                  <Ionicons name="school" size={32} color={COLORS.primary} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.roleTitle}>Student</Text>
                  <Text style={styles.roleDescription}>Check attendance & courses</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} style={styles.arrow} />
              </View>
            </Pressable>

            {/* Teacher Card */}
            <Pressable
              style={({ pressed }) => [
                styles.roleCard,
                pressed && styles.roleCardPressed,
                isMobile && styles.roleCardMobile
              ]}
              onPress={() => handleRoleSelect('teacher')}
            >
              <View style={[styles.cardContent, isMobile && styles.cardContentMobile]}>
                <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
                  <Ionicons name="people" size={32} color={COLORS.secondary} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.roleTitle}>Teacher</Text>
                  <Text style={styles.roleDescription}>Manage classes & reports</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} style={styles.arrow} />
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerLink}>Privacy Policy</Text>
          <Text style={styles.footerDot}>•</Text>
          <Text style={styles.footerLink}>Terms of Service</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.l,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  // Decorative
  circle1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(79, 70, 229, 0.1)', // Primary transparent
    zIndex: -1,
  },
  circle2: {
    position: 'absolute',
    bottom: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Secondary transparent
    zIndex: -1,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
    marginTop: SPACING.xl,
  },
  logoContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: SPACING.l,
  },
  appName: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -1,
    marginTop: SPACING.s,
  },
  appNameMobile: {
    fontSize: 32,
  },
  tagline: {
    fontSize: 28,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '300',
    marginBottom: SPACING.m,
  },
  taglineMobile: {
    fontSize: 24,
  },
  subtext: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    maxWidth: 500,
    lineHeight: 24,
  },
  actionSection: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  actionTitle: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: COLORS.textLight,
    marginBottom: SPACING.m,
    textAlign: 'center',
    fontWeight: '600',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: SPACING.m,
  },
  roleContainerMobile: {
    flexDirection: 'column',
  },
  roleCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.soft,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  roleCardMobile: {
    width: '100%',
    marginBottom: SPACING.s,
  },
  roleCardPressed: {
    transform: [{ scale: 0.98 }],
    borderColor: COLORS.primary,
  },
  cardContent: {
    alignItems: 'center',
    padding: SPACING.m,
  },
  cardContentMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.s,
    paddingVertical: SPACING.m,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.m,
  },
  textContainer: {
    alignItems: 'center',
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  // Mobile tweaks for horizontal card layout
  arrow: {
    marginLeft: 'auto',
    opacity: 0.5,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: SPACING.xxl,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.m,
  },
  footerLink: {
    color: COLORS.textLight,
    fontSize: 12,
  },
  footerDot: {
    color: COLORS.textLight,
    fontSize: 12,
  },
});
