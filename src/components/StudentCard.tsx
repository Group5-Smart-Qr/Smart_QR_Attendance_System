// ============================================================
// GROUP 5 – Smart QR Attendance System
// Component: StudentCard.tsx
// Props: studentName, studentId, course, section, onEdit
// Design: Leaf Green (#4A7C59) + Warm Beige (#F5F0E8)
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';

export interface StudentCardProps {
  studentName?: string;
  studentId?: string;
  course?: string;
  section?: string;
  onEdit?: () => void;
}

export function StudentCard({
  studentName = 'Juan Dela Cruz',
  studentId = '2024-00123',
  course = 'BS Information Technology',
  section = 'IT-3A',
  onEdit,
}: StudentCardProps) {
  // Extract initials for the avatar
  const initials = (studentName || 'ST')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  return (
    <View style={styles.card}>
      {/* Top section: Avatar + Name + Status / Edit */}
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || 'ST'}</Text>
        </View>

        <View style={styles.nameContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.studentName} numberOfLines={1}>
              {studentName}
            </Text>
            {onEdit && (
              <TouchableOpacity
                style={styles.editIconButton}
                onPress={onEdit}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="pencil" size={14} color={Colors.leafGreen} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.idRow}>
            <Ionicons name="id-card-outline" size={14} color={Colors.olive} />
            <Text style={styles.studentId}>{studentId}</Text>
          </View>
        </View>

        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Active</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom details: Course & Section */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>COURSE</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {course}
          </Text>
        </View>

        <View style={styles.sectionBadge}>
          <Text style={styles.sectionLabel}>SEC</Text>
          <Text style={styles.sectionValue}>{section}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    backgroundColor: Colors.leafGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  nameContainer: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  studentName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  editIconButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  studentId: {
    fontSize: FontSize.sm,
    color: Colors.olive,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.presentBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.present,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.present,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.creamWhite,
    marginVertical: Spacing.md,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  detailItem: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  detailValue: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sectionBadge: {
    backgroundColor: Colors.creamWhite,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  sectionValue: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.leafGreen,
  },
});
