// ============================================================
// GROUP 5 – Smart QR Attendance System
// Screen: Login Screen (login.tsx)
// Design: Leaf Green (#4A7C59) + Warm Beige (#F5F0E8)
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
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

// ── Course options ──────────────────────────────────────────
const COURSES = [
  'BS Information Technology',
  'BS Computer Science',
  'BS Information Systems',
  'BS Computer Engineering',
];

const SECTIONS = ['IT-3A', 'IT-3B', 'CS-3A', 'CS-3B'];

// ── Field component ─────────────────────────────────────────
function InputField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'numeric';
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
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    </View>
  );
}

// ── Selector chip ───────────────────────────────────────────
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

// ── Main Login Screen ───────────────────────────────────────
export default function LoginScreen() {
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [course, setCourse] = useState('');
  const [section, setSection] = useState('');
  const [error, setError] = useState('');

  const shakeAnim = useRef(new Animated.Value(0)).current;

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  function handleContinue() {
    if (!studentName.trim()) {
      setError('Please enter your full name.');
      shake();
      return;
    }
    if (!studentId.trim()) {
      setError('Please enter your Student ID.');
      shake();
      return;
    }
    if (!course) {
      setError('Please select your course.');
      shake();
      return;
    }
    if (!section) {
      setError('Please select your section.');
      shake();
      return;
    }
    setError('');
    // Navigate to dashboard (to be built next)
    router.replace({
      pathname: '/dashboard',
      params: { studentName, studentId, course, section },
    });
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
              <Ionicons name="person" size={36} color={Colors.white} />
            </View>
            <Text style={styles.headerTitle}>Student Login</Text>
            <Text style={styles.headerSubtitle}>
              Enter your details to mark{'\n'}your attendance
            </Text>
          </View>

          {/* Form Card */}
          <Animated.View
            style={[
              styles.card,
              { transform: [{ translateX: shakeAnim }] },
            ]}
          >
            <InputField
              label="Full Name"
              icon="person-outline"
              value={studentName}
              onChangeText={setStudentName}
              placeholder="e.g. Juan Dela Cruz"
            />

            <InputField
              label="Student ID"
              icon="id-card-outline"
              value={studentId}
              onChangeText={setStudentId}
              placeholder="e.g. 2024-00123"
              keyboardType="default"
            />

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

            {/* Error message */}
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.absent} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </Animated.View>

          {/* Continue button */}
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
            <Text style={styles.btnPrimaryText}>Continue to Dashboard</Text>
          </TouchableOpacity>

          {/* Footer note */}
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

  // Back
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
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: Radius.pill,
    backgroundColor: Colors.leafGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    ...Shadow.button,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.olive,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Form Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadow.card,
  },

  // Input fields
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

  // Button
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

  // Footer
  footerNote: {
    textAlign: 'center',
    marginTop: Spacing.xl,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
});
