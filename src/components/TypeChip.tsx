import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ItemFilterType, ItemType } from '../types';
import { PressableScale } from './primitives/PressableScale';
import { useTheme } from '../hooks/useTheme';
import { borderRadius, spacing, typography, colors, fontFamilies } from '../theme';

interface TypeChipProps {
  type: ItemFilterType | 'snippet';
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
  const { theme } = useTheme();

  const getLabel = (t: typeof type) => {
    switch (t) {
      case 'all':
        return 'All';
      case 'note':
        return 'Notes';
      case 'link':
        return 'Links';
      case 'image':
        return 'Images';
      case 'snippet':
        return 'Snippets';
    }
  };

  const getIconName = (t: typeof type): React.ComponentProps<typeof Feather>['name'] => {
    switch (t) {
      case 'all':
        return 'layers';
      case 'note':
        return 'file-text';
      case 'link':
        return 'link-2';
      case 'image':
        return 'image';
      case 'snippet':
        return 'code';
    }
  };

  const isSmall = size === 'sm';

  return (
    <PressableScale
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Filter by ${getLabel(type)}`}
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
      {showIcon && (
        <Feather
          name={getIconName(type)}
          size={isSmall ? 13 : 14}
          color={isSelected ? colors.cream : theme.textSecondary}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.label,
          {
            color: isSelected ? colors.cream : theme.textSecondary,
            fontFamily: isSelected ? fontFamilies.sansSemiBold : fontFamilies.sans,
            fontSize: isSmall ? 12 : 14,
          },
        ]}
      >
        {getLabel(type)}
      </Text>
    </PressableScale>
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
    },
    link: {
      label: 'Link',
      icon: 'link-2' as const,
    },
    image: {
      label: 'Image',
      icon: 'image' as const,
    },
    snippet: {
      label: 'Snippet',
      icon: 'code' as const,
    },
  }[type];

  return (
    <View style={[styles.badgeTile, { backgroundColor: theme.tileCream }]}>
      <Feather name={config.icon} size={15} color={theme.tileIconDark} />
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.chip, // radius 10 as in mockup
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
    minHeight: 30,
  },
  icon: {
    marginRight: 6,
  },
  label: {},
  badgeTile: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.tile, // radius 8 cream square tile
    alignItems: 'center',
    justifyContent: 'center',
  },
});
