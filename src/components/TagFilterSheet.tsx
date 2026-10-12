import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TagChip } from './TagChip';
import { useTheme } from '../hooks/useTheme';
import { PressableScale } from './primitives/PressableScale';
import { borderRadius, spacing, fontFamilies, colors } from '../theme';

interface TagFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string) => void;
  onClearTag: () => void;
}

export const TagFilterSheet: React.FC<TagFilterSheetProps> = ({
  visible,
  onClose,
  tags,
  selectedTag,
  onSelectTag,
  onClearTag,
}) => {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.backdrop, { backgroundColor: theme.overlay }]}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheetContainer,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <Feather name="sliders" size={18} color={colors.terracotta} style={{ marginRight: 8 }} />
                  <Text style={[styles.title, { color: theme.text }]}>Filter by Tag</Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={[styles.closeBtn, { backgroundColor: theme.surfaceSecondary }]}
                  accessibilityLabel="Close tag filter"
                >
                  <Feather name="x" size={16} color={theme.text} />
                </TouchableOpacity>
              </View>

              {/* Tag Chips Grid */}
              <ScrollView style={styles.tagsScroll} contentContainerStyle={styles.tagsContainer}>
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <TagChip
                      key={tag}
                      label={tag}
                      variant="selectable"
                      isSelected={selectedTag === tag}
                      onPress={() => {
                        onSelectTag(tag);
                        onClose();
                      }}
                      size="md"
                    />
                  ))
                ) : (
                  <Text style={[styles.emptyTagsText, { color: theme.textMuted }]}>
                    No tags created yet. Add tags when saving notes or links!
                  </Text>
                )}
              </ScrollView>

              {/* Actions Footer */}
              {selectedTag && (
                <View style={[styles.footer, { borderTopColor: theme.border }]}>
                  <PressableScale
                    onPress={() => {
                      onClearTag();
                      onClose();
                    }}
                    style={[styles.clearBtn, { borderColor: theme.border }]}
                    accessibilityRole="button"
                    accessibilityLabel="Clear tag filter"
                  >
                    <Text style={[styles.clearBtnText, { color: colors.terracotta }]}>
                      Clear Tag Filter
                    </Text>
                  </PressableScale>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  sheetContainer: {
    borderRadius: borderRadius.card, // radius 20
    borderWidth: 1,
    padding: spacing.xl,
    maxHeight: '65%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: fontFamilies.serif,
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsScroll: {
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  emptyTagsText: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
  clearBtn: {
    borderWidth: 1,
    borderRadius: borderRadius.button,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  clearBtnText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14,
  },
});
