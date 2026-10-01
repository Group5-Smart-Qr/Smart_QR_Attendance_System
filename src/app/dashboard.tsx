// ============================================================
// GROUP 5 – Smart QR Attendance System
// Screen: DashboardScreen (dashboard.tsx)
// Design: Leaf Green (#4A7C59) + Warm Beige (#F5F0E8)
// Features: Live Clock, StudentCard, ScanButton, Stats Overview
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScanButton } from '@/components/ScanButton';
import { StudentCard } from '@/components/StudentCard';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { useAttendance } from '@/context/attendance-context';

export default function DashboardScreen() {
  const {
    studentName = 'Juan Dela Cruz',
    studentId = '2024-00123',
    course = 'BS Information Technology',
    section = 'IT-3A',
  } = useLocalSearchParams<{
    studentName?: string;
    studentId?: string;
    course?: string;
    section?: string;
  }>();

  const { stats, loadRecordsForStudent } = useAttendance();

  useEffect(() => {
    if (studentId) {
      loadRecordsForStudent(studentId);
    }
  }, [studentId, loadRecordsForStudent]);

  // ── Live Date & Time State ──────────────────────────────
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // ── Logout Handler ───────────────────────────────────────
  function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => router.replace('/'),
      },
    ]);
  }

  function handleScanPress() {
    Alert.alert(
      'Simulate QR Scan',
      'Select a status to test the Attendance Result screen:',
      [
        {
          text: 'Present ✅',
          onPress: () =>
            router.push({
              pathname: '/attendance-result',
              params: { studentName, studentId, course, section, status: 'present' },
            }),
        },
        {
          text: 'Absent ❌',
          onPress: () =>
            router.push({
              pathname: '/attendance-result',
              params: { studentName, studentId, course, section, status: 'absent' },
            }),
        },
        {
          text: 'Invalid ⚠️',
          onPress: () =>
            router.push({
              pathname: '/attendance-result',
              params: { studentName, studentId, course, section, status: 'invalid' },
            }),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.beige} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Bar / Header ── */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>Smart Attendance</Text>
            <Text style={styles.headerSubtitle}>Group 5 · CS101</Text>
          </View>

          <View style={styles.topBarActions}>
            <TouchableOpacity
              style={styles.actionIconButton}
              onPress={() =>
                router.push({
                  pathname: '/history',
                  params: { studentName, studentId },
                })
              }
              activeOpacity={0.7}
            >
              <Ionicons name="time-outline" size={20} color={Colors.darkGreen} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionIconButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={20} color={Colors.darkGreen} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Live Date & Time Card ── */}
        <View style={styles.clockCard}>
          <View style={styles.clockIconCircle}>
            <Ionicons name="time" size={22} color={Colors.white} />
          </View>
          <View style={styles.clockTextContainer}>
            <Text style={styles.liveTimeText}>{formattedTime}</Text>
            <Text style={styles.liveDateText}>{formattedDate}</Text>
          </View>
          <View style={styles.livePill}>
            <View style={styles.pulsingDot} />
            <Text style={styles.livePillText}>LIVE</Text>
          </View>
        </View>

        {/* ── Student Information Card ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Student Profile</Text>
        </View>

        <StudentCard
          studentName={studentName}
          studentId={studentId}
          course={course}
          section={section}
        />

        {/* ── Quick Stats Summary ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Attendance Overview</Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/history',
                params: { studentName, studentId },
              })
            }
            activeOpacity={0.7}
          >
            <Text style={styles.viewHistoryLink}>View History →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statBox, { borderColor: Colors.present }]}>
            <Ionicons name="checkmark-done-circle" size={24} color={Colors.present} />
            <Text style={styles.statValue}>{stats.present}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>

          <View style={[styles.statBox, { borderColor: Colors.late }]}>
            <Ionicons name="alarm-outline" size={24} color={Colors.late} />
            <Text style={styles.statValue}>{stats.late}</Text>
            <Text style={styles.statLabel}>Late</Text>
          </View>

          <View style={[styles.statBox, { borderColor: Colors.olive }]}>
            <Ionicons name="pie-chart-outline" size={24} color={Colors.leafGreen} />
            <Text style={styles.statValue}>{stats.rate}</Text>
            <Text style={styles.statLabel}>Rate</Text>
          </View>
        </View>

        {/* ── Action Scan Button ── */}
        <View style={styles.scanSection}>
          <ScanButton onPress={handleScanPress} />
        </View>

        {/* ── Attendance History Quick Card ── */}
        <TouchableOpacity
          style={styles.historyCardButton}
          onPress={() =>
            router.push({
              pathname: '/history',
              params: { studentName, studentId },
            })
          }
          activeOpacity={0.8}
        >
          <View style={styles.historyIconCircle}>
            <Ionicons name="receipt-outline" size={20} color={Colors.leafGreen} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.historyBtnTitle}>Attendance Logs</Text>
            <Text style={styles.historyBtnSubtitle}>
              Check recorded sessions and status
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.olive} />
        </TouchableOpacity>

        {/* ── Recent Activity / Notice ── */}
        <View style={styles.noticeCard}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.leafGreen} />
          <Text style={styles.noticeText}>
            Attendance cut-off is strictly 15 minutes after session starts.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.beige,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.olive,
    fontWeight: '500',
  },
  actionIconButton: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  logoutButton: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },

  // Live Clock Card
  clockCard: {
    backgroundColor: Colors.darkGreen,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.button,
  },
  clockIconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockTextContainer: {
    flex: 1,
  },
  liveTimeText: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  liveDateText: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
  },
  livePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },

  // Section Header
  sectionHeader: {
    marginTop: Spacing.xs,
  },
  sectionHeaderRow: {
    marginTop: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  viewHistoryLink: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.leafGreen,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    ...Shadow.card,
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.olive,
    fontWeight: '600',
  },

  // Scan Section
  scanSection: {
    marginTop: Spacing.xs,
  },

  // History Card Button
  historyCardButton: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  historyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyBtnTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  historyBtnSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.olive,
    marginTop: 2,
  },

  // Notice
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.lightGreen,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.leafGreen,
  },
  noticeText: {
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
});
