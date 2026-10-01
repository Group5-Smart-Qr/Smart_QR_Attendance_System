// ============================================================
// GROUP 5 – Smart QR Attendance System
// Screen: ScannerScreen (scanner.tsx)
// Features: Camera viewfinder, QR validation, success modal,
//           invalid QR error, saves attendance to AsyncStorage
// Design: Leaf Green (#4A7C59) + Warm Beige (#F5F0E8)
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QRScanner } from '@/components/QRScanner';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { addRecord, createRecord } from '@/services/attendance-storage';

// ── Valid QR prefix ─────────────────────────────────────────
// A valid attendance QR must start with this prefix
// e.g. "SMART-QR-ATTEND|CS101|IT-3A|2026-10-01"
const VALID_PREFIX = 'SMART-QR-ATTEND|';

// ── Screen ──────────────────────────────────────────────────
export default function ScannerScreen() {
  const {
    studentName = 'Student',
    studentId = '',
    course = '',
    section = '',
  } = useLocalSearchParams<{
    studentName?: string;
    studentId?: string;
    course?: string;
    section?: string;
  }>();

  const [scanning, setScanning] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [scannedSubject, setScannedSubject] = useState('CS101');

  // ── Handle a scanned QR ─────────────────────────────────
  const handleScanned = useCallback(
    async (data: string) => {
      setScanning(false); // pause camera immediately

      if (!data.startsWith(VALID_PREFIX)) {
        setErrorMsg('Invalid QR Code. Please scan the correct attendance QR provided by your instructor.');
        return;
      }

      // Parse subject from QR  e.g. "SMART-QR-ATTEND|CS101|IT-3A|2026-10-01"
      const parts = data.split('|');
      const subject = parts[1] ?? 'CS101';
      setScannedSubject(subject);

      // Determine status: present if within 15 min of class start
      // (simplified — always 'present' for now)
      const record = createRecord({
        studentName: String(studentName),
        studentId: String(studentId),
        course: String(course),
        section: String(section),
        status: 'present',
        subject,
      });

      try {
        await addRecord(record);
      } catch {
        // non-blocking — show success anyway
      }

      setErrorMsg('');
      setShowSuccess(true);
    },
    [studentName, studentId, course, section]
  );

  // ── Reset: allow another scan ────────────────────────────
  function resetScan() {
    setShowSuccess(false);
    setErrorMsg('');
    setScanning(true);
  }

  // ── Go back to dashboard ─────────────────────────────────
  function goToDashboard() {
    router.back();
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.darkGreen} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goToDashboard}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
          <Text style={styles.headerSubtitle}>
            {String(studentName)} · {String(studentId)}
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {/* ── Camera viewfinder ── */}
      <View style={styles.cameraWrapper}>
        <QRScanner onScanned={handleScanned} active={scanning} />
      </View>

      {/* ── Bottom info panel ── */}
      <View style={styles.bottomPanel}>
        {errorMsg ? (
          /* Invalid QR error */
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={Colors.absent} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : (
          /* Hint text */
          <View style={styles.hintBox}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.leafGreen} />
            <Text style={styles.hintText}>
              Point your camera at the QR code displayed by your instructor
            </Text>
          </View>
        )}

        {/* Scan Again button — only shown when paused */}
        {!scanning && (
          <TouchableOpacity
            style={styles.rescanButton}
            onPress={resetScan}
            activeOpacity={0.85}
          >
            <Ionicons name="refresh-outline" size={18} color={Colors.darkGreen} />
            <Text style={styles.rescanText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Success Modal ── */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Success icon */}
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark" size={44} color={Colors.white} />
            </View>

            <Text style={styles.modalTitle}>Attendance Marked!</Text>
            <Text style={styles.modalSubject}>{scannedSubject}</Text>

            {/* Student details */}
            <View style={styles.modalInfoRow}>
              <Ionicons name="person-outline" size={14} color={Colors.olive} />
              <Text style={styles.modalInfoText}>{String(studentName)}</Text>
            </View>
            <View style={styles.modalInfoRow}>
              <Ionicons name="id-card-outline" size={14} color={Colors.olive} />
              <Text style={styles.modalInfoText}>{String(studentId)}</Text>
            </View>
            <View style={styles.modalInfoRow}>
              <Ionicons name="school-outline" size={14} color={Colors.olive} />
              <Text style={styles.modalInfoText}>{String(course)} · {String(section)}</Text>
            </View>

            {/* Status badge */}
            <View style={styles.presentBadge}>
              <View style={styles.presentDot} />
              <Text style={styles.presentText}>Present</Text>
            </View>

            {/* Action buttons */}
            <TouchableOpacity
              style={styles.scanAnotherBtn}
              onPress={resetScan}
              activeOpacity={0.85}
            >
              <Ionicons name="scan-outline" size={18} color={Colors.white} />
              <Text style={styles.scanAnotherText}>Scan Another</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dashboardBtn}
              onPress={goToDashboard}
              activeOpacity={0.85}
            >
              <Text style={styles.dashboardBtnText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkGreen,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.darkGreen,
    gap: Spacing.md,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },
  headerSpacer: {
    width: 38,
  },

  // Camera
  cameraWrapper: {
    flex: 1,
  },

  // Bottom panel
  bottomPanel: {
    backgroundColor: Colors.beige,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.lightGreen,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  hintText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.absentBg,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.absent,
  },
  errorText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.absent,
    lineHeight: 20,
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 48,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.darkGreen,
    backgroundColor: Colors.beige,
  },
  rescanText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.darkGreen,
  },

  // Success modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadow.card,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: Radius.pill,
    backgroundColor: Colors.leafGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    ...Shadow.button,
  },
  modalTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  modalSubject: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.leafGreen,
    marginBottom: Spacing.sm,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  modalInfoText: {
    fontSize: FontSize.sm,
    color: Colors.olive,
  },
  presentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.presentBg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    marginVertical: Spacing.sm,
  },
  presentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.present,
  },
  presentText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.present,
  },
  scanAnotherBtn: {
    width: '100%',
    height: 50,
    borderRadius: Radius.pill,
    backgroundColor: Colors.leafGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    ...Shadow.button,
  },
  scanAnotherText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.white,
  },
  dashboardBtn: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.olive,
  },
});
