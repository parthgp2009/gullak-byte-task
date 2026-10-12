import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { borderRadius, spacing, fontFamilies, colors } from '../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  isFilterActive?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search notes, links, #tags...',
  onFilterPress,
  isFilterActive = false,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      {/* Leading Search Icon */}
      <Feather name="search" size={17} color={theme.textSecondary} style={styles.searchIcon} />

      {/* Input Field */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        style={[
          styles.input,
          {
            color: theme.text,
            fontFamily: fontFamilies.sans,
          },
        ]}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityRole="search"
        accessibilityLabel="Search input"
      />

      {/* Clear Button if text present */}
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.clearButton}
          accessibilityRole="button"
          accessibilityLabel="Clear search text"
        >
          <Feather name="x" size={15} color={theme.textMuted} />
        </TouchableOpacity>
      )}

      {/* Trailing Vertical Divider & Filter (Sliders) Button as in Mockup */}
      {onFilterPress && (
        <>
          <View style={[styles.verticalDivider, { backgroundColor: theme.border }]} />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onFilterPress}
            style={[
              styles.filterButton,
              isFilterActive && { backgroundColor: 'rgba(200, 101, 74, 0.15)' },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Filter by tags"
          >
            <Feather
              name="sliders"
              size={17}
              color={isFilterActive ? colors.terracotta : theme.textSecondary}
            />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.iconBtn, // radius 12
    borderWidth: 1,
    paddingLeft: spacing.md,
    paddingRight: 4,
    minHeight: 46,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: spacing.xs,
  },
  clearButton: {
    padding: spacing.xs,
    marginRight: 4,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 4,
  },
  filterButton: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
