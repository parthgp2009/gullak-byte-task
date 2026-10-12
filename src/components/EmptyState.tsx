import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { borderRadius, spacing, typography, colors } from '../theme';

interface EmptyStateProps {
  type: 'inbox' | 'search' | 'archive' | 'notFound';
  onActionPress?: () => void;
  actionLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onActionPress,
  actionLabel,
}) => {
  const { theme } = useTheme();

  const getContent = () => {
    switch (type) {
      case 'inbox':
        return {
          icon: 'archive' as const,
          title: 'Your gullak is empty.',
          subtitle: 'Drop in your first find.',
          tagline: 'Drop it in. Find it later.',
          defaultActionLabel: 'Drop in something new',
        };
      case 'search':
        return {
          icon: 'search' as const,
          title: 'Nothing matches that search.',
          subtitle: 'Try checking for typos or searching a different keyword or tag.',
          tagline: undefined,
          defaultActionLabel: 'Clear filters',
        };
      case 'archive':
        return {
          icon: 'inbox' as const,
          title: 'Nothing archived yet.',
          subtitle: 'Items you tuck away for safekeeping will rest here.',
          tagline: undefined,
          defaultActionLabel: undefined,
        };
      case 'notFound':
        return {
          icon: 'alert-circle' as const,
          title: 'Item not found.',
          subtitle: 'This item may have been deleted or moved.',
          tagline: undefined,
          defaultActionLabel: 'Back to Gullak',
        };
    }
  };

  const { icon, title, subtitle, tagline, defaultActionLabel } = getContent();
  const resolvedActionLabel = actionLabel || defaultActionLabel;

  return (
    <View style={styles.container}>
      {/* Decorative clay coin / piggy icon container */}
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: theme.surfaceSecondary,
            borderColor: colors.terracotta,
          },
        ]}
      >
        <Feather name={icon} size={36} color={colors.terracotta} />
      </View>

      <Text style={[styles.title, typography.h2, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.subtitle, typography.body, { color: theme.textSecondary }]}>
        {subtitle}
      </Text>

      {tagline && (
        <View style={[styles.taglineContainer, { borderColor: theme.border }]}>
          <Text style={[styles.taglineText, typography.subtext, { color: colors.marigoldDark }]}>
            “{tagline}”
          </Text>
        </View>
      )}

      {resolvedActionLabel && onActionPress && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onActionPress}
          style={[styles.actionButton, { backgroundColor: colors.terracotta }]}
          accessibilityRole="button"
          accessibilityLabel={resolvedActionLabel}
        >
          <Feather name="plus" size={16} color="#FFFFFF" style={styles.actionIcon} />
          <Text style={[styles.actionButtonText, typography.button]}>{resolvedActionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
    marginTop: spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  taglineContainer: {
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
    marginBottom: spacing.lg,
  },
  taglineText: {
    fontStyle: 'italic',
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.pill,
    marginTop: spacing.sm,
    minHeight: 46,
  },
  actionIcon: {
    marginRight: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
  },
});
