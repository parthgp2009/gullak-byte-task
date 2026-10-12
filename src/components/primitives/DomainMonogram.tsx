import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, fontFamilies } from '../../theme';

interface DomainMonogramProps {
  domain: string;
  size?: number;
}

// Curated harmonious tones matching dark charcoal & terracotta palette
const MONOGRAM_PALETTE = [
  '#C8654A', // Terracotta
  '#D48842', // Warm ochre
  '#A0725C', // Warm clay
  '#5B8266', // Dusty sage
  '#5C7897', // Muted steel blue
  '#8E6C88', // Muted plum
  '#9E6B55', // Burnt terracotta
  '#7A8265', // Olive moss
];

function hashStringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % MONOGRAM_PALETTE.length;
  return MONOGRAM_PALETTE[index];
}

export const DomainMonogram: React.FC<DomainMonogramProps> = ({ domain, size = 32 }) => {
  const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  const initial = cleanDomain ? cleanDomain.charAt(0).toUpperCase() : '?';
  const bgColor = hashStringToColor(cleanDomain);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: borderRadius.tile,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Text style={[styles.letter, { fontSize: Math.round(size * 0.52) }]}>{initial}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  letter: {
    fontFamily: fontFamilies.sansBold,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
