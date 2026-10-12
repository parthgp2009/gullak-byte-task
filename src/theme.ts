export const colors = {
  // Shared brand colors
  terracotta: '#C8553D',
  terracottaDark: '#A73F29',
  marigold: '#F2A541',
  marigoldDark: '#D48624',
  marigoldLight: '#FDF0D5',

  light: {
    background: '#FFF8F0',
    surface: '#FFFFFF',
    surfaceSecondary: '#F7EFE7',
    surfaceElevated: '#FFFFFF',
    text: '#2B1B14',
    textSecondary: '#6F564A',
    textMuted: '#9E867B',
    border: '#EADBD0',
    borderSubtle: '#F2E8E0',
    borderFocus: '#C8553D',
    danger: '#C62828',
    dangerBg: '#FFECEC',
    success: '#2E7D32',
    successBg: '#E8F5E9',
    overlay: 'rgba(43, 27, 20, 0.45)',

    // Type badge colors
    typeNoteBg: '#FCECE8',
    typeNoteText: '#C8553D',
    typeLinkBg: '#FEF4E6',
    typeLinkText: '#B87014',
    typeImageBg: '#F3EAE6',
    typeImageText: '#6A4D41',

    // Action button states
    chipSelectedBg: '#C8553D',
    chipSelectedText: '#FFFFFF',
    chipUnselectedBg: '#F7EFE7',
    chipUnselectedText: '#6F564A',
  },

  dark: {
    background: '#1B120C', // deep brown clay
    surface: '#271A12',
    surfaceSecondary: '#34241B',
    surfaceElevated: '#322218',
    text: '#FFF8F0', // warm cream
    textSecondary: '#D3BFB4',
    textMuted: '#8D766C',
    border: '#3F2C22',
    borderSubtle: '#302118',
    borderFocus: '#F2A541',
    danger: '#EF5350',
    dangerBg: '#3A1E1D',
    success: '#66BB6A',
    successBg: '#1B3320',
    overlay: 'rgba(0, 0, 0, 0.65)',

    // Type badge colors
    typeNoteBg: '#3E241B',
    typeNoteText: '#E67A64',
    typeLinkBg: '#3F2F1B',
    typeLinkText: '#F5BE6D',
    typeImageBg: '#33261F',
    typeImageText: '#D3BFB4',

    // Action button states
    chipSelectedBg: '#C8553D',
    chipSelectedText: '#FFF8F0',
    chipUnselectedBg: '#34241B',
    chipUnselectedText: '#D3BFB4',
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 9999,
};

export const typography = {
  display: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  h1: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  h2: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  h3: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  subtext: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 14,
  },
  button: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
};

export const shadows = {
  card: {
    shadowColor: '#2B1B14',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHover: {
    shadowColor: '#2B1B14',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  fab: {
    shadowColor: '#C8553D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  modal: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
};

export type ThemeColors = typeof colors.light;
