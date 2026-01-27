import { useColorScheme } from 'react-native';

const lightColors = {
  primary: {
    blue: '#3B82F6',
    green: '#10B981',
    red: '#EF4444',
    yellow: '#F59E0B',
  },
  neutral: {
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray700: '#374151',
    gray900: '#111827',
  },
  status: {
    verifiedGreen: '#059669',
    pendingOrange: '#EA580C',
    securityBlue: '#2563EB',
    premiumPurple: '#7C3AED',
  },
};

const darkColors = {
  primary: {
    blue: '#60A5FA',
    green: '#34D399',
    red: '#F87171',
    yellow: '#FBBF24',
  },
  neutral: {
    white: '#1F2937',
    gray50: '#111827',
    gray100: '#1F2937',
    gray200: '#374151',
    gray300: '#4B5563',
    gray700: '#D1D5DB',
    gray900: '#F9FAFB',
  },
  status: {
    verifiedGreen: '#34D399',
    pendingOrange: '#FB923C',
    securityBlue: '#60A5FA',
    premiumPurple: '#A78BFA',
  },
};

export function useThemeColors() {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkColors : lightColors;
}

export const Colors = lightColors;

export function getThemedColor(colorScheme: 'light' | 'dark' | null) {
  return colorScheme === 'dark' ? darkColors : lightColors;
}

export const Typography = {
  displayLarge: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  displayMedium: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  heading1: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  heading2: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 13,
    textTransform: 'uppercase' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadows = {
  level1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  level2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  level3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 6,
  },
};

// Design system animation tokens (durations in ms)
export const MotionDuration = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
};

// Easing tokens (documented cubic-bezier for reference)
// Use React Native Easing equivalents where needed
export const MotionEasing = {
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  deceleration: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  acceleration: 'cubic-bezier(0.4, 0.0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
};

export default Colors;
