// ============================================================
// GROUP 5 – Smart QR Attendance System
// Context: Attendance State Management
// Provides: records, stats, isLoading, addRecord, clearRecords
// ============================================================

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  addRecord as storageAdd,
  clearAllRecords,
  computeStats,
  createRecord,
  getAllRecords,
  getRecordsByStudentId,
} from '@/services/attendance-storage';
import {
  AttendanceRecord,
  AttendanceStats,
} from '@/types/attendance';

// ── Context value shape ─────────────────────────────────────
interface AttendanceContextValue {
  /** All records for the current student (newest first) */
  records: AttendanceRecord[];
  /** Computed stats: present, late, absent, total, rate */
  stats: AttendanceStats;
  /** True while loading records from AsyncStorage on startup */
  isLoading: boolean;
  /**
   * Add a new attendance record.
   * Automatically fills id, date, time, and subject.
   */
  addRecord: (
    data: Omit<AttendanceRecord, 'id' | 'date' | 'time' | 'timestamp' | 'subject'> &
      Partial<Pick<AttendanceRecord, 'subject'>>
  ) => Promise<void>;
  /** Wipe all records for a fresh start */
  clearRecords: () => Promise<void>;
  /**
   * Load records filtered by studentId.
   * Call this after login so only the current student's
   * records are shown in the History screen.
   */
  loadRecordsForStudent: (studentId: string) => Promise<void>;
}

// ── Default stats (used before records are loaded) ─────────
const DEFAULT_STATS: AttendanceStats = {
  present: 0,
  late: 0,
  absent: 0,
  total: 0,
  rate: '0%',
};

// ── Context creation ────────────────────────────────────────
const AttendanceContext = createContext<AttendanceContextValue | null>(null);

// ── Provider ────────────────────────────────────────────────
export function AttendanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Compute stats automatically whenever records change
  const stats = computeStats(records);

  // Load ALL records on mount (filtered per-student after login)
  useEffect(() => {
    getAllRecords()
      .then(setRecords)
      .finally(() => setIsLoading(false));
  }, []);

  /** Filter records down to a single student after login */
  const loadRecordsForStudent = useCallback(
    async (studentId: string) => {
      setIsLoading(true);
      const filtered = await getRecordsByStudentId(studentId);
      setRecords(filtered);
      setIsLoading(false);
    },
    []
  );

  /** Build a full record and persist it */
  const addRecord = useCallback(
    async (
      data: Omit<AttendanceRecord, 'id' | 'date' | 'time' | 'timestamp' | 'subject'> &
        Partial<Pick<AttendanceRecord, 'subject'>>
    ) => {
      const record = createRecord(data);
      await storageAdd(record);
      // Prepend in-memory so UI updates instantly
      setRecords((prev) => [record, ...prev]);
    },
    []
  );

  /** Clear all records from storage and memory */
  const clearRecords = useCallback(async () => {
    await clearAllRecords();
    setRecords([]);
  }, []);

  return (
    <AttendanceContext.Provider
      value={{
        records,
        stats,
        isLoading,
        addRecord,
        clearRecords,
        loadRecordsForStudent,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

// ── Hook ────────────────────────────────────────────────────
/**
 * Access the attendance state from any screen.
 *
 * @example
 * const { records, stats, addRecord } = useAttendance();
 */
export function useAttendance(): AttendanceContextValue {
  const ctx = useContext(AttendanceContext);
  if (!ctx) {
    throw new Error('useAttendance must be used inside <AttendanceProvider>');
  }
  return ctx;
}
