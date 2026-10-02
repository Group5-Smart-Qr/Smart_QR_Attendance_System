// ============================================================
// GROUP 5 – Smart QR Attendance System
// Screen: ScannerScreen (scanner.tsx)
// Features: Camera viewfinder, Universal QR format parser (accepts any
//           online or generated QR format), duplicate scan prevention,
//           success modal & duplicate alert modal, AsyncStorage sync
// Design: Leaf Green (#4A7C59) + Warm Beige (#F5F0E8)
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QRScanner } from '@/components/QRScanner';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { useAttendance } from '@/context/attendance-context';
import { AttendanceRecord } from '@/types/attendance';

// ── Smart QR Parser ──────────────────────────────────────────
// Accepts any online QR code format: URL, JSON, delimited text,
// key-value pair, system prefix, or arbitrary text generator format.
interface ParsedQR {
  subject: string;
  formatType: string;
  details?: string;
  raw: string;
}

function parseQRData(raw: string): ParsedQR {
  const trimmed = (raw || '').trim();

  if (!trimmed) {
    return {
      subject: 'General Class',
      formatType: 'Unknown Format',
      raw,
    };
  }

  // 1. System Prefix format: "SMART-QR-ATTEND|CS101|IT-3A|2026-10-01" or "ATTENDANCE|..."
  if (
    trimmed.startsWith('SMART-QR-ATTEND|') ||
    trimmed.startsWith('ATTENDANCE|') ||
    trimmed.startsWith('QR-ATTEND|')
  ) {
    const parts = trimmed.split('|');
    const subject = parts[1]?.trim() || 'CS101';
    const extra = parts.slice(2).filter(Boolean).join(' · ');
    return {
      subject,
      formatType: 'System QR Code',
      details: extra || undefined,
      raw: trimmed,
    };
  }

  // 2. JSON Format (online QR code generators exporting JSON objects)
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'object' && parsed !== null) {
        const candidateSubject =
          parsed.subject ||
          parsed.subjectName ||
          parsed.course ||
          parsed.courseCode ||
          parsed.courseName ||
          parsed.class ||
          parsed.className ||
          parsed.title ||
          parsed.code ||
          parsed.name ||
          parsed.id ||
          'Online QR Class';

        const extraInfo = [
          parsed.section ? `Sec ${parsed.section}` : null,
          parsed.room ? `Room ${parsed.room}` : null,
          parsed.instructor ? `Prof ${parsed.instructor}` : null,
        ]
          .filter(Boolean)
          .join(' · ');

        return {
          subject: String(candidateSubject).trim(),
          formatType: 'Online JSON QR',
          details: extraInfo || undefined,
          raw: trimmed,
        };
      }
    } catch {
      // JSON parse failed, proceed to next parser
    }
  }

  // 3. Web URL QR Code (Google Forms, Classroom, Website, or Query params)
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('www.')
  ) {
    try {
      const fullUrl = trimmed.startsWith('www.') ? `https://${trimmed}` : trimmed;
      const urlObj = new URL(fullUrl);
      const params = urlObj.searchParams;

      const subjectParam =
        params.get('subject') ||
        params.get('course') ||
        params.get('class') ||
        params.get('code') ||
        params.get('title') ||
        params.get('name');

      if (subjectParam) {
        return {
          subject: decodeURIComponent(subjectParam).trim(),
          formatType: 'Online Web QR',
          details: urlObj.hostname,
          raw: trimmed,
        };
      }

      // Check pathname for slug (e.g. /classes/cs101 or /attend/math)
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        const lastSegment = decodeURIComponent(pathSegments[pathSegments.length - 1]);
        if (lastSegment.length > 0 && lastSegment.length <= 40) {
          const readable = lastSegment.replace(/[-_]/g, ' ').trim();
          return {
            subject: readable.toUpperCase(),
            formatType: 'Online Web QR',
            details: urlObj.hostname,
            raw: trimmed,
          };
        }
      }

      return {
        subject: urlObj.hostname.replace('www.', ''),
        formatType: 'Online Web QR',
        details: trimmed.length > 40 ? trimmed.substring(0, 40) + '...' : trimmed,
        raw: trimmed,
      };
    } catch {
      // URL parse failed, continue
    }
  }

  // 4. Key-Value text (e.g., "Subject: CS101" or "Course=IT301; Date=2026-10-02")
  const kvMatch = trimmed.match(/(?:subject|course|class|title|code)[:=]\s*([^,\n\r|;]+)/i);
  if (kvMatch && kvMatch[1]) {
    return {
      subject: kvMatch[1].trim(),
      formatType: 'Formatted Text QR',
      raw: trimmed,
    };
  }

  // 5. Delimited text (e.g., "CS101, IT-3A, 2026-10-02" or "CS101;Lecture")
  if (trimmed.includes('|') || trimmed.includes(';') || trimmed.includes(',')) {
    const delimiter = trimmed.includes('|') ? '|' : trimmed.includes(';') ? ';' : ',';
    const segments = trimmed
      .split(delimiter)
      .map((s) => s.trim())
      .filter(Boolean);

    if (segments.length > 0 && segments[0].length <= 50) {
      return {
        subject: segments[0],
        formatType: 'Delimited QR Code',
        details: segments.slice(1).join(' · ') || undefined,
        raw: trimmed,
      };
    }
  }

  // 6. Any other Plain Text from any online QR generator
  const firstLine = trimmed.split(/[\r\n]+/)[0].trim();
  const cleanSubject =
    firstLine.length > 45 ? `${firstLine.substring(0, 42)}...` : firstLine;

  return {
    subject: cleanSubject || 'General Attendance',
    formatType: 'Online QR Code',
    details: trimmed.length > 45 ? `${trimmed.substring(0, 45)}...` : undefined,
    raw: trimmed,
  };
}

