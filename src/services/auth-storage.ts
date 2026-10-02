// ============================================================
// GROUP 5 – Smart QR Attendance System
// Service: Auth AsyncStorage Layer
// Persistent student accounts: register, login, profile update
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Storage keys ────────────────────────────────────────────
const ACCOUNTS_KEY = '@student_accounts';
const SESSION_KEY = '@current_session';

// ── Types ───────────────────────────────────────────────────

/** Stored student account */
export interface StudentAccount {
  /** Student ID — acts as the unique key e.g. "2024-00123" */
  studentId: string;
  /** Hashed-ish password (base64 of the raw string for now) */
  password: string;
  /** Student's full name */
  studentName: string;
  /** Course e.g. "BS Information Technology" */
  course: string;
  /** Section e.g. "IT-3A" */
  section: string;
  /** ISO timestamp of when the account was created */
  createdAt: string;
  /** ISO timestamp of the last profile update */
  updatedAt: string;
}

/** Public-facing student profile (no password) */
export type StudentProfile = Omit<StudentAccount, 'password'>;

/** Result of registerStudent or loginStudent */
export interface AuthResult {
  success: boolean;
  /** Human-readable error message if success is false */
  error?: string;
  /** The student profile on success */
  profile?: StudentProfile;
}

// ── Internal helpers ────────────────────────────────────────

/** Simple encoding so passwords aren't stored in plain text */
function encodePassword(raw: string): string {
  // Base64 encode — NOT cryptographically secure, but sufficient
  // for a school project with local-only AsyncStorage.
  // In production, use bcrypt/argon2 on a backend.
  try {
    // React Native doesn't have btoa — use a manual approach
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    while (i < raw.length) {
      const a = raw.charCodeAt(i++);
      const b = i < raw.length ? raw.charCodeAt(i++) : 0;
      const c = i < raw.length ? raw.charCodeAt(i++) : 0;
      const bitmap = (a << 16) | (b << 8) | c;
      result +=
        chars[(bitmap >> 18) & 63] +
        chars[(bitmap >> 12) & 63] +
        chars[(bitmap >> 6) & 63] +
        chars[bitmap & 63];
    }
    return result;
  } catch {
    return raw;
  }
}

/** Load all accounts from storage */
async function loadAccounts(): Promise<Record<string, StudentAccount>> {
  try {
    const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, StudentAccount>) : {};
  } catch (error) {
    console.error('[AuthStorage] Failed to load accounts:', error);
    return {};
  }
}

/** Persist accounts map to storage */
async function saveAccounts(
  accounts: Record<string, StudentAccount>
): Promise<void> {
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

// ── Public API ──────────────────────────────────────────────

/**
 * Register a new student account.
 * Checks for duplicate studentId before creating.
 */
export async function registerStudent(data: {
  studentId: string;
  password: string;
  studentName: string;
  course: string;
  section: string;
}): Promise<AuthResult> {
  try {
    const accounts = await loadAccounts();

    // Check for existing account
    if (accounts[data.studentId]) {
      return {
        success: false,
        error: 'An account with this Student ID already exists. Please log in.',
      };
    }

    const now = new Date().toISOString();
    const account: StudentAccount = {
      studentId: data.studentId,
      password: encodePassword(data.password),
      studentName: data.studentName,
      course: data.course,
      section: data.section,
      createdAt: now,
      updatedAt: now,
    };

    accounts[data.studentId] = account;
    await saveAccounts(accounts);

    // Auto-login after registration
    const profile = stripPassword(account);
    await saveSession(profile);

    return { success: true, profile };
  } catch (error) {
    console.error('[AuthStorage] Registration failed:', error);
    return { success: false, error: 'Registration failed. Please try again.' };
  }
}

/**
 * Log in an existing student.
 * Validates studentId exists and password matches.
 */
export async function loginStudent(data: {
  studentId: string;
  password: string;
}): Promise<AuthResult> {
  try {
    const accounts = await loadAccounts();
    const account = accounts[data.studentId];

    if (!account) {
      return {
        success: false,
        error: 'No account found with this Student ID. Please register first.',
      };
    }

    if (account.password !== encodePassword(data.password)) {
      return {
        success: false,
        error: 'Incorrect password. Please try again.',
      };
    }

    const profile = stripPassword(account);
    await saveSession(profile);

    return { success: true, profile };
  } catch (error) {
    console.error('[AuthStorage] Login failed:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

/**
 * Update an existing student's profile (name, course, section).
 * Used by the dashboard's Edit Profile modal.
 */
export async function updateStudentProfile(
  studentId: string,
  updates: {
    studentName?: string;
    course?: string;
    section?: string;
  }
): Promise<AuthResult> {
  try {
    const accounts = await loadAccounts();
    const account = accounts[studentId];

    if (!account) {
      return {
        success: false,
        error: 'Account not found. Cannot update profile.',
      };
    }

    // Apply updates
    if (updates.studentName !== undefined) {
      account.studentName = updates.studentName;
    }
    if (updates.course !== undefined) {
      account.course = updates.course;
    }
    if (updates.section !== undefined) {
      account.section = updates.section;
    }
    account.updatedAt = new Date().toISOString();

    accounts[studentId] = account;
    await saveAccounts(accounts);

    // Update active session too
    const profile = stripPassword(account);
    await saveSession(profile);

    return { success: true, profile };
  } catch (error) {
    console.error('[AuthStorage] Profile update failed:', error);
    return { success: false, error: 'Profile update failed. Please try again.' };
  }
}

// ── Session management ──────────────────────────────────────

/**
 * Save the current logged-in user's profile to session storage.
 * Used to persist the login state across app restarts.
 */
export async function saveSession(profile: StudentProfile): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(profile));
}

/**
 * Get the current logged-in user's profile from session storage.
 * Returns null if no one is logged in.
 */
export async function getSession(): Promise<StudentProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StudentProfile) : null;
  } catch (error) {
    console.error('[AuthStorage] Failed to load session:', error);
    return null;
  }
}

/**
 * Clear the current session (log out).
 */
export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

/**
 * Check if a studentId already has a registered account.
 */
export async function isStudentRegistered(
  studentId: string
): Promise<boolean> {
  const accounts = await loadAccounts();
  return !!accounts[studentId];
}

// ── Utils ───────────────────────────────────────────────────

/** Strip password from a StudentAccount to create a safe profile */
function stripPassword(account: StudentAccount): StudentProfile {
  const { password: _, ...profile } = account;
  return profile;
}
