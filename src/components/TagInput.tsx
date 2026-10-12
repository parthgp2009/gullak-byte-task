import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TagChip } from './TagChip';
import { normalizeTags } from '../utils/normalizeTags';
import { useTheme } from '../hooks/useTheme';
import { borderRadius, spacing, typography, colors } from '../theme';

interface TagInputProps {
  tags: string[];
  onChangeTags: (tags: string[]) => void;
  suggestions?: string[];
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChangeTags,
  suggestions = [],
}) => {
  const { theme } = useTheme();
  const [inputText, setInputText] = useState('');

  const addTag = (raw: string) => {
    const cleaned = normalizeTags(raw);
    if (cleaned.length === 0) return;

    const merged = Array.from(new Set([...tags, ...cleaned]));
    onChangeTags(merged);
    setInputText('');
  };

  const removeTag = (tagToRemove: string) => {
    onChangeTags(tags.filter((t) => t !== tagToRemove));
  };

  // Filter out suggestions that are already selected
  const availableSuggestions = suggestions.filter(
    (s) => !tags.includes(s.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Active tag chips */}
      {tags.length > 0 && (
        <View style={styles.tagWrap}>
          {tags.map((tag) => (
            <TagChip
              key={tag}
              label={tag}
              variant="removable"
              onRemove={() => removeTag(tag)}
            />
          ))}
        </View>
      )}

      {/* Input row */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.surfaceSecondary,
            borderColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.hashPrefix, { color: colors.marigoldDark }]}>#</Text>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => addTag(inputText)}
          placeholder={tags.length === 0 ? 'Add tags (e.g. recipe, travel)...' : 'Add another tag...'}
          placeholderTextColor={theme.textMuted}
          style={[styles.input, typography.body, { color: theme.text }]}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          blurOnSubmit={false}
        />
        {inputText.trim().length > 0 && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => addTag(inputText)}
            style={[styles.addButton, { backgroundColor: colors.terracotta }]}
            accessibilityRole="button"
            accessibilityLabel="Add tag"
          >
            <Feather name="plus" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions row */}
      {availableSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={[styles.suggestionTitle, typography.caption, { color: theme.textMuted }]}>
            SUGGESTIONS:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionScroll}
          >
            {availableSuggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion}
                onPress={() => addTag(suggestion)}
                style={[
                  styles.suggestionChip,
                  {
                    backgroundColor: theme.surfaceSecondary,
                    borderColor: theme.borderSubtle,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Add suggested tag ${suggestion}`}
              >
                <Feather name="plus" size={11} color={colors.marigoldDark} style={{ marginRight: 2 }} />
                <Text style={[typography.caption, { color: theme.textSecondary }]}>
                  {suggestion}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    minHeight: 46,
  },
  hashPrefix: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  suggestionsContainer: {
    marginTop: spacing.sm,
  },
  suggestionTitle: {
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  suggestionScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs - 2,
    marginRight: spacing.sm,
  },
});
