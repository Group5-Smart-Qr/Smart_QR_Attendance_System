// ============================================================
// GROUP 5 – Smart QR Attendance System
// Component: AttendanceCard
// Shows: Student name, ID, course, section, time, date
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { AttendanceStatus } from '@/components/StatusMessage';

const STATUS_BORDER: Record<AttendanceStatus, string> = {
  present: Colors.present,
  late: Colors.late,
  absent: Colors.absent,
  invalid: Colors.textMuted,
};

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  invalid: 'Invalid',
};

const STATUS_BG: Record<AttendanceStatus, string> = {
  present: Colors.presentBg,
  late: Colors.lateBg,
  absent: Colors.absentBg,
  invalid: Colors.beige,
};

type Props = {
  studentName: string;
  studentId: string;
  course: string;
  section: string;
  status: AttendanceStatus;
  timestamp: string;  // e.g. "10:45 AM"
  date: string;       // e.g. "October 1, 2026"
  subject?: string;   // e.g. "CS101"
};

export function AttendanceCard({
  studentName,
  studentId,
  course,
  section,
  status,
  timestamp,
  date,
  subject,
}: Props) {
  const borderColor = STATUS_BORDER[status] || Colors.textMuted;
  const statusLabel = STATUS_LABEL[status] || 'Invalid';
  const statusBg = STATUS_BG[status] || Colors.beige;

  return (
    <View style={[styles.card, { borderLeftColor: borderColor }]}>
      {/* Student Info */}
      <View style={styles.studentRow}>
        <View style={[styles.avatarCircle, { backgroundColor: borderColor }]}>
          <Ionicons name="person" size={22} color={Colors.white} />
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{studentName}</Text>
          <Text style={styles.studentId}>{studentId}</Text>
        </View>
        {/* Status pill */}
        <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
          <Text style={[styles.statusPillText, { color: borderColor }]}>{statusLabel}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Subject, Course & Section */}
      <View style={styles.row}>
        <Ionicons name="book-outline" size={16} color={Colors.leafGreen} />
        <Text style={styles.subjectText}>{subject || 'CS101'}</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="school-outline" size={16} color={Colors.olive} />
        <Text style={styles.metaText}>{course}</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="people-outline" size={16} color={Colors.olive} />
        <Text style={styles.metaText}>Section: {section}</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Time & Date */}
      <View style={styles.row}>
        <Ionicons name="time-outline" size={16} color={Colors.olive} />
        <Text style={styles.timeText}>{timestamp}</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="calendar-outline" size={16} color={Colors.olive} />
        <Text style={styles.metaText}>{date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    borderLeftWidth: 5,
    gap: Spacing.sm,
    ...Shadow.card,
  },

  // Student row
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentInfo: {
    flex: 1,
    gap: 2,
  },
  studentName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  studentId: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },

  // Status pill
  statusPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },
  statusPillText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Meta rows
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  metaText: {
    fontSize: FontSize.sm,
    color: Colors.olive,
  },
  subjectText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.leafGreen,
  },
  timeText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
