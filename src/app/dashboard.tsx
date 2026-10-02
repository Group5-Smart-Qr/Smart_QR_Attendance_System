// ============================================================
// GROUP 5 – Smart QR Attendance System
// Screen: DashboardScreen (dashboard.tsx)
// Design: Leaf Green (#4A7C59) + Warm Beige (#F5F0E8)
// Features: Live Clock, StudentCard (with Edit Profile),
//           ScanButton, Stats Overview, Logout Modal
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScanButton } from '@/components/ScanButton';
import { StudentCard } from '@/components/StudentCard';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { useAttendance } from '@/context/attendance-context';

const COURSES = [
  'BS Information Technology',
  'BS Computer Science',
  'BS Information Systems',
  'BS Computer Engineering',
];

const SECTIONS = ['IT-3A', 'IT-3B', 'CS-3A', 'CS-3B'];

export default function DashboardScreen() {
  const params = useLocalSearchParams<{
    studentName?: string;
    studentId?: string;
    course?: string;
    section?: string;
  }>();

  const studentId = params.studentId || '2024305392';

  // ── Profile State (Editable) ────────────────────────────
  const [currentName, setCurrentName] = useState(
    params.studentName || 'Joebelle Dumapias'
  );
  const [currentCourse, setCurrentCourse] = useState(
    params.course || COURSES[0]
  );
  const [currentSection, setCurrentSection] = useState(
    params.section || SECTIONS[0]
  );

  // ── Edit Profile Modal State ────────────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(currentName);
  const [editCourse, setEditCourse] = useState(currentCourse);
  const [editSection, setEditSection] = useState(currentSection);

  // ── Logout Modal State ──────────────────────────────────
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ── Attendance Context ──────────────────────────────────
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

  // ── Handlers ─────────────────────────────────────────────
  function handleOpenEditProfile() {
    setEditName(currentName);
    setEditCourse(currentCourse);
    setEditSection(currentSection);
    setShowEditModal(true);
  }

  function handleSaveProfile() {
    if (!editName.trim()) {
      Alert.alert('Validation', 'Please enter a valid student name.');
      return;
    }
    setCurrentName(editName.trim());
    setCurrentCourse(editCourse);
    setCurrentSection(editSection);
    setShowEditModal(false);
  }

  function handleLogoutPress() {
    setShowLogoutModal(true);
  }

  function confirmLogout() {
    setShowLogoutModal(false);
    router.replace('/');
  }

  function handleScanPress() {
    router.push({
      pathname: '/scanner',
      params: {
        studentName: currentName,
        studentId,
        course: currentCourse,
        section: currentSection,
      },
    });
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
                  params: { studentName: currentName, studentId },
                })
              }
              activeOpacity={0.7}
            >
              <Ionicons name="time-outline" size={20} color={Colors.darkGreen} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionIconButton}
              onPress={handleLogoutPress}
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

        {/* ── Student Information Card (With Edit Button) ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Student Profile</Text>
          <TouchableOpacity
            onPress={handleOpenEditProfile}
            style={styles.editProfileChip}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={12} color={Colors.leafGreen} />
            <Text style={styles.editProfileChipText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <StudentCard
          studentName={currentName}
          studentId={studentId}
          course={currentCourse}
          section={currentSection}
          onEdit={handleOpenEditProfile}
        />

        {/* ── Quick Stats Summary ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Attendance Overview</Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/history',
                params: { studentName: currentName, studentId },
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
              params: { studentName: currentName, studentId },
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

      {/* ── Edit Profile Modal ── */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.editModalHeader}>
              <View style={styles.editAvatarMini}>
                <Ionicons name="person" size={20} color={Colors.white} />
              </View>
              <Text style={styles.modalTitle}>Edit Student Profile</Text>
            </View>

            <Text style={styles.modalIdHint}>Student ID: {studentId}</Text>

            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your full name"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            {/* Course Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Course</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {COURSES.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.modalChip,
                        editCourse === c && styles.modalChipSelected,
                      ]}
                      onPress={() => setEditCourse(c)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.modalChipText,
                          editCourse === c && styles.modalChipTextSelected,
                        ]}
                      >
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Section Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Section</Text>
              <View style={styles.chipRow}>
                {SECTIONS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.modalChip,
                      editSection === s && styles.modalChipSelected,
                    ]}
                    onPress={() => setEditSection(s)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.modalChipText,
                        editSection === s && styles.modalChipTextSelected,
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowEditModal(false)}
                activeOpacity={0.75}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveProfile}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSaveText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Custom Logout Confirmation Modal ── */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="log-out" size={32} color={Colors.absent} />
            </View>

            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to end your session and return to the welcome screen?
            </Text>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.75}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={confirmLogout}
                activeOpacity={0.85}
              >
                <Text style={styles.modalConfirmText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  editProfileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  editProfileChipText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
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

  // Modals Common Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    ...Shadow.card,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.olive,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
    marginTop: Spacing.xs,
  },
  modalIdHint: {
    fontSize: FontSize.xs,
    color: Colors.olive,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  editModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  editAvatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.leafGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: Spacing.md,
    gap: 4,
  },
  inputLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginLeft: 2,
  },
  textInput: {
    backgroundColor: Colors.creamWhite,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  modalChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.creamWhite,
  },
  modalChipSelected: {
    backgroundColor: Colors.leafGreen,
    borderColor: Colors.leafGreen,
  },
  modalChipText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.olive,
  },
  modalChipTextSelected: {
    color: Colors.white,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
    marginTop: Spacing.md,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.creamWhite,
  },
  modalCancelText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.olive,
  },
  modalSaveBtn: {
    flex: 1.2,
    height: 48,
    borderRadius: Radius.pill,
    backgroundColor: Colors.leafGreen,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.button,
  },
  modalSaveText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.white,
  },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: Radius.pill,
    backgroundColor: Colors.absentBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  modalConfirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: Radius.pill,
    backgroundColor: Colors.absent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.white,
  },
});
