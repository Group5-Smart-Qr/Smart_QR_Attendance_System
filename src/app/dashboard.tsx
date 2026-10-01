// ============================================================
// GROUP 5 – Smart QR Attendance System
// Screen: Dashboard (Placeholder)
// Full dashboard will be built in the next step
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Spacing } from '@/constants/theme';

export default function DashboardScreen() {
  const { studentName, studentId, course, section } = useLocalSearchParams<{
    studentName: string;
    studentId: string;
    course: string;
    section: string;
  }>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={64} color={Colors.leafGreen} />
        </View>

        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.name}>{studentName}</Text>
        <Text style={styles.info}>{studentId}  ·  {section}</Text>
        <Text style={styles.course}>{course}</Text>

        <View style={styles.badge}>
          <Ionicons name="construct-outline" size={16} color={Colors.olive} />
          <Text style={styles.badgeText}>Dashboard coming soon...</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.beige,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  iconCircle: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.hero,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  name: {
    fontSize: FontSize.xxl,
    fontWeight: '600',
    color: Colors.darkGreen,
  },
  info: {
    fontSize: FontSize.md,
    color: Colors.olive,
    letterSpacing: 0.3,
  },
  course: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xl,
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 50,
  },
  badgeText: {
    fontSize: FontSize.sm,
    color: Colors.olive,
    fontWeight: '500',
  },
});
