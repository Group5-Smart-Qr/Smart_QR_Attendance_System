// ============================================================
// GROUP 5 – Smart QR Attendance System
// Service: Attendance AsyncStorage Layer
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

import { AttendanceRecord, AttendanceStats } from '@/types/attendance';

const STORAGE_KEY = '@attendance_records';

// ── Default subject (matches the hardcoded "CS101" in dashboard) ──
const DEFAULT_SUBJECT = 'CS101';

/**
 * Fetch all saved attendance records from AsyncStorage.
 * Returns an empty array if nothing is stored yet.
 */
export async function getAllRecords(): Promise<AttendanceRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AttendanceRecord[]) : [];
  } catch (error) {
    console.error('[AttendanceStorage] Failed to load records:', error);
    return [];
  }
}

/**
 * Fetch attendance records for a specific student only.
 * Used by the History screen to show only the logged-in student's records.
 */
export async function getRecordsByStudentId(
  studentId: string
): Promise<AttendanceRecord[]> {
  const all = await getAllRecords();
  return all.filter((r) => r.studentId === studentId);
}

/**
 * Save a new attendance record to AsyncStorage.
 * Prepends it to the list so newest records appear first.
 */
export async function addRecord(record: AttendanceRecord): Promise<void> {
  try {
    const existing = await getAllRecords();
    const updated = [record, ...existing];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('[AttendanceStorage] Failed to add record:', error);
    throw error;
  }
}

/**
 * Delete all attendance records from AsyncStorage.
 */
export async function clearAllRecords(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[AttendanceStorage] Failed to clear records:', error);
    throw error;
  }
}

/**
 * Helper: builds a formatted AttendanceRecord from raw input.
 * Automatically fills id, timestamp, date, time, and subject.
 * Subject defaults to "CS101" matching the dashboard display.
 */
export function createRecord(
  data: Omit<AttendanceRecord, 'id' | 'date' | 'time' | 'timestamp' | 'subject'> &
    Partial<Pick<AttendanceRecord, 'subject'>>
): AttendanceRecord {
  const now = new Date();
  const { subject = DEFAULT_SUBJECT, ...rest } = data;
  return {
    ...rest,
    subject,
    id: now.getTime().toString(),
    timestamp: now.getTime(),
    date: now.toISOString().split('T')[0], // "YYYY-MM-DD"
    time: now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  };
}

/**
 * Compute attendance statistics from a list of records.
 * Used to replace the hardcoded stats (18 Present, 2 Late, 90%)
 * in dashboard.tsx with real data.
 */
export function computeStats(records: AttendanceRecord[]): AttendanceStats {
  const present = records.filter((r) => r.status === 'present').length;
  const late = records.filter((r) => r.status === 'late').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const total = records.length;

  // Count both present and late as attended for rate calculation
  const attended = present + late;
  const rate = total > 0 ? Math.round((attended / total) * 100) + '%' : '0%';

  return { present, late, absent, total, rate };
}
