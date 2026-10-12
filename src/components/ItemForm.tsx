import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { Item, ItemType } from '../types';
import { TagInput } from './TagInput';
import { ConfirmDialog } from './ConfirmDialog';
import { normalizeUrl } from '../utils/normalizeUrl';
import { deriveTitle } from '../utils/deriveTitle';
import { normalizeTags } from '../utils/normalizeTags';
import { useItems } from '../hooks/useItems';
import { useTheme } from '../hooks/useTheme';
import { borderRadius, spacing, typography, colors } from '../theme';

interface ItemFormProps {
  initialItem?: Item;
  onSave: (data: {
    type: ItemType;
    title: string;
    content: string;
    url?: string;
    imageUri?: string;
    tags: string[];
    archived?: boolean;
  }) => Promise<void>;
  onCancel: () => void;
  isEditMode?: boolean;
}

export const ItemForm: React.FC<ItemFormProps> = ({
  initialItem,
  onSave,
  onCancel,
  isEditMode = false,
}) => {
  const { theme } = useTheme();
  const { allTags } = useItems();

  const [type, setType] = useState<ItemType>(initialItem?.type || 'note');
  const [title, setTitle] = useState(initialItem?.title || '');
  const [content, setContent] = useState(initialItem?.content || '');
  const [url, setUrl] = useState(initialItem?.url || '');
  const [imageUri, setImageUri] = useState<string | undefined>(initialItem?.imageUri);
  const [tags, setTags] = useState<string[]>(initialItem?.tags || []);

  const [isSaving, setIsSaving] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  // Check if form has been modified
  const hasChanges = () => {
    if (!initialItem) {
      return (
        title.trim().length > 0 ||
        content.trim().length > 0 ||
        url.trim().length > 0 ||
        imageUri !== undefined ||
        tags.length > 0
      );
    }
    return (
      title !== initialItem.title ||
      content !== initialItem.content ||
      url !== (initialItem.url || '') ||
      imageUri !== initialItem.imageUri ||
      JSON.stringify(tags) !== JSON.stringify(initialItem.tags) ||
      type !== initialItem.type
    );
  };

  const handleCancelPress = () => {
    if (hasChanges()) {
      setShowDiscardDialog(true);
    } else {
      onCancel();
    }
  };

  // Gallery picker
  const pickFromGallery = async () => {
    try {
      setInlineError(null);
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setInlineError('Photo library permission is required to choose an image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Failed to pick image from gallery:', err);
      setInlineError('Unable to open photo gallery.');
    }
  };

  // Camera capture
  const takePhoto = async () => {
    try {
      setInlineError(null);
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setInlineError('Camera permission is required to capture photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Failed to capture photo:', err);
      setInlineError('Unable to open camera.');
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setInlineError(null);

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const trimmedUrl = url.trim();

    // Validation by type
    if (type === 'note') {
      if (!trimmedTitle && !trimmedContent) {
        setInlineError('A note cannot be empty. Please add a title or some text.');
        return;
      }
    } else if (type === 'link') {
      if (!trimmedUrl) {
        setInlineError('Please provide a URL to save.');
        return;
      }
      const urlResult = normalizeUrl(trimmedUrl);
      if (!urlResult.isValid) {
        setInlineError(urlResult.error || 'Please enter a valid URL.');
        return;
      }
    } else if (type === 'image') {
      if (!imageUri) {
        setInlineError('Please choose or take a photo to save this image find.');
        return;
      }
    }

    // Auto-derive title if blank
    const derivedFinalTitle = deriveTitle(
      type,
      trimmedTitle,
      trimmedContent,
      type === 'link' ? normalizeUrl(trimmedUrl).normalizedUrl : undefined,
      initialItem?.createdAt
    );

    const finalUrl =
      type === 'link' ? normalizeUrl(trimmedUrl).normalizedUrl : undefined;

    const cleanedTags = normalizeTags(tags);

    try {
      setIsSaving(true);
      await onSave({
        type,
        title: derivedFinalTitle,
        content: trimmedContent,
        url: finalUrl,
        imageUri: type === 'image' ? imageUri : undefined,
        tags: cleanedTags,
        archived: initialItem?.archived || false,
      });
    } catch (err) {
      console.error('Save failed:', err);
      setInlineError('Failed to save. Please try again.');
      setIsSaving(false);
    }
  };

  // Preview derived title hint when title input is empty
  const titleHint = !title.trim()
    ? deriveTitle(
        type,
        '',
        content.trim(),
        type === 'link' && url.trim() ? url.trim() : undefined,
        initialItem?.createdAt
      )
    : null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.scrollContainer, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Inline Error Banner */}
        {inlineError && (
          <View style={[styles.errorBanner, { backgroundColor: theme.dangerBg, borderColor: theme.danger }]}>
            <Feather name="alert-circle" size={16} color={theme.danger} style={{ marginRight: 8 }} />
            <Text style={[styles.errorText, typography.subtext, { color: theme.danger }]}>
              {inlineError}
            </Text>
          </View>
        )}

        {/* Type Selector (Note | Link | Image) */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, typography.caption, { color: theme.textMuted }]}>
            ITEM TYPE
          </Text>
          <View style={[styles.typeSelectorRow, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
            {(['note', 'link', 'image'] as ItemType[]).map((t) => {
              const isSelected = type === t;
              const icons = {
                note: 'file-text' as const,
                link: 'link-2' as const,
                image: 'image' as const,
              };
              const labels = { note: 'Note', link: 'Link', image: 'Image' };

              return (
                <TouchableOpacity
                  key={t}
                  activeOpacity={0.8}
                  onPress={() => {
                    setType(t);
                    setInlineError(null);
                  }}
                  style={[
                    styles.typeSelectorTab,
                    isSelected && [
                      styles.typeSelectorTabActive,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                    ],
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${labels[t]} type`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Feather
                    name={icons[t]}
                    size={16}
                    color={isSelected ? colors.terracotta : theme.textMuted}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.typeSelectorLabel,
                      typography.subtext,
                      {
                        color: isSelected ? theme.text : theme.textMuted,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {labels[t]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Link URL Field (shown only for Link) */}
        {type === 'link' && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, typography.caption, { color: theme.textMuted }]}>
              WEB LINK (URL) *
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
              ]}
            >
              <Feather name="globe" size={16} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                value={url}
                onChangeText={(text) => {
                  setUrl(text);
                  setInlineError(null);
                }}
                placeholder="example.com or https://..."
                placeholderTextColor={theme.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                style={[styles.inputField, typography.body, { color: theme.text }]}
              />
            </View>
          </View>
        )}

        {/* Image Picker & Preview (shown only for Image) */}
        {type === 'image' && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, typography.caption, { color: theme.textMuted }]}>
              IMAGE PHOTO *
            </Text>

            {imageUri ? (
              <View style={[styles.imagePreviewContainer, { borderColor: theme.border }]}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
                <View style={styles.imageActionsOverlay}>
                  <TouchableOpacity
                    onPress={pickFromGallery}
                    style={[styles.imageActionBtn, { backgroundColor: 'rgba(0,0,0,0.7)' }]}
                    accessibilityLabel="Replace photo from gallery"
                  >
                    <Feather name="refresh-cw" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={[typography.caption, { color: '#FFFFFF' }]}>Replace</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setImageUri(undefined)}
                    style={[styles.imageActionBtn, { backgroundColor: 'rgba(198,40,40,0.85)' }]}
                    accessibilityLabel="Remove photo"
                  >
                    <Feather name="trash-2" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={[typography.caption, { color: '#FFFFFF' }]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.imagePickersRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={pickFromGallery}
                  style={[
                    styles.pickButton,
                    { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Choose from photo gallery"
                >
                  <Feather name="image" size={20} color={colors.terracotta} style={{ marginBottom: 6 }} />
                  <Text style={[typography.subtext, typography.bodyBold, { color: theme.text }]}>
                    Choose from Gallery
                  </Text>
                  <Text style={[typography.caption, { color: theme.textMuted }]}>
                    Select saved photos
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={takePhoto}
                  style={[
                    styles.pickButton,
                    { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Take a photo with camera"
                >
                  <Feather name="camera" size={20} color={colors.marigoldDark} style={{ marginBottom: 6 }} />
                  <Text style={[typography.subtext, typography.bodyBold, { color: theme.text }]}>
                    Take Photo
                  </Text>
                  <Text style={[typography.caption, { color: theme.textMuted }]}>
                    Use device camera
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Title Field (Optional, auto-derived if blank) */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={[styles.sectionLabel, typography.caption, { color: theme.textMuted }]}>
              TITLE
            </Text>
            {titleHint && (
              <Text style={[styles.derivedHint, typography.caption, { color: colors.marigoldDark }]}>
                (Auto: &quot;{titleHint}&quot;)
              </Text>
            )}
          </View>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
            ]}
          >
            <TextInput
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                setInlineError(null);
              }}
              placeholder={titleHint ? `Leave empty to auto-title as "${titleHint}"` : 'Give it a name...'}
              placeholderTextColor={theme.textMuted}
              style={[styles.inputField, typography.body, { color: theme.text }]}
            />
          </View>
        </View>

        {/* Content Field: Note body, or optional note for Link/Image */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, typography.caption, { color: theme.textMuted }]}>
            {type === 'note' ? 'NOTE BODY *' : 'ADDITIONAL NOTES (OPTIONAL)'}
          </Text>
          <View
            style={[
              styles.textAreaWrapper,
              { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
            ]}
          >
            <TextInput
              value={content}
              onChangeText={(text) => {
                setContent(text);
                setInlineError(null);
              }}
              placeholder={
                type === 'note'
                  ? 'Write your thoughts, paste quotes, recipes...'
                  : 'Add context, thoughts, or reminders...'
              }
              placeholderTextColor={theme.textMuted}
              multiline
              textAlignVertical="top"
              style={[styles.textArea, typography.body, { color: theme.text }]}
            />
          </View>
        </View>

        {/* Tags Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, typography.caption, { color: theme.textMuted }]}>
            TAGS
          </Text>
          <TagInput tags={tags} onChangeTags={setTags} suggestions={allTags} />
        </View>

        {/* Action Buttons: Save & Cancel */}
        <View style={styles.footerButtons}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleCancelPress}
            style={[
              styles.footerBtn,
              styles.cancelBtn,
              { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text style={[typography.button, { color: theme.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={isSaving}
            style={[
              styles.footerBtn,
              styles.saveBtn,
              {
                backgroundColor: isSaving ? theme.textMuted : colors.terracotta,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={isEditMode ? 'Update Item' : 'Drop into Gullak'}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Feather
                  name={isEditMode ? 'check' : 'arrow-down-circle'}
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={[typography.button, { color: '#FFFFFF' }]}>
                  {isEditMode ? 'Save Changes' : 'Drop In'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Discard confirmation dialog */}
      <ConfirmDialog
        visible={showDiscardDialog}
        title="Discard changes?"
        message="You have unsaved changes. If you leave now, your edits will be discarded."
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        isDestructive
        onConfirm={() => {
          setShowDiscardDialog(false);
          onCancel();
        }}
        onCancel={() => setShowDiscardDialog(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  errorText: {
    flex: 1,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  derivedHint: {
    fontStyle: 'italic',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: 4,
  },
  typeSelectorTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 44,
  },
  typeSelectorTabActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  typeSelectorLabel: {
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  inputField: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  textAreaWrapper: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    minHeight: 120,
  },
  textArea: {
    minHeight: 100,
    maxHeight: 250,
  },
  imagePickersRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  pickButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    minHeight: 110,
  },
  imagePreviewContainer: {
    width: '100%',
    height: 220,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imageActionsOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  imageActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.pill,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  footerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    minHeight: 52,
  },
  cancelBtn: {
    borderWidth: 1,
  },
  saveBtn: {},
});
