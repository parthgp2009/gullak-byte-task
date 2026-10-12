import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { Item, ItemType } from '../types';
import { TagInput } from './TagInput';
import { ConfirmDialog } from './ConfirmDialog';
import { PressableScale } from './primitives/PressableScale';
import { normalizeUrl } from '../utils/normalizeUrl';
import { deriveTitle } from '../utils/deriveTitle';
import { normalizeTags } from '../utils/normalizeTags';
import { useItems } from '../hooks/useItems';
import { useTheme } from '../hooks/useTheme';
import { borderRadius, spacing, fontFamilies, colors } from '../theme';

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

  // Save flourish: coin drop animation
  const coinY = useSharedValue(-60);
  const coinOpacity = useSharedValue(0);

  const coinAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: coinOpacity.value,
      transform: [{ translateY: coinY.value }],
    };
  });

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
      console.warn('Failed to pick image:', err);
      setInlineError('Unable to open photo gallery.');
    }
  };

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

    // Validation
    if (type === 'note') {
      if (!trimmedTitle && !trimmedContent) {
        setInlineError('A note cannot be empty. Please add a title or some text.');
        return;
      }
    } else if (type === 'snippet') {
      if (!trimmedTitle && !trimmedContent) {
        setInlineError('Please enter some code or text for the snippet.');
        return;
      }
    } else if (type === 'link') {
      if (!trimmedUrl) {
        setInlineError('Please enter a URL to save.');
        return;
      }
      const urlResult = normalizeUrl(trimmedUrl);
      if (!urlResult.isValid) {
        setInlineError(urlResult.error || 'Please enter a valid URL.');
        return;
      }
    } else if (type === 'image') {
      if (!imageUri) {
        setInlineError('Please select or capture a photo to save this image find.');
        return;
      }
    }

    const derivedFinalTitle = deriveTitle(
      type,
      trimmedTitle,
      trimmedContent,
      type === 'link' ? normalizeUrl(trimmedUrl).normalizedUrl : undefined,
      initialItem?.createdAt
    );

    const finalUrl = type === 'link' ? normalizeUrl(trimmedUrl).normalizedUrl : undefined;
    const cleanedTags = normalizeTags(tags);

    try {
      setIsSaving(true);

      // Save flourish animation: coin drop with medium haptic (< 700ms)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      coinOpacity.value = withTiming(1, { duration: 150 });
      coinY.value = withTiming(0, {
        duration: 380,
        easing: Easing.out(Easing.back(1.5)),
      });

      await new Promise((res) => setTimeout(res, 350));

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
      coinOpacity.value = 0;
      coinY.value = -60;
    }
  };

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
        {/* Save Flourish Coin Element */}
        <Animated.View style={[styles.coinFlourish, coinAnimatedStyle]}>
          <View style={[styles.coinBadge, { backgroundColor: colors.terracotta }]}>
            <Feather name="arrow-down" size={16} color={colors.cream} />
          </View>
        </Animated.View>

        {/* Soft Inline Error Banner */}
        {inlineError && (
          <View
            style={[
              styles.errorBanner,
              { backgroundColor: theme.dangerBg, borderColor: theme.danger },
            ]}
          >
            <Feather name="alert-circle" size={16} color={theme.danger} style={{ marginRight: 8 }} />
            <Text style={[styles.errorText, { color: theme.danger }]}>{inlineError}</Text>
          </View>
        )}

        {/* Type Selector (Note | Link | Image | Snippet) */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>ITEM TYPE</Text>
          <View
            style={[
              styles.typeSelectorRow,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            {(['note', 'link', 'image', 'snippet'] as ItemType[]).map((t) => {
              const isSelected = type === t;
              const icons = {
                note: 'file-text' as const,
                link: 'link-2' as const,
                image: 'image' as const,
                snippet: 'code' as const,
              };
              const labels = {
                note: 'Note',
                link: 'Link',
                image: 'Image',
                snippet: 'Snippet',
              };

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
                      {
                        backgroundColor: theme.surfaceSecondary,
                        borderColor: colors.terracotta,
                      },
                    ],
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${labels[t]} type`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Feather
                    name={icons[t]}
                    size={14}
                    color={isSelected ? colors.terracotta : theme.textMuted}
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    style={[
                      styles.typeSelectorLabel,
                      {
                        color: isSelected ? theme.text : theme.textMuted,
                        fontFamily: isSelected
                          ? fontFamilies.sansSemiBold
                          : fontFamilies.sans,
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

        {/* Link URL Field */}
        {type === 'link' && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              WEB LINK (URL) *
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: theme.surface, borderColor: theme.border },
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
                style={[styles.inputField, { color: theme.text, fontFamily: fontFamilies.sans }]}
              />
            </View>
          </View>
        )}

        {/* Image Picker */}
        {type === 'image' && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              IMAGE PHOTO *
            </Text>
            {imageUri ? (
              <View style={[styles.imagePreviewContainer, { borderColor: theme.border }]}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
                <View style={styles.imageActionsOverlay}>
                  <TouchableOpacity
                    onPress={pickFromGallery}
                    style={[styles.imageActionBtn, { backgroundColor: 'rgba(0,0,0,0.75)' }]}
                    accessibilityLabel="Replace photo from gallery"
                  >
                    <Feather name="refresh-cw" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.imageActionText}>Replace</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setImageUri(undefined)}
                    style={[styles.imageActionBtn, { backgroundColor: 'rgba(217,83,79,0.85)' }]}
                    accessibilityLabel="Remove photo"
                  >
                    <Feather name="trash-2" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.imageActionText}>Remove</Text>
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
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Choose from photo gallery"
                >
                  <Feather name="image" size={20} color={colors.terracotta} style={{ marginBottom: 6 }} />
                  <Text style={[styles.pickButtonTitle, { color: theme.text }]}>
                    Choose from Gallery
                  </Text>
                  <Text style={[styles.pickButtonSub, { color: theme.textMuted }]}>
                    Select saved photos
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={takePhoto}
                  style={[
                    styles.pickButton,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Take a photo with camera"
                >
                  <Feather name="camera" size={20} color={colors.terracotta} style={{ marginBottom: 6 }} />
                  <Text style={[styles.pickButtonTitle, { color: theme.text }]}>
                    Take Photo
                  </Text>
                  <Text style={[styles.pickButtonSub, { color: theme.textMuted }]}>
                    Use device camera
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Title Field */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>TITLE</Text>
            {titleHint && (
              <Text style={[styles.derivedHint, { color: colors.terracotta }]}>
                (Auto: &quot;{titleHint}&quot;)
              </Text>
            )}
          </View>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <TextInput
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                setInlineError(null);
              }}
              placeholder={titleHint ? `Leave blank to auto-title as "${titleHint}"` : 'Give it a title...'}
              placeholderTextColor={theme.textMuted}
              style={[
                styles.inputField,
                { color: theme.text, fontFamily: fontFamilies.sansSemiBold },
              ]}
            />
          </View>
        </View>

        {/* Content Field: Note body, Snippet code, or optional note for Link/Image */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            {type === 'note'
              ? 'NOTE BODY *'
              : type === 'snippet'
              ? 'CODE / SNIPPET TEXT *'
              : 'ADDITIONAL NOTES (OPTIONAL)'}
          </Text>
          <View
            style={[
              styles.textAreaWrapper,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
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
                  ? 'Write thoughts, quotes, recipes...'
                  : type === 'snippet'
                  ? 'Paste code, commands, or snippets here...'
                  : 'Add context, thoughts, or reminders...'
              }
              placeholderTextColor={theme.textMuted}
              multiline
              textAlignVertical="top"
              style={[
                styles.textArea,
                {
                  color: theme.text,
                  fontFamily: type === 'snippet' ? fontFamilies.mono : fontFamilies.sans,
                },
              ]}
            />
          </View>
        </View>

        {/* Tags Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>TAGS</Text>
          <TagInput tags={tags} onChangeTags={setTags} suggestions={allTags} />
        </View>

        {/* Footer: Full-width Terracotta Primary Button + Quiet Text Cancel */}
        <View style={styles.footerContainer}>
          <PressableScale
            onPress={handleSave}
            disabled={isSaving}
            haptic="medium"
            style={[
              styles.saveButtonFull,
              {
                backgroundColor: isSaving ? theme.surfaceSecondary : colors.terracotta,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={isEditMode ? 'Save Changes' : 'Drop into Gullak'}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.cream} size="small" />
            ) : (
              <>
                <Feather
                  name={isEditMode ? 'check' : 'arrow-down'}
                  size={17}
                  color={colors.cream}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.saveButtonText, { color: colors.cream }]}>
                  {isEditMode ? 'Save Changes' : 'Drop in'}
                </Text>
              </>
            )}
          </PressableScale>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleCancelPress}
            style={styles.quietCancelBtn}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text style={[styles.quietCancelText, { color: theme.textMuted }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Discard confirmation dialog */}
      <ConfirmDialog
        visible={showDiscardDialog}
        title="Discard changes?"
        message="You have unsaved changes. Discard them?"
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
    paddingBottom: spacing.xxxl * 3,
  },
  coinFlourish: {
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  coinBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.chip,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 11,
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
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    fontStyle: 'italic',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    borderRadius: borderRadius.iconBtn,
    borderWidth: 1,
    padding: 3,
  },
  typeSelectorTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.chip,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 40,
  },
  typeSelectorTabActive: {
    borderWidth: 1,
  },
  typeSelectorLabel: {
    fontSize: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.iconBtn,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    paddingVertical: spacing.sm,
  },
  textAreaWrapper: {
    borderRadius: borderRadius.iconBtn,
    borderWidth: 1,
    padding: spacing.md,
    minHeight: 120,
  },
  textArea: {
    fontSize: 14,
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
    borderRadius: borderRadius.iconBtn,
    borderWidth: 1,
    padding: spacing.lg,
    minHeight: 110,
  },
  pickButtonTitle: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
  },
  pickButtonSub: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    marginTop: 2,
  },
  imagePreviewContainer: {
    width: '100%',
    height: 220,
    borderRadius: borderRadius.iconBtn,
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
    borderRadius: borderRadius.chip,
  },
  imageActionText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  footerContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  saveButtonFull: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.button, // radius 10
    minHeight: 48,
  },
  saveButtonText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    fontWeight: '600',
  },
  quietCancelBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  quietCancelText: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
  },
});
