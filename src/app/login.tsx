// ============================================================
// GROUP 5 – Smart QR Attendance System
// Screen: Login & Register Screen (login.tsx)
// Design: Leaf Green (#4A7C59) + Warm Beige (#F5F0E8)
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
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

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { loginStudent, registerStudent } from '@/services/auth-storage';

// ── Course & Section options ────────────────────────────────
const COURSES = [
  'BS Information Technology',
  'BS Computer Science',
  'BS Information Systems',
  'BS Computer Engineering',
];

const SECTIONS = ['IT-3A', 'IT-3B', 'CS-3A', 'CS-3B'];

// ── Field Component ─────────────────────────────────────────
function InputField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  isPassword = false,
  showPassword = false,
  onTogglePassword,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'numeric';
  secureTextEntry?: boolean;
  isPassword?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputWrapperFocused,
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={focused ? Colors.leafGreen : Colors.olive}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {isPassword && onTogglePassword && (
          <TouchableOpacity
            onPress={onTogglePassword}
            style={styles.eyeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={Colors.olive}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── Chip Selector Component ─────────────────────────────────
function ChipSelector({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chipRow}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.chip,
                selected === opt && styles.chipSelected,
              ]}
              onPress={() => onSelect(opt)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipText,
                  selected === opt && styles.chipTextSelected,
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ── Main Auth Screen ────────────────────────────────────────
export default function LoginScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form Fields
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [studentName, setStudentName] = useState('');
  const [course, setCourse] = useState(COURSES[0]);
  const [section, setSection] = useState(SECTIONS[0]);

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Error, Loading & Animation
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  // ── Handle Login / Register Submission ───────────────────
  async function handleSubmit() {
    setError('');

    // Step 1 — Empty field checks
    if (!studentId.trim()) {
      setError('Please enter your Student ID #.');
      shake();
      return;
    }
    if (!password.trim()) {
      setError(mode === 'login' ? 'Please enter your password.' : 'Please create a password.');
      shake();
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.');
      shake();
      return;
    }

    // Step 2 — Show loading spinner on button
    setIsLoading(true);

    if (mode === 'login') {
      // Step 3A — Call real login (checks AsyncStorage for account + password)
      const result = await loginStudent({
        studentId: studentId.trim(),
        password: password.trim(),
      });

      setIsLoading(false);

      if (!result.success) {
        // Account not found OR wrong password — show error, stay on screen
        setError(result.error || 'Login failed. Please try again.');
        shake();
        return;
      }

      // Login success — go to dashboard with real saved profile data
      const profile = result.profile!;
      router.replace({
        pathname: '/dashboard',
        params: {
          studentId: profile.studentId,
          studentName: profile.studentName,
          course: profile.course,
          section: profile.section,
        },
      });

    } else {
      // Step 3B — Call real register (creates account, blocks duplicate IDs)
      const result = await registerStudent({
        studentId: studentId.trim(),
        password: password.trim(),
        studentName: studentName.trim() || `Student ${studentId.trim()}`,
        course,
        section,
      });

      setIsLoading(false);

      if (!result.success) {
        // Duplicate ID or other error — show error, stay on screen
        setError(result.error || 'Registration failed. Please try again.');
        shake();
        return;
      }

      // Register success — go to dashboard
      const profile = result.profile!;
      router.replace({
        pathname: '/dashboard',
        params: {
          studentId: profile.studentId,
          studentName: profile.studentName,
          course: profile.course,
          section: profile.section,
        },
      });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.beige} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.darkGreen} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.avatarCircle}>
              <Ionicons
                name={mode === 'login' ? 'lock-closed' : 'person-add'}
                size={34}
                color={Colors.white}
              />
            </View>
            <Text style={styles.headerTitle}>
              {mode === 'login' ? 'Student Login' : 'Create Account'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {mode === 'login'
                ? 'Enter your Student ID and password to access attendance'
                : 'Register your Student ID to start recording attendance'}
            </Text>
          </View>

          {/* ── Segmented Tab Switcher (Log In vs Register) ── */}
          <View style={styles.segmentedContainer}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                mode === 'login' && styles.segmentButtonActive,
              ]}
              onPress={() => {
                setMode('login');
                setError('');
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="log-in-outline"
                size={16}
                color={mode === 'login' ? Colors.leafGreen : Colors.olive}
              />
              <Text
                style={[
                  styles.segmentText,
                  mode === 'login' && styles.segmentTextActive,
                ]}
              >
                Log In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentButton,
                mode === 'register' && styles.segmentButtonActive,
              ]}
              onPress={() => {
                setMode('register');
                setError('');
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="person-add-outline"
                size={16}
                color={mode === 'register' ? Colors.leafGreen : Colors.olive}
              />
              <Text
                style={[
                  styles.segmentText,
                  mode === 'register' && styles.segmentTextActive,
                ]}
              >
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Form Card ── */}
          <Animated.View
            style={[
              styles.card,
              { transform: [{ translateX: shakeAnim }] },
            ]}
          >
            {/* Student ID (Used in both Login & Register) */}
            <InputField
              label="Student ID # (Username)"
              icon="id-card-outline"
              value={studentId}
              onChangeText={setStudentId}
              placeholder="e.g. 2024305392"
              keyboardType="numeric"
            />

            {/* Optional Full Name in Register Mode */}
            {mode === 'register' && (
              <InputField
                label="Full Name (Optional)"
                icon="person-outline"
                value={studentName}
                onChangeText={setStudentName}
                placeholder="e.g. Joebelle Dumapias"
              />
            )}

            {/* Password */}
            <InputField
              label={mode === 'login' ? 'Password' : 'Create Password'}
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder={mode === 'login' ? 'Enter your password' : 'Create a secure password'}
              secureTextEntry={!showPassword}
              isPassword
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />

            {/* Confirm Password in Register Mode */}
            {mode === 'register' && (
              <InputField
                label="Confirm Password"
                icon="shield-checkmark-outline"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat password"
                secureTextEntry={!showConfirmPassword}
                isPassword
                showPassword={showConfirmPassword}
                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            )}

            {/* Course & Section in Register Mode */}
            {mode === 'register' && (
              <>
                <ChipSelector
                  label="Course"
                  options={COURSES}
                  selected={course}
                  onSelect={setCourse}
                />

                <ChipSelector
                  label="Section"
                  options={SECTIONS}
                  selected={section}
                  onSelect={setSection}
                />
              </>
            )}

            {/* Error message */}
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.absent} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </Animated.View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.btnPrimary, isLoading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Ionicons
                name={mode === 'login' ? 'arrow-forward-circle-outline' : 'checkmark-circle-outline'}
                size={20}
                color={Colors.white}
              />
            )}
            <Text style={styles.btnPrimaryText}>
              {isLoading
                ? (mode === 'login' ? 'Logging in...' : 'Creating account...')
                : (mode === 'login' ? 'Log In to Dashboard' : 'Create Account & Continue')}
            </Text>
          </TouchableOpacity>

          {/* Toggle Helper Link */}
          <TouchableOpacity
            style={styles.switchModeLink}
            onPress={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.switchModeText}>
              {mode === 'login'
                ? "Don't have an account? "
                : 'Already have an account? '}
              <Text style={styles.switchModeBold}>
                {mode === 'login' ? 'Register here' : 'Log In'}
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Footer Note */}
          <Text style={styles.footerNote}>
            Group 5  ·  Smart QR Attendance System
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.beige,
  },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },

  // Back Button
  backBtn: {
    marginTop: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },

  // Header
  header: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    backgroundColor: Colors.leafGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    ...Shadow.button,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.olive,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.md,
  },

  // Segmented Switcher
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(74,124,89,0.12)',
    borderRadius: Radius.pill,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.pill,
  },
  segmentButtonActive: {
    backgroundColor: Colors.white,
    ...Shadow.card,
  },
  segmentText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.olive,
  },
  segmentTextActive: {
    color: Colors.leafGreen,
    fontWeight: '700',
  },

  // Form Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadow.card,
  },

  // Input Fields
  fieldGroup: {
    gap: Spacing.xs,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.creamWhite,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: Colors.leafGreen,
    backgroundColor: Colors.white,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  eyeButton: {
    padding: Spacing.xs,
  },

  // Chips
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.creamWhite,
  },
  chipSelected: {
    backgroundColor: Colors.leafGreen,
    borderColor: Colors.leafGreen,
  },
  chipText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.olive,
  },
  chipTextSelected: {
    color: Colors.white,
  },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.absentBg,
    padding: Spacing.md,
    borderRadius: Radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.absent,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.absent,
    flex: 1,
  },

  // Primary Button
  btnPrimary: {
    backgroundColor: Colors.leafGreen,
    height: 56,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadow.button,
  },
  btnPrimaryText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Switch Mode Link
  switchModeLink: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  switchModeText: {
    fontSize: FontSize.sm,
    color: Colors.olive,
  },
  switchModeBold: {
    fontWeight: '700',
    color: Colors.leafGreen,
  },

  // Footer
  footerNote: {
    textAlign: 'center',
    marginTop: Spacing.xl,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
});
