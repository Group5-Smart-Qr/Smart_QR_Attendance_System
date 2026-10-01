// ============================================================
// GROUP 5 – Smart QR Attendance System
// Design System: Leaf Green + Warm Beige | Poppins + Nunito
// ============================================================

export const Colors = {
  // Primary Palette
  leafGreen: '#4A7C59',
  darkGreen: '#2D5A3D',
  midGreen: '#3D6B4A',
  lightGreen: '#E8F5E9',
  olive: '#6B7B5E',

  // Background
  beige: '#F5F0E8',
  creamWhite: '#FAFAF5',
  white: '#FFFFFF',

  // Text
  textPrimary: '#2D5A3D',
  textSecondary: '#6B7B5E',
  textMuted: '#9BA89A',

  // Status Colors
  present: '#4A7C59',
  presentBg: '#E8F5E9',
  late: '#F57F17',
  lateBg: '#FFF8E1',
  absent: '#C62828',
  absentBg: '#FFEBEE',

  // UI
  shadow: 'rgba(0,0,0,0.08)',
  border: 'rgba(74,124,89,0.3)',
  overlay: 'rgba(0,0,0,0.4)',
} as const;

export const FontSize = {
  xs: 12,    // chips, small tags
  sm: 14,    // card labels, Nunito SemiBold
  md: 16,    // body, buttons, subtitles
  lg: 20,    // section headers
  xl: 24,    // stats / numbers
  xxl: 28,   // screen titles
  hero: 32,  // app title / hero text
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 50,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    shadowColor: Colors.leafGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
