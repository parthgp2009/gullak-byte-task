import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import * as Clipboard from 'expo-clipboard';
import { Feather } from '@expo/vector-icons';
import { useItems } from '../../src/hooks/useItems';
import { useTheme } from '../../src/hooks/useTheme';
import { ItemTypeBadge } from '../../src/components/TypeChip';
import { TagChip } from '../../src/components/TagChip';
import { EmptyState } from '../../src/components/EmptyState';
import { ConfirmDialog } from '../../src/components/ConfirmDialog';
import { formatFullDateTime } from '../../src/utils/formatDate';
import { borderRadius, spacing, typography, colors, shadows } from '../../src/theme';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getItemById, deleteItem, archiveItem, restoreItem } = useItems();
  const { theme } = useTheme();

  const item = getItemById(id || '');

  const [imageError, setImageError] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <EmptyState
          type="notFound"
          onActionPress={() => router.replace('/')}
          actionLabel="Return to Gullak"
        />
      </View>
    );
  }

  const handleCopy = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      setCopiedMessage(`${label} copied!`);
      setTimeout(() => setCopiedMessage(null), 2500);
    } catch (err) {
      console.warn('Failed to copy to clipboard:', err);
    }
  };

  const handleOpenUrl = async () => {
    if (!item.url) return;
    try {
      const supported = await Linking.canOpenURL(item.url);
      if (supported) {
        await Linking.openURL(item.url);
      } else {
        Alert.alert('Unable to open link', `The link "${item.url}" cannot be opened.`);
      }
    } catch (err) {
      console.warn('Error opening URL:', err);
      Alert.alert('Link Error', 'There was a problem trying to open this URL.');
    }
  };

  const handleToggleArchive = async () => {
    if (item.archived) {
      await restoreItem(item.id);
    } else {
      await archiveItem(item.id);
    }
    router.back();
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    await deleteItem(item.id);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Copied Feedback Toast */}
        {copiedMessage && (
          <View style={[styles.toast, { backgroundColor: colors.terracotta }]}>
            <Feather name="check" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={[typography.subtext, { color: '#FFFFFF', fontWeight: '600' }]}>
              {copiedMessage}
            </Text>
          </View>
        )}

        {/* Top Meta: Type Badge + Archive Status */}
        <View style={styles.metaRow}>
          <ItemTypeBadge type={item.type} />
          {item.archived && (
            <View style={[styles.archivedIndicator, { backgroundColor: theme.surfaceSecondary }]}>
              <Feather name="archive" size={12} color={colors.marigoldDark} style={{ marginRight: 4 }} />
              <Text style={[typography.caption, { color: colors.marigoldDark, fontWeight: '700' }]}>
                ARCHIVED
              </Text>
            </View>
          )}
        </View>

        {/* Full-width image if present */}
        {item.type === 'image' && (
          <View
            style={[
              styles.imageContainer,
              { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
            ]}
          >
            {item.imageUri && !imageError ? (
              <Image
                source={{ uri: item.imageUri }}
                style={styles.fullImage}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Feather name="image" size={48} color={theme.textMuted} />
                <Text style={[typography.subtext, { color: theme.textMuted, marginTop: 8 }]}>
                  Image could not be loaded
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Title */}
        <Text style={[styles.title, typography.h1, { color: theme.text }]}>
          {item.title}
        </Text>

        {/* Link URL Box (for link items) */}
        {item.type === 'link' && item.url && (
          <View
            style={[
              styles.urlCard,
              { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleOpenUrl}
              style={styles.urlLinkTouch}
              accessibilityRole="link"
              accessibilityLabel={`Open link ${item.url}`}
            >
              <Feather name="external-link" size={18} color={colors.terracotta} style={{ marginRight: 8 }} />
              <Text
                numberOfLines={2}
                style={[styles.urlText, typography.body, { color: colors.terracotta }]}
              >
                {item.url}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleCopy(item.url || '', 'Link URL')}
              style={[
                styles.copyUrlBtn,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Copy URL"
            >
              <Feather name="copy" size={14} color={theme.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[typography.caption, { color: theme.textSecondary }]}>Copy</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Note / Body Content */}
        {item.content?.trim().length > 0 && (
          <View
            style={[
              styles.contentCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={styles.contentHeader}>
              <Text style={[typography.caption, { color: theme.textMuted, letterSpacing: 0.5 }]}>
                {item.type === 'note' ? 'NOTE' : 'NOTES & DESCRIPTION'}
              </Text>
              <TouchableOpacity
                onPress={() => handleCopy(item.content, 'Note')}
                style={styles.copyNoteBtn}
                accessibilityRole="button"
                accessibilityLabel="Copy note text"
              >
                <Feather name="copy" size={13} color={theme.textMuted} style={{ marginRight: 4 }} />
                <Text style={[typography.caption, { color: theme.textMuted }]}>Copy text</Text>
              </TouchableOpacity>
            </View>
            <Text
              selectable
              style={[styles.bodyText, typography.body, { color: theme.text }]}
            >
              {item.content}
            </Text>
          </View>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={[styles.sectionHeading, typography.caption, { color: theme.textMuted }]}>
              TAGS
            </Text>
            <View style={styles.tagChipsList}>
              {item.tags.map((tag) => (
                <TagChip key={tag} label={tag} size="md" />
              ))}
            </View>
          </View>
        )}

        {/* Timestamps */}
        <View style={[styles.timestampContainer, { borderColor: theme.borderSubtle }]}>
          <View style={styles.timeRow}>
            <Feather name="calendar" size={13} color={theme.textMuted} style={{ marginRight: 6 }} />
            <Text style={[typography.caption, { color: theme.textMuted }]}>
              Dropped in: {formatFullDateTime(item.createdAt)}
            </Text>
          </View>
          {item.updatedAt !== item.createdAt && (
            <View style={[styles.timeRow, { marginTop: 4 }]}>
              <Feather name="clock" size={13} color={theme.textMuted} style={{ marginRight: 6 }} />
              <Text style={[typography.caption, { color: theme.textMuted }]}>
                Updated: {formatFullDateTime(item.updatedAt)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View
        style={[
          styles.bottomBar,
          shadows.cardHover,
          { backgroundColor: theme.surface, borderTopColor: theme.border },
        ]}
      >
        {/* Edit Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push(`/item/edit/${item.id}`)}
          style={[
            styles.actionBtn,
            { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Edit item"
        >
          <Feather name="edit-2" size={16} color={theme.text} style={{ marginRight: 6 }} />
          <Text style={[typography.button, { color: theme.text }]}>Edit</Text>
        </TouchableOpacity>

        {/* Archive / Restore Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleToggleArchive}
          style={[
            styles.actionBtn,
            { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
          ]}
          accessibilityRole="button"
          accessibilityLabel={item.archived ? 'Restore item to inbox' : 'Archive item'}
        >
          <Feather
            name={item.archived ? 'inbox' : 'archive'}
            size={16}
            color={colors.marigoldDark}
            style={{ marginRight: 6 }}
          />
          <Text style={[typography.button, { color: colors.marigoldDark }]}>
            {item.archived ? 'Restore' : 'Archive'}
          </Text>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowDeleteConfirm(true)}
          style={[
            styles.actionBtn,
            styles.deleteBtn,
            { backgroundColor: theme.dangerBg, borderColor: theme.danger },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Delete item"
        >
          <Feather name="trash-2" size={16} color={theme.danger} style={{ marginRight: 6 }} />
          <Text style={[typography.button, { color: theme.danger }]}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete item?"
        message={`Are you sure you want to permanently delete "${item.title}"? This will remove all local files and cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDestructive
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 4,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  archivedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  imageContainer: {
    width: '100%',
    height: 260,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: spacing.md,
    lineHeight: 30,
  },
  urlCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  urlLinkTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  urlText: {
    flex: 1,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  copyUrlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  contentCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  copyNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
  },
  bodyText: {
    lineHeight: 24,
  },
  tagsSection: {
    marginBottom: spacing.lg,
  },
  sectionHeading: {
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  tagChipsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timestampContainer: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    minHeight: 46,
  },
  deleteBtn: {
    borderWidth: 1,
  },
});
