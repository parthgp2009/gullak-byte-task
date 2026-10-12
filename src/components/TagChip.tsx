import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PressableScale } from './primitives/PressableScale';
import { useTheme } from '../hooks/useTheme';
import { borderRadius, spacing, colors, fontFamilies } from '../theme';

interface TagChipProps {
  label: string;
  variant?: 'display' | 'selectable' | 'removable';
  isSelected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export const TagChip: React.FC<TagChipProps> = ({
  label,
  variant = 'display',
  isSelected = false,
  onPress,
  onRemove,
  size = 'md',
}) => {
  const { theme } = useTheme();

  const isSmall = size === 'sm';

  if (variant === 'removable') {
    return (
      <View
        style={[
          styles.chip,
          isSmall ? styles.chipSmall : styles.chipMedium,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.hashText, { color: colors.terracotta }]}>#</Text>
        <Text style={[styles.label, { color: theme.text, fontFamily: fontFamilies.sans }]}>
          {label}
        </Text>
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.removeBtn}
          accessibilityLabel={`Remove tag ${label}`}
          accessibilityRole="button"
        >
          <Feather name="x" size={13} color={theme.textMuted} />
        </TouchableOpacity>
      </View>
    );
  }

  if (variant === 'selectable') {
    return (
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Filter by tag ${label}`}
        accessibilityState={{ selected: isSelected }}
        style={[
          styles.chip,
          isSmall ? styles.chipSmall : styles.chipMedium,
          isSelected
            ? {
                backgroundColor: colors.terracotta,
                borderColor: colors.terracotta,
              }
            : {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
        ]}
      >
        <Text
          style={[
            styles.hashText,
            { color: isSelected ? colors.cream : colors.terracotta },
          ]}
        >
          #
        </Text>
        <Text
          style={[
            styles.label,
            {
              color: isSelected ? colors.cream : theme.textSecondary,
              fontFamily: isSelected ? fontFamilies.sansSemiBold : fontFamilies.sans,
              fontSize: isSmall ? 12 : 13,
            },
          ]}
        >
          {label}
        </Text>
      </PressableScale>
    );
  }

  // Display mode (subtle text tag on cards)
  return (
    <View style={styles.displayTag}>
      <Text style={[styles.displayText, { color: theme.textMuted }]}>
        #{label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.chip, // radius 10
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  chipMedium: {
    paddingHorizontal: spacing.md - 2,
    paddingVertical: spacing.xs + 2,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
    minHeight: 34,
  },
  chipSmall: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs - 1,
    marginRight: spacing.xs + 2,
    minHeight: 26,
  },
  hashText: {
    fontFamily: fontFamilies.sansBold,
    marginRight: 2,
    fontSize: 12,
  },
  label: {},
  removeBtn: {
    marginLeft: 6,
    padding: 2,
  },
  displayTag: {
    marginRight: spacing.sm,
  },
  displayText: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
  },
});
