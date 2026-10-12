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
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useItems } from '../../src/hooks/useItems';
import { useTheme } from '../../src/hooks/useTheme';
import { ItemTypeBadge } from '../../src/components/TypeChip';
import { TagChip } from '../../src/components/TagChip';
import { EmptyState } from '../../src/components/EmptyState';
import { ConfirmDialog } from '../../src/components/ConfirmDialog';
import { DomainMonogram } from '../../src/components/primitives/DomainMonogram';
import { PressableScale } from '../../src/components/primitives/PressableScale';
import { formatFullDateTime } from '../../src/utils/formatDate';
import { borderRadius, spacing, fontFamilies, colors, shadows } from '../../src/theme';

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
      Haptics.selectionAsync().catch(() => {});
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (item.archived) {
      await restoreItem(item.id);
    } else {
      await archiveItem(item.id);
    }
    router.back();
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    await deleteItem(item.id);
    router.back();
  };

  // Clean domain name for link item
  const cleanDomain = React.useMemo(() => {
    if (item.type !== 'link' || !item.url) return '';
    try {
      const parsed = new URL(/^https?:\/\//i.test(item.url) ? item.url : `https://${item.url}`);
      return parsed.hostname.replace(/^www\./i, '');
    } catch {
      return item.url;
    }
  }, [item.type, item.url]);

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
            <Feather name="check" size={14} color={colors.cream} style={{ marginRight: 6 }} />
            <Text style={[styles.toastText, { color: colors.cream }]}>{copiedMessage}</Text>
          </View>
        )}

        {/* Top Meta: Type Tile + Dates */}
        <View style={styles.metaRow}>
          <View style={styles.metaLeft}>
            {item.type === 'link' ? (
              <DomainMonogram domain={cleanDomain || 'link'} size={34} />
            ) : (
              <ItemTypeBadge type={item.type} />
            )}
            <View style={styles.metaTextGroup}>
              <Text style={[styles.metaTypeLabel, { color: theme.textSecondary }]}>
                {item.type.toUpperCase()}
              </Text>
              <Text style={[styles.metaDateLabel, { color: theme.textMuted }]}>
                {formatFullDateTime(item.createdAt)}
              </Text>
            </View>
          </View>

          {item.archived && (
            <View style={[styles.archivedIndicator, { borderColor: theme.border }]}>
              <Feather name="archive" size={12} color={colors.terracotta} style={{ marginRight: 4 }} />
              <Text style={[styles.archivedText, { color: colors.terracotta }]}>ARCHIVED</Text>
            </View>
          )}
        </View>

        {/* Full-width image if present */}
        {item.type === 'image' && (
          <View
            style={[
              styles.imageContainer,
              { backgroundColor: theme.surface, borderColor: theme.border },
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
                <Feather name="image" size={42} color={theme.textMuted} />
                <Text style={[styles.placeholderText, { color: theme.textMuted }]}>
                  Image could not be loaded
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Large Fraunces Title */}
        <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>

        {/* Link URL Card */}
        {item.type === 'link' && item.url && (
          <View
            style={[
              styles.urlCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleOpenUrl}
              style={styles.urlLinkTouch}
              accessibilityRole="link"
              accessibilityLabel={`Open link ${item.url}`}
            >
              <Feather name="external-link" size={16} color={colors.terracotta} style={{ marginRight: 8 }} />
              <Text numberOfLines={2} style={[styles.urlText, { color: colors.terracotta }]}>
                {item.url}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleCopy(item.url || '', 'Link URL')}
              style={[
                styles.copyBtn,
                { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Copy URL"
            >
              <Feather name="copy" size={13} color={theme.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.copyBtnText, { color: theme.textSecondary }]}>Copy</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Monospace Code Block for Snippets */}
        {item.type === 'snippet' && item.content && (
          <View
            style={[
              styles.snippetCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={styles.snippetHeader}>
              <Text style={[styles.snippetHeaderLabel, { color: theme.textMuted }]}>
                CODE / TEXT SNIPPET
              </Text>
              <TouchableOpacity
                onPress={() => handleCopy(item.content, 'Snippet')}
                style={styles.copyBtn}
                accessibilityRole="button"
                accessibilityLabel="Copy snippet text"
              >
                <Feather name="copy" size={13} color={theme.textSecondary} style={{ marginRight: 4 }} />
                <Text style={[styles.copyBtnText, { color: theme.textSecondary }]}>Copy</Text>
              </TouchableOpacity>
            </View>
            <Text selectable style={[styles.snippetContent, { color: theme.text }]}>
              {item.content}
            </Text>
          </View>
        )}

        {/* Note / Body Content */}
        {item.type !== 'snippet' && item.content?.trim().length > 0 && (
          <View
            style={[
              styles.contentCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={styles.contentHeader}>
              <Text style={[styles.contentHeaderLabel, { color: theme.textMuted }]}>
                {item.type === 'note' ? 'NOTE BODY' : 'ADDITIONAL NOTES'}
              </Text>
              <TouchableOpacity
                onPress={() => handleCopy(item.content, 'Note')}
                style={styles.copyBtn}
                accessibilityRole="button"
                accessibilityLabel="Copy note text"
              >
                <Feather name="copy" size={13} color={theme.textSecondary} style={{ marginRight: 4 }} />
                <Text style={[styles.copyBtnText, { color: theme.textSecondary }]}>Copy</Text>
              </TouchableOpacity>
            </View>
            <Text selectable style={[styles.bodyText, { color: theme.text }]}>
              {item.content}
            </Text>
          </View>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>TAGS</Text>
            <View style={styles.tagChipsList}>
              {item.tags.map((tag) => (
                <TagChip key={tag} label={tag} size="md" />
              ))}
            </View>
          </View>
        )}

        {/* Timestamps */}
        <View style={[styles.timestampContainer, { borderColor: theme.borderSubtle }]}>
          <Text style={[styles.timeRowText, { color: theme.textMuted }]}>
            Saved on {formatFullDateTime(item.createdAt)}
          </Text>
          {item.updatedAt !== item.createdAt && (
            <Text style={[styles.timeRowText, { color: theme.textMuted, marginTop: 4 }]}>
              Last modified {formatFullDateTime(item.updatedAt)}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Outlined Icon-Button Action Bar (Sticky at bottom) */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
          },
        ]}
      >
        {/* Edit Button */}
        <PressableScale
          onPress={() => router.push(`/item/edit/${item.id}`)}
          style={[
            styles.actionButton,
            { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Edit item"
        >
          <Feather name="edit-2" size={16} color={theme.text} style={{ marginRight: 6 }} />
          <Text style={[styles.actionBtnText, { color: theme.text }]}>Edit</Text>
        </PressableScale>

        {/* Archive / Restore Button */}
        <PressableScale
          onPress={handleToggleArchive}
          style={[
            styles.actionButton,
            { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
          ]}
          accessibilityRole="button"
          accessibilityLabel={item.archived ? 'Restore item to inbox' : 'Archive item'}
        >
          <Feather
            name={item.archived ? 'inbox' : 'archive'}
            size={16}
            color={colors.terracotta}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.actionBtnText, { color: colors.terracotta }]}>
            {item.archived ? 'Restore' : 'Archive'}
          </Text>
        </PressableScale>

        {/* Delete Button */}
        <PressableScale
          onPress={() => setShowDeleteConfirm(true)}
          style={[
            styles.actionButton,
            styles.deleteButton,
            { backgroundColor: theme.dangerBg, borderColor: theme.danger },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Delete item"
        >
          <Feather name="trash-2" size={16} color={theme.danger} style={{ marginRight: 6 }} />
          <Text style={[styles.actionBtnText, { color: theme.danger }]}>Delete</Text>
        </PressableScale>
      </View>

      {/* Styled Delete Confirmation Modal */}
      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete item?"
        message={`Are you sure you want to permanently delete "${item.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Keep"
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
    borderRadius: borderRadius.chip,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  toastText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaTextGroup: {
    marginLeft: spacing.sm + 2,
  },
  metaTypeLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  metaDateLabel: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    marginTop: 1,
  },
  archivedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.chip,
    borderWidth: 1,
  },
  archivedText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 11,
  },
  imageContainer: {
    width: '100%',
    height: 240,
    borderRadius: borderRadius.card, // radius 20
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
  placeholderText: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    marginTop: 8,
  },
  title: {
    fontFamily: fontFamilies.serif,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: spacing.lg,
  },
  urlCard: {
    borderRadius: borderRadius.iconBtn,
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
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14,
    textDecorationLine: 'underline',
    flex: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: borderRadius.chip,
    borderWidth: 1,
  },
  copyBtnText: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
  },
  snippetCard: {
    borderRadius: borderRadius.card,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  snippetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  snippetHeaderLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  snippetContent: {
    fontFamily: fontFamilies.mono,
    fontSize: 14,
    lineHeight: 20,
  },
  contentCard: {
    borderRadius: borderRadius.card,
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
  contentHeaderLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  bodyText: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    lineHeight: 23,
  },
  tagsSection: {
    marginBottom: spacing.lg,
  },
  sectionHeading: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: spacing.xs + 2,
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
  timeRowText: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
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
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.button,
    borderWidth: 1,
    minHeight: 46,
  },
  actionBtnText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14,
  },
  deleteButton: {
    borderWidth: 1,
  },
});
