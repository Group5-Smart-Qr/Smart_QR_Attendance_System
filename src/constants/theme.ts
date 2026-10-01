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
  // New named keys (use these in new screens)
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  // Legacy keys (used by existing template components — do not remove)
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// ── Backwards-compatible exports (used by existing template components) ──────
import { Platform } from 'react-native';

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: { sans: 'system-ui', serif: 'serif', rounded: 'normal', mono: 'monospace' },
})!;

// Legacy light/dark Colors used by ThemedView, app-tabs.web, etc.
export const LegacyColors = {
  light: {
    text: Colors.textPrimary,
    background: Colors.beige,
    backgroundElement: Colors.lightGreen,
    backgroundSelected: '#C8E6C9',
    textSecondary: Colors.olive,
  },
  dark: {
    text: '#ffffff',
    background: '#1B2E22',
    backgroundElement: '#2A4232',
    backgroundSelected: '#3A5A42',
    textSecondary: '#A8C09A',
  },
} as const;

export type ThemeColor = keyof typeof LegacyColors.light & keyof typeof LegacyColors.dark;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

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
