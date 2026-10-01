// ============================================================
// GROUP 5 – Smart QR Attendance System
// Screen: Attendance History (history.tsx)
// Design: Leaf Green (#4A7C59) + Warm Beige (#F5F0E8)
// Role: ZINOEL — History & Data Developer
// Features: List records, Filter by status, Real-time state & AsyncStorage
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { useAttendance } from '@/context/attendance-context';
import { AttendanceRecord, AttendanceStatus } from '@/types/attendance';

type FilterType = 'all' | AttendanceStatus;

export default function HistoryScreen() {
  const { records, stats, isLoading, clearRecords, addRecord } = useAttendance();
  const { studentName, studentId } = useLocalSearchParams<{
    studentName?: string;
    studentId?: string;
  }>();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Filter records based on selected chip
  const filteredRecords = useMemo(() => {
    if (activeFilter === 'all') return records;
    return records.filter((item) => item.status === activeFilter);
  }, [records, activeFilter]);

  // Handle clearing all records with confirmation
  function handleClearAll() {
    if (records.length === 0) {
      Alert.alert('Empty History', 'There are no attendance records to clear.');
      return;
    }

    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all attendance records? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearRecords();
            } catch (err) {
              Alert.alert('Error', 'Failed to clear records.');
            }
          },
        },
      ]
    );
  }

  // Quick test generator to verify storage and context on-device
  function handleAddTestRecord() {
    const sampleStatuses: AttendanceStatus[] = ['present', 'present', 'late', 'present'];
    const randomStatus = sampleStatuses[Math.floor(Math.random() * sampleStatuses.length)];
    
    addRecord({
      studentName: studentName || 'Juan Dela Cruz',
      studentId: studentId || '2024-00123',
      course: 'BS Information Technology',
      section: 'IT-3A',
      subject: 'CS101',
      status: randomStatus,
    });
  }

  // Helper for status badge styling
  function getStatusStyle(status: AttendanceStatus) {
    switch (status) {
      case 'present':
        return {
          bg: Colors.presentBg,
          text: Colors.present,
          icon: 'checkmark-circle' as const,
        };
      case 'late':
        return {
          bg: Colors.lateBg,
          text: Colors.late,
          icon: 'time' as const,
        };
      case 'absent':
        return {
          bg: Colors.absentBg,
          text: Colors.absent,
          icon: 'close-circle' as const,
        };
    }
  }

  const renderItem = ({ item }: { item: AttendanceRecord }) => {
    const statusCfg = getStatusStyle(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.subjectContainer}>
            <View style={styles.subjectIconCircle}>
              <Ionicons name="book-outline" size={16} color={Colors.leafGreen} />
            </View>
            <View>
              <Text style={styles.subjectTitle}>{item.subject || 'CS101'}</Text>
              <Text style={styles.sectionText}>Section {item.section}</Text>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Ionicons name={statusCfg.icon} size={14} color={statusCfg.text} />
            <Text style={[styles.statusText, { color: statusCfg.text }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooter}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={Colors.olive} />
            <Text style={styles.metaText}>{item.date}</Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color={Colors.olive} />
            <Text style={styles.metaText}>{item.time}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.beige} />

      {/* ── Top Navigation Bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.darkGreen} />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Attendance History</Text>
          <Text style={styles.headerSubtitle}>
            {records.length} {records.length === 1 ? 'Record' : 'Records'} logged
          </Text>
        </View>

        <TouchableOpacity
          style={styles.circleBtn}
          onPress={handleClearAll}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.absent} />
        </TouchableOpacity>
      </View>

      {/* ── Overview Summary Row ── */}
      <View style={styles.overviewCard}>
        <View style={styles.statCol}>
          <Text style={[styles.statNum, { color: Colors.present }]}>{stats.present}</Text>
          <Text style={styles.statLbl}>Present</Text>
        </View>
        <View style={styles.vertDivider} />
        <View style={styles.statCol}>
          <Text style={[styles.statNum, { color: Colors.late }]}>{stats.late}</Text>
          <Text style={styles.statLbl}>Late</Text>
        </View>
        <View style={styles.vertDivider} />
        <View style={styles.statCol}>
          <Text style={[styles.statNum, { color: Colors.leafGreen }]}>{stats.rate}</Text>
          <Text style={styles.statLbl}>Attended</Text>
        </View>
      </View>

      {/* ── Filter Chips ── */}
      <View style={styles.filterBar}>
        {(['all', 'present', 'late', 'absent'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, activeFilter === f && styles.chipActive]}
            onPress={() => setActiveFilter(f)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Records List or Empty State ── */}
      {filteredRecords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="calendar-outline" size={48} color={Colors.olive} />
          </View>
          <Text style={styles.emptyTitle}>No Records Found</Text>
          <Text style={styles.emptySubtitle}>
            {activeFilter === 'all'
              ? 'You have not marked any attendance yet. Scan a classroom QR code to log attendance.'
              : `No attendance entries found with status "${activeFilter}".`}
          </Text>

          {activeFilter === 'all' && (
            <TouchableOpacity
              style={styles.testBtn}
              onPress={handleAddTestRecord}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={18} color={Colors.white} />
              <Text style={styles.testBtnText}>Simulate Attendance Log</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.beige,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  headerTitleBox: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.olive,
    marginTop: 2,
  },

  // Overview summary card
  overviewCard: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  statLbl: {
    fontSize: FontSize.xs,
    color: Colors.olive,
    fontWeight: '600',
    marginTop: 2,
  },
  vertDivider: {
    width: 1,
    height: '60%',
    backgroundColor: Colors.creamWhite,
  },

  // Filter Bar
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    flex: 1,
    backgroundColor: Colors.creamWhite,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.pill,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.leafGreen,
    borderColor: Colors.leafGreen,
  },
  chipText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.olive,
  },
  chipTextActive: {
    color: Colors.white,
  },

  // List
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  subjectIconCircle: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionText: {
    fontSize: FontSize.xs,
    color: Colors.olive,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.creamWhite,
    marginVertical: Spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    marginTop: Spacing.xxl,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.olive,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.leafGreen,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
    ...Shadow.button,
  },
  testBtnText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
