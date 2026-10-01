// ============================================================
// GROUP 5 – Smart QR Attendance System
// Screen: Welcome Screen (index.tsx)
// Design: Leaf Green (#4A7C59) + Warm Beige (#F5F0E8)
// Fonts:  Poppins (title/buttons) + Nunito (labels)
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';

SplashScreen.hideAsync();

// ── Leaf decoration component ──────────────────────────────
function LeafDecor({ style }: { style?: object }) {
  return (
    <View style={[styles.leafDecor, style]}>
      <Ionicons name="leaf" size={28} color={Colors.darkGreen} />
    </View>
  );
}

// ── QR Icon with animated scan line ───────────────────────
function AnimatedQRIcon() {
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const scanLineTranslate = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-55, 55],
  });

  return (
    <View style={styles.qrWrapper}>
      {/* Corner brackets */}
      <View style={[styles.corner, styles.cornerTL]} />
      <View style={[styles.corner, styles.cornerTR]} />
      <View style={[styles.corner, styles.cornerBL]} />
      <View style={[styles.corner, styles.cornerBR]} />

      {/* QR grid dots */}
      <View style={styles.qrGrid}>
        {/* Top row blocks */}
        <View style={styles.qrRow}>
          <View style={[styles.qrBlock, styles.qrBlockLg]} />
          <View style={styles.qrBlockSm} />
          <View style={[styles.qrBlock, styles.qrBlockLg]} />
        </View>
        {/* Middle row */}
        <View style={styles.qrRow}>
          <View style={styles.qrBlockSm} />
          <View style={[styles.qrBlockMd, { alignSelf: 'center' }]} />
          <View style={styles.qrBlockSm} />
        </View>
        {/* Bottom row */}
        <View style={styles.qrRow}>
          <View style={[styles.qrBlock, styles.qrBlockLg]} />
          <View style={styles.qrBlockSm} />
          <View style={styles.qrBlockMd} />
        </View>
      </View>

      {/* Animated scan line */}
      <Animated.View
        style={[
          styles.scanLine,
          { transform: [{ translateY: scanLineTranslate }] },
        ]}
      />
    </View>
  );
}

// ── Main Welcome Screen ─────────────────────────────────────
export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.leafGreen} />

      {/* ── Hero Card (Green Top Section) ── */}
      <View style={styles.heroCard}>
        <LeafDecor style={styles.leafTopLeft} />
        <LeafDecor style={[styles.leafTopLeft, styles.leafTopRight]} />
        <AnimatedQRIcon />
        <LeafDecor style={[styles.leafTopLeft, styles.leafBottomLeft]} />
        <LeafDecor style={[styles.leafTopLeft, styles.leafBottomRight]} />
      </View>

      {/* ── Content Section ── */}
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Smart QR{'\n'}Attendance</Text>
          <Text style={styles.tagline}>Scan. Track. Attend.</Text>
        </View>

        {/* Group Badge */}
        <View style={styles.badge}>
          <Ionicons name="people" size={16} color={Colors.leafGreen} />
          <Text style={styles.badgeText}>Group 5  ·  CS101</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push('/login')}
            activeOpacity={0.85}
          >
            <Ionicons name="scan-outline" size={20} color={Colors.white} />
            <Text style={styles.btnPrimaryText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            activeOpacity={0.75}
          >
            <Ionicons name="time-outline" size={20} color={Colors.darkGreen} />
            <Text style={styles.btnSecondaryText}>View History</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

// ── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.beige,
  },

  // Hero Card
  heroCard: {
    backgroundColor: Colors.leafGreen,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    flex: 0.48,
  },
  leafDecor: {
    position: 'absolute',
    opacity: 0.35,
  },
  leafTopLeft: { top: Spacing.md, left: Spacing.lg },
  leafTopRight: { left: undefined, right: Spacing.lg },
  leafBottomLeft: { top: undefined, bottom: Spacing.md },
  leafBottomRight: { top: undefined, left: undefined, bottom: Spacing.md, right: Spacing.lg },

  // QR Icon
  qrWrapper: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: Colors.white,
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  qrGrid: {
    gap: Spacing.sm,
    alignItems: 'center',
  },
  qrRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  qrBlock: { backgroundColor: Colors.white, borderRadius: 2 },
  qrBlockLg: { width: 36, height: 36 },
  qrBlockMd: { width: 20, height: 20, backgroundColor: Colors.white, borderRadius: 2 },
  qrBlockSm: { width: 10, height: 10, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 2 },
  scanLine: {
    position: 'absolute',
    width: '80%',
    height: 2.5,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 2,
    shadowColor: Colors.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },

  // Content
  content: {
    flex: 0.52,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  titleSection: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.hero,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: FontSize.md,
    color: Colors.olive,
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  badgeText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },

  // Buttons
  buttonGroup: {
    width: '100%',
    gap: Spacing.md,
  },
  btnPrimary: {
    backgroundColor: Colors.leafGreen,
    height: 56,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadow.button,
  },
  btnPrimaryText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  btnSecondary: {
    height: 56,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.darkGreen,
    backgroundColor: Colors.beige,
  },
  btnSecondaryText: {
    color: Colors.darkGreen,
    fontSize: FontSize.md,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
