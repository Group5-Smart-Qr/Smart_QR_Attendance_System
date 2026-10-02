// ============================================================
// GROUP 5 – Smart QR Attendance System
// Role: BALDO — QR Scanner Developer
// Component: ScanButton.tsx
// Features: Action button to trigger QR scanning
// Props: onPress, title, subtitle, disabled
// Design: Leaf Green (#4A7C59) + Warm Beige (#F5F0E8)
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';

export interface ScanButtonProps {
  onPress: () => void;
  title?: string;
  subtitle?: string;
  disabled?: boolean;
}

export function ScanButton({
  onPress,
  title = 'Scan Attendance QR',
  subtitle = 'Point camera at classroom QR code',
  disabled = false,
}: ScanButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <View style={styles.iconCircle}>
        <Ionicons name="qr-code-outline" size={26} color={Colors.white} />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.arrowCircle}>
        <Ionicons name="chevron-forward" size={18} color={Colors.white} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.leafGreen,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.button,
  },
  disabled: {
    opacity: 0.6,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.85)',
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
