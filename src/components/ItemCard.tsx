import React, { useRef, useState } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { Feather } from '@expo/vector-icons';
import { Item } from '../types';
import { DomainMonogram } from './primitives/DomainMonogram';
import { formatDate } from '../utils/formatDate';
import { useTheme } from '../hooks/useTheme';
import { borderRadius, spacing, fontFamilies, colors, shadows } from '../theme';

interface ItemCardProps {
  item: Item;
  onPress: () => void;
  onLongPress?: () => void;
  onOptionsPress?: () => void;
  onSwipeArchive?: () => void;
  onSwipeDelete?: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onPress,
  onLongPress,
  onOptionsPress,
  onSwipeArchive,
  onSwipeDelete,
}) => {
  const { theme } = useTheme();
  const swipeableRef = useRef<Swipeable>(null);
  const [imageError, setImageError] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Extract clean domain for link items
  const cleanDomain = React.useMemo(() => {
    if (item.type !== 'link' || !item.url) return '';
    try {
      const parsed = new URL(/^https?:\/\//i.test(item.url) ? item.url : `https://${item.url}`);
      return parsed.hostname.replace(/^www\./i, '');
    } catch {
      return item.url;
    }
  }, [item.type, item.url]);

  const handleCopySnippet = async () => {
    try {
      await Clipboard.setStringAsync(item.content || '');
      Haptics.selectionAsync().catch(() => {});
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } catch (err) {
      console.warn('Failed to copy snippet:', err);
    }
  };

  // Render Swipe Right (Swipe from right to left -> Archive)
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          swipeableRef.current?.close();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          onSwipeArchive?.();
        }}
        style={[styles.swipeAction, styles.swipeRight, { backgroundColor: colors.terracotta }]}
        accessibilityRole="button"
        accessibilityLabel={item.archived ? 'Restore item' : 'Archive item'}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Feather
            name={item.archived ? 'inbox' : 'archive'}
            size={22}
            color={colors.cream}
          />
        </Animated.View>
        <Text style={[styles.swipeLabel, { color: colors.cream }]}>
          {item.archived ? 'Restore' : 'Archive'}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render Swipe Left (Swipe from left to right -> Delete)
  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0.5, 1],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          swipeableRef.current?.close();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          onSwipeDelete?.();
        }}
        style={[styles.swipeAction, styles.swipeLeft, { backgroundColor: theme.danger }]}
        accessibilityRole="button"
        accessibilityLabel="Delete item"
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Feather name="trash-2" size={22} color="#FFFFFF" />
        </Animated.View>
        <Text style={[styles.swipeLabel, { color: '#FFFFFF' }]}>Delete</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      leftThreshold={50}
      rightThreshold={50}
      renderLeftActions={onSwipeDelete ? renderLeftActions : undefined}
      renderRightActions={onSwipeArchive ? renderRightActions : undefined}
      onSwipeableWillOpen={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }}
      containerStyle={styles.swipeContainer}
    >
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={350}
        style={[
          styles.card,
          shadows.card,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${item.type}: ${item.title}`}
      >
        {/* Card Header Row: Icon Tile + Meta / Domain + Date + Options */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeftGroup}>
            {/* Tile by Type */}
            {item.type === 'link' ? (
              <DomainMonogram domain={cleanDomain || 'link'} size={32} />
            ) : (
              <View style={[styles.typeTile, { backgroundColor: theme.tileCream }]}>
                <Feather
                  name={
                    item.type === 'note'
                      ? 'edit-2'
                      : item.type === 'image'
                      ? 'image'
                      : 'code'
                  }
                  size={15}
                  color={theme.tileIconDark}
                />
              </View>
            )}

            {/* Link Domain or Type Label */}
            {item.type === 'link' && cleanDomain.length > 0 && (
              <Text numberOfLines={1} style={[styles.domainText, { color: theme.textSecondary }]}>
                {cleanDomain}
              </Text>
            )}
          </View>

          <View style={styles.headerRightGroup}>
            <Text style={[styles.dateText, { color: theme.textMuted }]}>
              {formatDate(item.updatedAt)}
            </Text>

            {onOptionsPress && (
              <TouchableOpacity
                onPress={onOptionsPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.moreButton}
                accessibilityLabel="Item actions"
              >
                <Feather name="more-horizontal" size={17} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Title in Fraunces Serif */}
        <Text numberOfLines={2} style={[styles.title, { color: theme.text }]}>
          {item.title}
        </Text>

        {/* Note / Link Body Preview */}
        {item.type !== 'snippet' && item.type !== 'image' && item.content?.trim().length > 0 && (
          <Text numberOfLines={2} style={[styles.previewText, { color: theme.textSecondary }]}>
            {item.content.trim()}
          </Text>
        )}

        {/* Image Thumbnail for Image Items */}
        {item.type === 'image' && (
          <View style={[styles.imagePreviewWrapper, { borderColor: theme.borderSubtle }]}>
            {item.imageUri && !imageError ? (
              <Image
                source={{ uri: item.imageUri }}
                style={styles.cardImage}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: theme.surfaceSecondary }]}>
                <Feather name="image" size={24} color={theme.textMuted} />
              </View>
            )}
          </View>
        )}

        {/* Monospace Code Block for Snippet Items */}
        {item.type === 'snippet' && (
          <View
            style={[
              styles.snippetBlock,
              {
                backgroundColor: theme.surfaceSecondary,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            <View style={styles.snippetHeader}>
              <Text style={[styles.snippetLabel, { color: theme.textMuted }]}>CODE SNIPPET</Text>
              <TouchableOpacity
                onPress={handleCopySnippet}
                style={styles.snippetCopyBtn}
                accessibilityLabel="Copy snippet text"
              >
                <Feather
                  name={copiedSnippet ? 'check' : 'copy'}
                  size={13}
                  color={copiedSnippet ? colors.terracotta : theme.textMuted}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.snippetCopyText,
                    { color: copiedSnippet ? colors.terracotta : theme.textMuted },
                  ]}
                >
                  {copiedSnippet ? 'Copied' : 'Copy'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text
              numberOfLines={4}
              style={[styles.snippetText, { color: theme.text }]}
            >
              {item.content}
            </Text>
          </View>
        )}

        {/* Card Footer: Muted #tags and Archive tag */}
        <View style={styles.cardFooter}>
          <View style={styles.tagsContainer}>
            {item.tags &&
              item.tags.slice(0, 3).map((tag) => (
                <Text key={tag} style={[styles.footerTag, { color: theme.textMuted }]}>
                  #{tag}
                </Text>
              ))}
            {item.tags && item.tags.length > 3 && (
              <Text style={[styles.footerTag, { color: theme.textMuted }]}>
                +{item.tags.length - 3}
              </Text>
            )}
          </View>

          {item.archived && (
            <View style={[styles.archivedBadge, { borderColor: theme.border }]}>
              <Feather name="archive" size={10} color={colors.terracotta} style={{ marginRight: 3 }} />
              <Text style={[styles.archivedLabel, { color: colors.terracotta }]}>Archived</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  swipeContainer: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.card, // radius 20
    overflow: 'hidden',
  },
  card: {
    borderRadius: borderRadius.card, // radius 20
    borderWidth: 1,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm + 2,
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeTile: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.tile, // radius 8
    alignItems: 'center',
    justifyContent: 'center',
  },
  domainText: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    marginLeft: spacing.sm,
    flex: 1,
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
  },
  moreButton: {
    marginLeft: spacing.sm,
    padding: 2,
  },
  title: {
    fontFamily: fontFamilies.serif,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
    marginBottom: spacing.xs,
  },
  previewText: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  imagePreviewWrapper: {
    width: '100%',
    height: 180,
    borderRadius: borderRadius.iconBtn, // radius 12 inside radius 20 card
    overflow: 'hidden',
    borderWidth: 1,
    marginVertical: spacing.sm,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  snippetBlock: {
    borderRadius: borderRadius.tile,
    borderWidth: 1,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  snippetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  snippetLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 10,
    letterSpacing: 0.6,
  },
  snippetCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  snippetCopyText: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
  },
  snippetText: {
    fontFamily: fontFamilies.mono,
    fontSize: 13,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footerTag: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
  },
  archivedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  archivedLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 10,
  },
  swipeAction: {
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeRight: {
    borderTopRightRadius: borderRadius.card,
    borderBottomRightRadius: borderRadius.card,
  },
  swipeLeft: {
    borderTopLeftRadius: borderRadius.card,
    borderBottomLeftRadius: borderRadius.card,
  },
  swipeLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 12,
    marginTop: 4,
  },
});
