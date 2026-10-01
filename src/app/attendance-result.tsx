// ============================================================
// GROUP 5 – Smart QR Attendance System
// Screen: Attendance Result Screen (attendance-result.tsx)
// JANINE – Attendance Result Developer
// Shows: Status, Student Info Card, Done button
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AttendanceCard } from '@/components/AttendanceCard';
import { AttendanceStatus, StatusMessage } from '@/components/StatusMessage';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';

// ── Business Validation Logic ───────────────────────────────
function validateStatus(raw: string | string[] | undefined): AttendanceStatus {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === 'present' || value === 'absent' || value === 'invalid') {
    return value;
  }
  return 'invalid'; // Default: unrecognised QR = invalid
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ── Background tint per status ─────────────────────────────
const STATUS_BG: Record<AttendanceStatus, string> = {
  present: '#F0FAF3',
  absent: '#FFF5F5',
  invalid: Colors.beige,
};

// ── Main Screen ─────────────────────────────────────────────
export default function AttendanceResultScreen() {
  const params = useLocalSearchParams<{
    studentName?: string;
    studentId?: string;
    course?: string;
    section?: string;
    status?: string;
  }>();

  // Validate the status from params
  const status = useMemo(() => validateStatus(params.status), [params.status]);

  // Capture the timestamp at mount (moment of scan result)
  const scannedAt = useMemo(() => new Date(), []);
  const timestamp = formatTime(scannedAt);
  const date = formatDate(scannedAt);

  const bgColor = STATUS_BG[status];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor={bgColor} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.darkGreen} />
        </TouchableOpacity>

        {/* Page Title */}
        <Text style={styles.pageTitle}>Attendance Result</Text>

        {/* Status Message — animated icon + text */}
        <StatusMessage status={status} />

        {/* Attendance Card — student info + time */}
        <AttendanceCard
          studentName={params.studentName || 'Juan Dela Cruz'}
          studentId={params.studentId || '2024-00123'}
          course={params.course || 'BS Information Technology'}
          section={params.section || 'IT-3A'}
          status={status}
          timestamp={timestamp}
          date={date}
        />

        {/* Done Button */}
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() =>
            router.replace({
              pathname: '/dashboard',
              params: {
                studentName: params.studentName,
                studentId: params.studentId,
                course: params.course,
                section: params.section,
              },
            })
          }
          activeOpacity={0.85}
        >
          <Ionicons name="home-outline" size={20} color={Colors.white} />
          <Text style={styles.doneBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>Group 5  ·  Smart QR Attendance System</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },

  // Back button
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    ...Shadow.card,
  },

  // Title
  pageTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: Spacing.xl,
  },

  // Done button
  doneBtn: {
    backgroundColor: Colors.leafGreen,
    height: 56,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    ...Shadow.button,
  },
  doneBtnText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Footer
  footer: {
    textAlign: 'center',
    marginTop: Spacing.xl,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
});
