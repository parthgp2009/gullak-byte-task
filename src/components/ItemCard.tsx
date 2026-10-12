import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Item } from '../types';
import { ItemTypeBadge } from './TypeChip';
import { TagChip } from './TagChip';
import { formatDate } from '../utils/formatDate';
import { useTheme } from '../hooks/useTheme';
import { borderRadius, spacing, typography, colors, shadows } from '../theme';

interface ItemCardProps {
  item: Item;
  onPress: () => void;
  onLongPress?: () => void;
  onOptionsPress?: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onPress,
  onLongPress,
  onOptionsPress,
}) => {
  const { theme } = useTheme();
  const [imageError, setImageError] = useState(false);

  // Derive preview text: URL domain or note/description content
  const getPreviewText = (): string => {
    if (item.type === 'link') {
      if (item.content?.trim()) {
        return item.content.trim();
      }
      return item.url || '';
    }
    return item.content?.trim() || '';
  };

  const previewText = getPreviewText();
  const displayTags = (item.tags || []).slice(0, 3);
  const remainingTagCount = (item.tags || []).length - 3;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
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
      <View style={styles.contentRow}>
        <View style={styles.textContainer}>
          {/* Header Row: Type Badge + Date + Options */}
          <View style={styles.headerRow}>
            <ItemTypeBadge type={item.type} />
            <Text style={[styles.dateText, typography.caption, { color: theme.textMuted }]}>
              {formatDate(item.updatedAt)}
            </Text>
            {item.archived && (
              <View style={[styles.archivedBadge, { backgroundColor: theme.surfaceSecondary }]}>
                <Feather name="archive" size={10} color={theme.textMuted} style={{ marginRight: 3 }} />
                <Text style={[typography.caption, { color: theme.textMuted, fontSize: 10 }]}>
                  Archived
                </Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text
            numberOfLines={2}
            style={[styles.title, typography.h3, { color: theme.text }]}
          >
            {item.title}
          </Text>

          {/* 2-line Content / URL Preview */}
          {previewText.length > 0 && (
            <Text
              numberOfLines={2}
              style={[styles.preview, typography.subtext, { color: theme.textSecondary }]}
            >
              {previewText}
            </Text>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {displayTags.map((tag) => (
                <TagChip key={tag} label={tag} size="sm" />
              ))}
              {remainingTagCount > 0 && (
                <View
                  style={[
                    styles.moreBadge,
                    { backgroundColor: theme.surfaceSecondary, borderColor: theme.borderSubtle },
                  ]}
                >
                  <Text style={[typography.caption, { color: theme.textMuted, fontSize: 10 }]}>
                    +{remainingTagCount}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Thumbnail for image items */}
        {item.type === 'image' && (
          <View
            style={[
              styles.thumbnailContainer,
              { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
            ]}
          >
            {item.imageUri && !imageError ? (
              <Image
                source={{ uri: item.imageUri }}
                style={styles.thumbnail}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={styles.thumbnailPlaceholder}>
                <Feather name="image" size={24} color={theme.textMuted} />
              </View>
            )}
          </View>
        )}
      </View>

      {/* Overflow options button */}
      {onOptionsPress && (
        <TouchableOpacity
          onPress={onOptionsPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.optionsButton}
          accessibilityLabel="Item actions"
          accessibilityRole="button"
        >
          <Feather name="more-horizontal" size={18} color={theme.textMuted} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
    position: 'relative',
  },
  contentRow: {
    flexDirection: 'row',
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
    gap: spacing.sm,
  },
  dateText: {
    marginLeft: 2,
  },
  archivedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  title: {
    marginBottom: spacing.xs,
  },
  preview: {
    marginBottom: spacing.sm,
    lineHeight: 19,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  moreBadge: {
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailContainer: {
    width: 76,
    height: 76,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    marginLeft: spacing.md,
    alignSelf: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.xs,
  },
});
