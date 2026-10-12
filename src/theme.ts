import { Platform } from 'react-native';

export const fontFamilies = {
  serif: 'Fraunces_700Bold',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
};

export const colors = {
  // Shared brand colors sampled from mockup
  terracotta: '#C8654A',
  terracottaPressed: '#B5563D',
  cream: '#F3E9DC',
  mutedText: '#9A948C',
  charcoalBg: '#141416',
  surfaceCard: '#1E1E21',
  surfaceElevated: '#26262B',
  borderHairline: 'rgba(255, 255, 255, 0.10)',
  borderHairlineLight: 'rgba(255, 255, 255, 0.18)',

  // Primary Theme: Dark (Mockup Visual Source of Truth)
  dark: {
    background: '#141416',
    surface: '#1E1E21',
    surfaceSecondary: '#26262B',
    surfaceElevated: '#2A2A30',
    border: 'rgba(255, 255, 255, 0.10)',
    borderSubtle: 'rgba(255, 255, 255, 0.06)',
    borderFocus: '#C8654A',
    borderActive: '#C8654A',

    text: '#F3E9DC',
    textSecondary: '#9A948C',
    textMuted: '#736D66',

    accent: '#C8654A',
    accentPressed: '#B5563D',

    tileCream: '#F3E9DC',
    tileIconDark: '#1E1E21',

    danger: '#D9534F',
    dangerBg: 'rgba(217, 83, 79, 0.15)',
    success: '#5CB85C',
    successBg: 'rgba(92, 184, 92, 0.15)',
    overlay: 'rgba(0, 0, 0, 0.72)',

    // Item Type Badges & Accents
    typeNoteBg: 'rgba(243, 233, 220, 0.12)',
    typeNoteText: '#F3E9DC',
    typeLinkBg: 'rgba(200, 101, 74, 0.15)',
    typeLinkText: '#E68A72',
    typeImageBg: 'rgba(255, 255, 255, 0.08)',
    typeImageText: '#F3E9DC',
    typeSnippetBg: 'rgba(100, 181, 246, 0.15)',
    typeSnippetText: '#90CAF9',

    chipSelectedBg: '#C8654A',
    chipSelectedText: '#F3E9DC',
    chipUnselectedBg: '#1E1E21',
    chipUnselectedText: '#9A948C',
  },

  // Matching Warm Paper Light Theme
  light: {
    background: '#FAF6F0',
    surface: '#FFFFFF',
    surfaceSecondary: '#F2ECE4',
    surfaceElevated: '#FFFFFF',
    border: 'rgba(43, 27, 20, 0.10)',
    borderSubtle: 'rgba(43, 27, 20, 0.05)',
    borderFocus: '#C8654A',
    borderActive: '#C8654A',

    text: '#261E1A',
    textSecondary: '#7A6E65',
    textMuted: '#A0948A',

    accent: '#C8654A',
    accentPressed: '#B5563D',

    tileCream: '#F0E7DB',
    tileIconDark: '#261E1A',

    danger: '#C62828',
    dangerBg: '#FFECEC',
    success: '#2E7D32',
    successBg: '#E8F5E9',
    overlay: 'rgba(38, 30, 26, 0.50)',

    typeNoteBg: 'rgba(200, 101, 74, 0.10)',
    typeNoteText: '#C8654A',
    typeLinkBg: 'rgba(200, 101, 74, 0.12)',
    typeLinkText: '#B5563D',
    typeImageBg: 'rgba(43, 27, 20, 0.06)',
    typeImageText: '#4A3D36',
    typeSnippetBg: 'rgba(30, 136, 229, 0.10)',
    typeSnippetText: '#1565C0',

    chipSelectedBg: '#C8654A',
    chipSelectedText: '#FFFFFF',
    chipUnselectedBg: '#FFFFFF',
    chipUnselectedText: '#7A6E65',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 6,
  tile: 8,       // Floating empty state tiles & sub-elements
  chip: 10,      // Filter chips & buttons
  button: 10,    // Action buttons & "Drop in" FAB
  iconBtn: 12,   // 44px square icon buttons
  card: 20,      // Content cards & empty state surface
  pill: 9999,
};

export const typography = {
  display: {
    fontFamily: fontFamilies.serif,
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  h1: {
    fontFamily: fontFamilies.serif,
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  h2: {
    fontFamily: fontFamilies.serif,
    fontSize: 19,
    fontWeight: '700' as const,
    lineHeight: 25,
  },
  h3: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 22,
  },
  body: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyBold: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  subtext: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  caption: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  button: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  mono: {
    fontFamily: fontFamilies.mono,
    fontSize: 13,
    lineHeight: 18,
  },
};

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
  fab: {
    shadowColor: '#C8654A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  modal: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
};

export type ThemeColors = typeof colors.dark;
