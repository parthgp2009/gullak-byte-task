import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ItemFilterType, ItemType } from '../types';
import { useTheme } from '../hooks/useTheme';
import { borderRadius, spacing, typography, colors } from '../theme';

interface TypeChipProps {
  type: ItemFilterType;
  isSelected?: boolean;
  onPress?: () => void;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export const TypeChip: React.FC<TypeChipProps> = ({
  type,
  isSelected = false,
  onPress,
  showIcon = true,
  size = 'md',
}) => {
  const { theme, isDark } = useTheme();

  const getLabel = (t: ItemFilterType) => {
    switch (t) {
      case 'all':
        return 'All';
      case 'note':
        return 'Notes';
      case 'link':
        return 'Links';
      case 'image':
        return 'Images';
    }
  };

  const getIconName = (t: ItemFilterType): React.ComponentProps<typeof Feather>['name'] => {
    switch (t) {
      case 'all':
        return 'layers';
      case 'note':
        return 'file-text';
      case 'link':
        return 'link-2';
      case 'image':
        return 'image';
    }
  };

  const isSmall = size === 'sm';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.chip,
        isSmall ? styles.chipSmall : styles.chipMedium,
        isSelected
          ? { backgroundColor: colors.terracotta, borderColor: colors.terracotta }
          : { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Filter by ${getLabel(type)}`}
      accessibilityState={{ selected: isSelected }}
    >
      {showIcon && (
        <Feather
          name={getIconName(type)}
          size={isSmall ? 13 : 15}
          color={isSelected ? '#FFFFFF' : theme.textSecondary}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.label,
          isSmall ? typography.caption : typography.subtext,
          { color: isSelected ? '#FFFFFF' : theme.textSecondary },
          isSelected && { fontWeight: '700' },
        ]}
      >
        {getLabel(type)}
      </Text>
    </TouchableOpacity>
  );
};

interface ItemTypeBadgeProps {
  type: ItemType;
}

export const ItemTypeBadge: React.FC<ItemTypeBadgeProps> = ({ type }) => {
  const { theme } = useTheme();

  const config = {
    note: {
      label: 'Note',
      icon: 'file-text' as const,
      bg: theme.typeNoteBg,
      text: theme.typeNoteText,
    },
    link: {
      label: 'Link',
      icon: 'link-2' as const,
      bg: theme.typeLinkBg,
      text: theme.typeLinkText,
    },
    image: {
      label: 'Image',
      icon: 'image' as const,
      bg: theme.typeImageBg,
      text: theme.typeImageText,
    },
  }[type];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Feather name={config.icon} size={12} color={config.text} style={styles.badgeIcon} />
      <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    minHeight: 38,
  },
  chipMedium: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    marginRight: spacing.sm,
  },
  chipSmall: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs + 2,
    minHeight: 28,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontWeight: '500',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs - 1,
    borderRadius: borderRadius.pill,
    alignSelf: 'flex-start',
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
