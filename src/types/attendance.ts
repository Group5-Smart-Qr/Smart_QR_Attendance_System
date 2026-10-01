// ============================================================
// GROUP 5 – Smart QR Attendance System
// Types: Attendance Record
// ============================================================

export type AttendanceStatus = 'present' | 'late' | 'absent';

export interface AttendanceRecord {
  /** Unique ID — generated via Date.now().toString() */
  id: string;
  /** Student's full name */
  studentName: string;
  /** Student ID number e.g. "2024-00123" */
  studentId: string;
  /** Course e.g. "BS Information Technology" */
  course: string;
  /** Section e.g. "IT-3A" */
  section: string;
  /** Subject / class — defaults to "CS101" */
  subject: string;
  /** Attendance status */
  status: AttendanceStatus;
  /** Unix timestamp (ms) — Date.now() */
  timestamp: number;
  /** Human-readable date string e.g. "2026-10-01" */
  date: string;
  /** Human-readable time string e.g. "08:30 AM" */
  time: string;
}

/** Computed attendance stats derived from a list of records */
export interface AttendanceStats {
  present: number;
  late: number;
  absent: number;
  total: number;
  /** Attendance rate as a percentage string e.g. "90%" */
  rate: string;
}
