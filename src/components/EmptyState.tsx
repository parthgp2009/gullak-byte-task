import React, { useEffect } from 'react';
import {
  AccessibilityInfo,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { PressableScale } from './primitives/PressableScale';
import { useTheme } from '../hooks/useTheme';
import { borderRadius, spacing, fontFamilies, colors } from '../theme';

interface EmptyStateProps {
  type: 'inbox' | 'search' | 'archive' | 'notFound';
  onActionPress?: () => void;
  actionLabel?: string;
}

interface FloatingTileProps {
  icon: React.ComponentProps<typeof Feather>['name'];
  style: any;
  delayMs?: number;
  rotationDeg?: number;
}

const FloatingTile: React.FC<FloatingTileProps> = ({
  icon,
  style,
  delayMs = 0,
  rotationDeg = 0,
}) => {
  const { theme } = useTheme();
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
          withTiming(4, { duration: 2200, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, [delayMs, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { rotate: `${rotationDeg}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.tile,
        {
          backgroundColor: theme.tileCream,
        },
        style,
        animatedStyle,
      ]}
    >
      <Feather name={icon} size={16} color={theme.tileIconDark} />
    </Animated.View>
  );
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onActionPress,
  actionLabel,
}) => {
  const { theme } = useTheme();
  const potTranslateY = useSharedValue(0);

  useEffect(() => {
    if (type === 'inbox') {
      potTranslateY.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(6, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }
  }, [type, potTranslateY]);

  const potAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: potTranslateY.value }],
    };
  });

  if (type === 'search') {
    return (
      <View
        style={[
          styles.containerCard,
          styles.lightCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={[styles.tile, { backgroundColor: theme.tileCream, marginBottom: spacing.md }]}>
          <Feather name="search" size={20} color={theme.tileIconDark} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Nothing matches that search.</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Try adjusting your search terms or clearing your tag filters.
        </Text>
        {onActionPress && (
          <PressableScale
            onPress={onActionPress}
            style={[styles.actionButton, { backgroundColor: colors.terracotta }]}
            accessibilityRole="button"
            accessibilityLabel={actionLabel || 'Clear filters'}
          >
            <Text style={[styles.actionButtonText, { color: colors.cream }]}>
              {actionLabel || 'Clear filters'}
            </Text>
          </PressableScale>
        )}
      </View>
    );
  }

  if (type === 'archive') {
    return (
      <View
        style={[
          styles.containerCard,
          styles.lightCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={[styles.tile, { backgroundColor: theme.tileCream, marginBottom: spacing.md }]}>
          <Feather name="archive" size={20} color={theme.tileIconDark} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Nothing archived yet.</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Items you archive for safekeeping will appear here.
        </Text>
      </View>
    );
  }

  if (type === 'notFound') {
    return (
      <View
        style={[
          styles.containerCard,
          styles.lightCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={[styles.tile, { backgroundColor: theme.tileCream, marginBottom: spacing.md }]}>
          <Feather name="alert-circle" size={20} color={theme.tileIconDark} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Item not found.</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          This item may have been deleted or moved.
        </Text>
        {onActionPress && (
          <PressableScale
            onPress={onActionPress}
            style={[styles.actionButton, { backgroundColor: colors.terracotta }]}
            accessibilityRole="button"
            accessibilityLabel={actionLabel || 'Return to Gullak'}
          >
            <Text style={[styles.actionButtonText, { color: colors.cream }]}>
              {actionLabel || 'Return to Gullak'}
            </Text>
          </PressableScale>
        )}
      </View>
    );
  }

  // Primary Inbox Empty State (Exact 1:1 match to Mockup image)
  return (
    <View
      style={[
        styles.containerCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      {/* 3D Pot Illustration with 5 floating tiles around it */}
      <View style={styles.illustrationStage}>
        {/* Floating tiles matching the mockup */}
        {/* 1. Top-Left: link icon */}
        <FloatingTile
          icon="link-2"
          style={styles.tileTopLeft}
          delayMs={150}
          rotationDeg={-6}
        />

        {/* 2. Top-Center: image icon */}
        <FloatingTile
          icon="image"
          style={styles.tileTopCenter}
          delayMs={500}
          rotationDeg={4}
        />

        {/* 3. Top-Right: edit icon */}
        <FloatingTile
          icon="edit-2"
          style={styles.tileTopRight}
          delayMs={300}
          rotationDeg={8}
        />

        {/* 4. Mid-Left: file-text icon */}
        <FloatingTile
          icon="file-text"
          style={styles.tileMidLeft}
          delayMs={650}
          rotationDeg={-4}
        />

        {/* 5. Mid-Right: file / note icon */}
        <FloatingTile
          icon="file"
          style={styles.tileMidRight}
          delayMs={400}
          rotationDeg={5}
        />

        {/* Central 3D Clay Pot */}
        <Animated.View style={[styles.potWrapper, potAnimatedStyle]}>
          <Image
            source={require('../../assets/images/gullak-pot.png')}
            style={styles.potImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]}>
        Your Gullak is empty.
      </Text>

      {/* Subtitle */}
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Drop in your first find. Gather ideas, links, and snippets to keep them safe.
      </Text>

      {/* Action Button */}
      {onActionPress && (
        <PressableScale
          onPress={onActionPress}
          style={[styles.actionButton, { backgroundColor: colors.terracotta }]}
          accessibilityRole="button"
          accessibilityLabel={actionLabel || '+ Drop in your first find'}
        >
          <Feather name="plus" size={16} color={colors.cream} style={{ marginRight: 6 }} />
          <Text style={[styles.actionButtonText, { color: colors.cream }]}>
            {actionLabel || 'Drop in your first find'}
          </Text>
        </PressableScale>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  containerCard: {
    borderRadius: borderRadius.card, // radius 20
    borderWidth: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl + 4,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  lightCard: {
    paddingVertical: spacing.xxxl,
    marginTop: spacing.xl,
  },
  illustrationStage: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: spacing.md,
  },
  potWrapper: {
    width: '58%',
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  potImage: {
    width: '100%',
    height: '100%',
  },
  tile: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.tile, // radius 8
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  // Absolute positions surrounding the pot as in the mockup image
  tileTopLeft: {
    position: 'absolute',
    top: 22,
    left: '26%',
  },
  tileTopCenter: {
    position: 'absolute',
    top: 10,
    left: '52%',
  },
  tileTopRight: {
    position: 'absolute',
    top: 36,
    right: '18%',
  },
  tileMidLeft: {
    position: 'absolute',
    top: 72,
    left: '8%',
  },
  tileMidRight: {
    position: 'absolute',
    top: 76,
    right: '8%',
  },
  title: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs + 2,
  },
  subtitle: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 290,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.tile, // radius 8/10
    minHeight: 46,
    minWidth: 200,
  },
  actionButtonText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    fontWeight: '600',
  },
});
