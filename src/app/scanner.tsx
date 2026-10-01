// ============================================================
// GROUP 5 – Smart QR Attendance System
// Screen: Camera QR Scanner (scanner.tsx)
// Uses: expo-camera for live QR scanning
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { addRecord, createRecord } from '@/services/attendance-storage';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);

  const { studentName, studentId, course, section } = useLocalSearchParams<{
    studentName?: string;
    studentId?: string;
    course?: string;
    section?: string;
  }>();

  // Handle barcode scanned event
  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    let status: 'present' | 'absent' | 'invalid' = 'invalid';

    try {
      // Check if data is valid JSON or matches attendance code
      if (data.toLowerCase().includes('cs101') || data.toLowerCase().includes('present') || data.toLowerCase().includes('attendance')) {
        status = 'present';
      } else if (data.toLowerCase().includes('late')) {
        status = 'present'; // Can map to present or late
      } else if (data.startsWith('{')) {
        const parsed = JSON.parse(data);
        if (parsed.status) status = parsed.status;
        else if (parsed.code || parsed.subject) status = 'present';
      } else if (data.trim().length > 0) {
        status = 'present';
      }
    } catch {
      status = 'invalid';
    }

    // Save record to AsyncStorage
    const name = studentName || 'Juan Dela Cruz';
    const id = studentId || '2024-00123';
    const crs = course || 'BS Information Technology';
    const sec = section || 'IT-3A';

    if (status !== 'invalid') {
      try {
        const record = createRecord({
          studentName: name,
          studentId: id,
          course: crs,
          section: sec,
          status: status === 'present' ? 'present' : 'absent',
        });
        await addRecord(record);
      } catch (err) {
        console.error('Failed to save record:', err);
      }
    }

    // Navigate to Attendance Result screen
    router.replace({
      pathname: '/attendance-result',
      params: {
        studentName: name,
        studentId: id,
        course: crs,
        section: sec,
        status,
      },
    });
  };

  // ── Permission Loading State ──
  if (!permission) {
    return <View style={styles.container} />;
  }

  // ── Permission Denied Screen ──
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={styles.permissionCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="camera-outline" size={48} color={Colors.leafGreen} />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionSub}>
            We need your permission to use the camera to scan classroom QR codes for attendance.
          </Text>
          <TouchableOpacity
            style={styles.grantBtn}
            onPress={requestPermission}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
            <Text style={styles.grantBtnText}>Grant Camera Permission</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Camera Scanner View ──
  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        enableTorch={torch}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />

      {/* Top Header Overlay */}
      <SafeAreaView style={styles.overlayTop}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Scan QR Code</Text>

        <TouchableOpacity
          style={[styles.iconBtn, torch && styles.iconBtnActive]}
          onPress={() => setTorch(!torch)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={torch ? 'flash' : 'flash-outline'}
            size={22}
            color={torch ? '#FFD700' : Colors.white}
          />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Viewfinder Target Overlay */}
      <View style={styles.viewfinderContainer}>
        <View style={styles.targetFrame}>
          {/* Corners */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
        <Text style={styles.guideText}>Align QR code within the frame</Text>
      </View>

      {/* Bottom Hint */}
      <SafeAreaView style={styles.overlayBottom}>
        <View style={styles.hintBadge}>
          <Ionicons name="sparkles" size={16} color={Colors.leafGreen} />
          <Text style={styles.hintText}>CS101 Attendance Scanner</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Permission screen
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.beige,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  permissionCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.card,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: Radius.pill,
    backgroundColor: Colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  permissionSub: {
    fontSize: FontSize.sm,
    color: Colors.olive,
    textAlign: 'center',
    lineHeight: 20,
  },
  grantBtn: {
    backgroundColor: Colors.leafGreen,
    height: 52,
    borderRadius: Radius.pill,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    ...Shadow.button,
  },
  grantBtnText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  cancelBtn: {
    paddingVertical: Spacing.sm,
  },
  cancelBtnText: {
    color: Colors.olive,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },

  // Overlays
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  // Viewfinder
  viewfinderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: Colors.leafGreen,
    borderWidth: 4,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: Radius.sm },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: Radius.sm },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: Radius.sm },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: Radius.sm },
  guideText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '500',
    marginTop: Spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },

  // Bottom overlay
  overlayBottom: {
    position: 'absolute',
    bottom: Spacing.xxl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    ...Shadow.card,
  },
  hintText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
