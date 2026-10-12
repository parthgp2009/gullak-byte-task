import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { borderRadius, spacing, typography, colors } from '../theme';

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
          { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.hashText, { color: colors.marigoldDark }]}>#</Text>
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
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
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[
          styles.chip,
          isSmall ? styles.chipSmall : styles.chipMedium,
          isSelected
            ? { backgroundColor: colors.marigold, borderColor: colors.marigoldDark }
            : { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Filter by tag ${label}`}
        accessibilityState={{ selected: isSelected }}
      >
        <Text
          style={[
            styles.hashText,
            { color: isSelected ? '#FFFFFF' : colors.marigoldDark },
          ]}
        >
          #
        </Text>
        <Text
          style={[
            styles.label,
            isSmall ? typography.caption : typography.subtext,
            { color: isSelected ? '#FFFFFF' : theme.textSecondary },
            isSelected && { fontWeight: '700' },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  // Display mode
  return (
    <View
      style={[
        styles.chip,
        styles.chipSmall,
        { backgroundColor: theme.surfaceSecondary, borderColor: theme.borderSubtle },
      ]}
    >
      <Text style={[styles.hashText, { color: colors.marigoldDark, fontSize: 11 }]}>#</Text>
      <Text style={[styles.label, typography.caption, { color: theme.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  chipMedium: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
    minHeight: 34,
  },
  chipSmall: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs - 2,
    marginRight: spacing.xs + 2,
    minHeight: 24,
  },
  hashText: {
    fontWeight: '700',
    marginRight: 2,
  },
  label: {
    fontWeight: '500',
  },
  removeBtn: {
    marginLeft: 6,
    padding: 2,
  },
});
