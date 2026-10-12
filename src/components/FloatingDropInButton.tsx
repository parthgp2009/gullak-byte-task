import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PressableScale } from './primitives/PressableScale';
import { borderRadius, fontFamilies, colors, shadows, spacing } from '../theme';

interface FloatingDropInButtonProps {
  onPress: () => void;
}

export const FloatingDropInButton: React.FC<FloatingDropInButtonProps> = ({ onPress }) => {
  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      style={[
        styles.fab,
        shadows.fab,
        {
          backgroundColor: colors.terracotta,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel="Drop in"
      accessibilityHint="Opens screen to save a new note, link, image, or snippet"
    >
      <Feather name="plus" size={18} color={colors.cream} style={styles.plusIcon} />
      <Text style={[styles.label, { color: colors.cream }]}>Drop in</Text>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: spacing.xxl,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md - 2,
    borderRadius: borderRadius.button, // radius 10 (not pill!)
    minHeight: 44,
  },
  plusIcon: {
    marginRight: 6,
  },
  label: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    fontWeight: '600',
  },
});