// ── Screen Component ─────────────────────────────────────────
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

  const { addRecord, records } = useAttendance();
  const [scanning, setScanning] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDuplicate, setShowDuplicate] = useState(false);

  // Scanned info states
  const [scannedInfo, setScannedInfo] = useState<ParsedQR | null>(null);
  const [existingDuplicate, setExistingDuplicate] = useState<AttendanceRecord | null>(null);

  // Guard to prevent multiple simultaneous scan events in the same millisecond
  const isProcessingRef = useRef(false);

  // ── Handle a scanned QR ─────────────────────────────────
  const handleScanned = useCallback(
    async (rawCode: string) => {
      // Guard against rapid duplicate triggers from camera stream
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      setScanning(false); // Pause camera immediately

      if (!rawCode || !rawCode.trim()) {
        setErrorMsg('Scanned QR code is empty or unreadable. Please try again.');
        isProcessingRef.current = false;
        return;
      }

      // Universal QR Parser accepts any online/offline format
      const parsed = parseQRData(rawCode);
      setScannedInfo(parsed);

      const targetStudentId = String(studentId || '').trim();
      const currentSubject = parsed.subject.trim().toLowerCase();
      const todayDate = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

      // ── Duplicate Scan Prevention ─────────────────────────
      // Check if student has already marked attendance for this subject today
      const duplicateFound = records.find((rec) => {
        const isSameStudent =
          !targetStudentId ||
          rec.studentId.trim().toLowerCase() === targetStudentId.toLowerCase();
        const isSameSubject =
          rec.subject.trim().toLowerCase() === currentSubject;
        const isSameDate = rec.date === todayDate;

        return isSameStudent && isSameSubject && isSameDate;
      });

      if (duplicateFound) {
        // DUPLICATE DETECTED: Prevent saving and alert the user
        setExistingDuplicate(duplicateFound);
        setShowDuplicate(true);
        setErrorMsg(
          `Duplicate scan: Attendance for "${parsed.subject}" was already recorded today at ${duplicateFound.time}.`
        );
        isProcessingRef.current = false;
        return;
      }

      // ── New Attendance Record ──────────────────────────────
      try {
        await addRecord({
          studentName: String(studentName || 'Student'),
          studentId: String(studentId || '2024-00000'),
          course: String(course || 'BS Information Technology'),
          section: String(section || 'IT-3A'),
          status: 'present',
          subject: parsed.subject,
        });
      } catch (err) {
        console.warn('Failed to save record to storage:', err);
      }

      setErrorMsg('');
      setShowSuccess(true);
      isProcessingRef.current = false;
    },
    [studentName, studentId, course, section, records, addRecord]
  );

  // ── Reset: allow another scan ────────────────────────────
  function resetScan() {
    isProcessingRef.current = false;
    setShowSuccess(false);
    setShowDuplicate(false);
    setExistingDuplicate(null);
    setScannedInfo(null);
    setErrorMsg('');
    setScanning(true);
  }

  // ── Go back to dashboard ─────────────────────────────────
  function goToDashboard() {
    router.back();
  }

  // ── Navigate to history screen ───────────────────────────
  function goToHistory() {
    setShowDuplicate(false);
    setShowSuccess(false);
    router.push({
      pathname: '/history',
      params: {
        studentName: String(studentName),
        studentId: String(studentId),
      },
    });
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
            {String(studentName)} · {String(studentId || 'Universal Scanner')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.historyShortcutBtn}
          onPress={goToHistory}
          activeOpacity={0.7}
        >
          <Ionicons name="time-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* ── Camera viewfinder ── */}
      <View style={styles.cameraWrapper}>
        <QRScanner onScanned={handleScanned} active={scanning} />
      </View>

      {/* ── Bottom info panel ── */}
      <View style={styles.bottomPanel}>
        {errorMsg ? (
          /* Error / Duplicate Warning Box */
          <View style={styles.errorBox}>
            <Ionicons
              name={showDuplicate ? 'warning' : 'alert-circle'}
              size={20}
              color={showDuplicate ? Colors.late : Colors.absent}
            />
            <Text
              style={[
                styles.errorText,
                showDuplicate && { color: Colors.late },
              ]}
            >
              {errorMsg}
            </Text>
          </View>
        ) : (
          /* Hint text explaining universal QR acceptance */
          <View style={styles.hintBox}>
            <Ionicons
              name="qr-code-outline"
              size={18}
              color={Colors.leafGreen}
            />
            <Text style={styles.hintText}>
              Point camera at any attendance QR code, online generator code, or classroom display
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
            <Text style={styles.modalSubject}>
              {scannedInfo?.subject || 'CS101'}
            </Text>

            {/* QR format badge */}
            {scannedInfo?.formatType && (
              <View style={styles.qrFormatBadge}>
                <Ionicons name="barcode-outline" size={12} color={Colors.olive} />
                <Text style={styles.qrFormatText}>
                  {scannedInfo.formatType}
                  {scannedInfo.details ? ` (${scannedInfo.details})` : ''}
                </Text>
              </View>
            )}

            {/* Student details */}
            <View style={styles.detailsCard}>
              <View style={styles.modalInfoRow}>
                <Ionicons name="person-outline" size={14} color={Colors.olive} />
                <Text style={styles.modalInfoText}>{String(studentName)}</Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Ionicons name="id-card-outline" size={14} color={Colors.olive} />
                <Text style={styles.modalInfoText}>
                  {String(studentId || 'N/A')}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Ionicons name="school-outline" size={14} color={Colors.olive} />
                <Text style={styles.modalInfoText}>
                  {String(course || 'BSIT')} · {String(section || 'Regular')}
                </Text>
              </View>
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

      {/* ── Duplicate Scan Alert Modal ── */}
      <Modal visible={showDuplicate} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Warning icon */}
            <View style={styles.duplicateIconCircle}>
              <Ionicons name="alert" size={40} color={Colors.white} />
            </View>

            <Text style={styles.duplicateModalTitle}>Duplicate Scan</Text>
            <Text style={styles.duplicateModalSubtitle}>
              Attendance Already Recorded Today
            </Text>

            {/* Subject info */}
            <View style={styles.duplicateSubjectBox}>
              <Ionicons name="book-outline" size={18} color={Colors.late} />
              <Text style={styles.duplicateSubjectText}>
                {scannedInfo?.subject || 'Class'}
              </Text>
            </View>

            {/* Duplicate Notice details */}
            <View style={styles.duplicateInfoCard}>
              <View style={styles.duplicateInfoRow}>
                <Ionicons name="calendar-outline" size={14} color={Colors.olive} />
                <Text style={styles.duplicateInfoLabel}>Date Logged:</Text>
                <Text style={styles.duplicateInfoValue}>
                  {existingDuplicate?.date || 'Today'}
                </Text>
              </View>
              <View style={styles.duplicateInfoRow}>
                <Ionicons name="time-outline" size={14} color={Colors.olive} />
                <Text style={styles.duplicateInfoLabel}>Time Logged:</Text>
                <Text style={styles.duplicateInfoValue}>
                  {existingDuplicate?.time || 'Earlier'}
                </Text>
              </View>
              <View style={styles.duplicateInfoRow}>
                <Ionicons name="checkmark-circle-outline" size={14} color={Colors.present} />
                <Text style={styles.duplicateInfoLabel}>Status:</Text>
                <Text
                  style={[
                    styles.duplicateInfoValue,
                    { color: Colors.present, fontWeight: '700' },
                  ]}
                >
                  {existingDuplicate?.status?.toUpperCase() || 'PRESENT'}
                </Text>
              </View>
            </View>

            <Text style={styles.duplicateNotice}>
              You cannot log attendance more than once for the same subject on the same day.
            </Text>

            {/* Action buttons */}
            <TouchableOpacity
              style={styles.rescanDuplicateBtn}
              onPress={resetScan}
              activeOpacity={0.85}
            >
              <Ionicons name="scan-outline" size={18} color={Colors.white} />
              <Text style={styles.rescanDuplicateBtnText}>Scan Another Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewHistoryBtn}
              onPress={goToHistory}
              activeOpacity={0.85}
            >
              <Ionicons name="list-outline" size={16} color={Colors.leafGreen} />
              <Text style={styles.viewHistoryBtnText}>View Attendance History</Text>
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
  historyShortcutBtn: {
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
    fontWeight: '500',
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

  // Modal Common
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
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
    gap: Spacing.xs,
    ...Shadow.card,
  },

  // Success modal
  successIconCircle: {
    width: 76,
    height: 76,
    borderRadius: Radius.pill,
    backgroundColor: Colors.leafGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    ...Shadow.button,
  },
  modalTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  modalSubject: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.leafGreen,
    textAlign: 'center',
  },
  qrFormatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.creamWhite,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
  },
  qrFormatText: {
    fontSize: FontSize.xs - 1,
    color: Colors.olive,
    fontWeight: '600',
  },
  detailsCard: {
    width: '100%',
    backgroundColor: Colors.creamWhite,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  modalInfoText: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  presentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.presentBg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.pill,
    marginVertical: Spacing.xs,
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
    height: 48,
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
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.olive,
  },

  // Duplicate Modal
  duplicateIconCircle: {
    width: 76,
    height: 76,
    borderRadius: Radius.pill,
    backgroundColor: Colors.late,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    shadowColor: Colors.late,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  duplicateModalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  duplicateModalSubtitle: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.late,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  duplicateSubjectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.lateBg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.pill,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(245, 127, 23, 0.3)',
  },
  duplicateSubjectText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.late,
  },
  duplicateInfoCard: {
    width: '100%',
    backgroundColor: Colors.creamWhite,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
  },
  duplicateInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  duplicateInfoLabel: {
    fontSize: FontSize.xs,
    color: Colors.olive,
    width: 85,
  },
  duplicateInfoValue: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  duplicateNotice: {
    fontSize: FontSize.xs,
    color: Colors.olive,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 16,
  },
  rescanDuplicateBtn: {
    width: '100%',
    height: 48,
    borderRadius: Radius.pill,
    backgroundColor: Colors.leafGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    ...Shadow.button,
  },
  rescanDuplicateBtnText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.white,
  },
  viewHistoryBtn: {
    width: '100%',
    height: 42,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.leafGreen,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  viewHistoryBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.leafGreen,
  },
});
