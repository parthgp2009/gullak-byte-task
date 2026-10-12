import React, { useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Item, ItemFilterType, TabType } from '../src/types';
import { useItems } from '../src/hooks/useItems';
import { useTheme } from '../src/hooks/useTheme';
import { ItemCard } from '../src/components/ItemCard';
import { TypeChip } from '../src/components/TypeChip';
import { SearchBar } from '../src/components/SearchBar';
import { EmptyState } from '../src/components/EmptyState';
import { ConfirmDialog } from '../src/components/ConfirmDialog';
import { SegmentedControl } from '../src/components/SegmentedControl';
import { IconButton } from '../src/components/primitives/IconButton';
import { FloatingDropInButton } from '../src/components/FloatingDropInButton';
import { SettingsSheet } from '../src/components/SettingsSheet';
import { TagFilterSheet } from '../src/components/TagFilterSheet';
import { filterItemsBySearch } from '../src/utils/search';
import { borderRadius, spacing, fontFamilies, colors, shadows } from '../src/theme';

export default function InboxScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { items, isLoading, deleteItem, archiveItem, restoreItem, allTags } = useItems();

  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ItemFilterType | 'snippet'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Sheets and Modals
  const [showSettings, setShowSettings] = useState(false);
  const [showTagFilterSheet, setShowTagFilterSheet] = useState(false);
  const [menuItem, setMenuItem] = useState<Item | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    // 1. Tab filter (Active vs Archived)
    let result = items.filter((item) =>
      activeTab === 'active' ? !item.archived : item.archived
    );

    // 2. Type filter
    if (typeFilter !== 'all') {
      result = result.filter((item) => item.type === typeFilter);
    }

    // 3. Tag filter
    if (selectedTag) {
      result = result.filter(
        (item) => item.tags && item.tags.includes(selectedTag.toLowerCase())
      );
    }

    // 4. Search query
    if (searchQuery.trim()) {
      result = filterItemsBySearch(result, searchQuery);
    }

    // 5. Sorted by updatedAt desc
    result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return result;
  }, [items, activeTab, typeFilter, selectedTag, searchQuery]);

  const handleAction = async (action: 'archive' | 'restore' | 'delete' | 'edit') => {
    if (!menuItem) return;
    const target = menuItem;
    setMenuItem(null);

    if (action === 'edit') {
      router.push(`/item/edit/${target.id}`);
    } else if (action === 'archive') {
      await archiveItem(target.id);
    } else if (action === 'restore') {
      await restoreItem(target.id);
    } else if (action === 'delete') {
      setItemToDelete(target);
    }
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* 1. Header Row matching mockup: Wordmark + Terracotta dot + 2 Icon Buttons */}
      <View style={styles.header}>
        <View style={styles.wordmarkGroup}>
          <Text style={[styles.wordmark, { color: theme.text }]}>Gullak</Text>
          <View style={[styles.wordmarkDot, { backgroundColor: colors.terracotta }]} />
        </View>

        <View style={styles.headerRightActions}>
          {/* Archive Toggle Button */}
          <IconButton
            icon="archive"
            accessibilityLabel="View archived items"
            active={activeTab === 'archived'}
            onPress={() => setActiveTab((prev) => (prev === 'active' ? 'archived' : 'active'))}
            style={{ marginRight: spacing.sm }}
          />

          {/* Settings Button */}
          <IconButton
            icon="settings"
            accessibilityLabel="Open settings"
            onPress={() => setShowSettings(true)}
          />
        </View>
      </View>

      {/* 2. Segmented Control */}
      <View style={styles.segmentedContainer}>
        <SegmentedControl activeTab={activeTab} onChangeTab={setActiveTab} />
      </View>

      {/* 3. Search Bar with Filter Sliders Icon */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilterPress={() => setShowTagFilterSheet(true)}
          isFilterActive={selectedTag !== null}
        />
      </View>

      {/* 4. Filter Chips Row running off right edge */}
      <View style={styles.filterChipsRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsScroll}
        >
          {(['all', 'note', 'link', 'image', 'snippet'] as const).map((t) => (
            <TypeChip
              key={t}
              type={t}
              isSelected={typeFilter === t}
              onPress={() => setTypeFilter(t)}
            />
          ))}
        </ScrollView>
      </View>

      {/* 5. Content Area: Empty State or Cards List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.terracotta} />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            filteredItems.length === 0 && styles.listEmptyContent,
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              onPress={() => router.push(`/item/${item.id}`)}
              onLongPress={() => setMenuItem(item)}
              onOptionsPress={() => setMenuItem(item)}
              onSwipeArchive={() => {
                if (item.archived) {
                  restoreItem(item.id);
                } else {
                  archiveItem(item.id);
                }
              }}
              onSwipeDelete={() => setItemToDelete(item)}
            />
          )}
          ListEmptyComponent={() => {
            if (searchQuery.trim().length > 0 || typeFilter !== 'all' || selectedTag !== null) {
              return (
                <EmptyState
                  type="search"
                  onActionPress={() => {
                    setSearchQuery('');
                    setTypeFilter('all');
                    setSelectedTag(null);
                  }}
                  actionLabel="Clear filters"
                />
              );
            }
            if (activeTab === 'archived') {
              return <EmptyState type="archive" />;
            }
            return (
              <EmptyState
                type="inbox"
                onActionPress={() => router.push('/item/new')}
                actionLabel="+ Drop in your first find"
              />
            );
          }}
        />
      )}

      {/* 6. Floating Action Button: "Drop in" */}
      <FloatingDropInButton onPress={() => router.push('/item/new')} />

      {/* Settings Bottom Sheet */}
      <SettingsSheet visible={showSettings} onClose={() => setShowSettings(false)} />

      {/* Tag Filter Bottom Sheet */}
      <TagFilterSheet
        visible={showTagFilterSheet}
        onClose={() => setShowTagFilterSheet(false)}
        tags={allTags}
        selectedTag={selectedTag}
        onSelectTag={(tag) => setSelectedTag(tag)}
        onClearTag={() => setSelectedTag(null)}
      />

      {/* Card Quick Action Modal */}
      <Modal
        visible={menuItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuItem(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setMenuItem(null)}
          style={[styles.menuBackdrop, { backgroundColor: theme.overlay }]}
        >
          <View
            style={[
              styles.menuContainer,
              shadows.modal,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={styles.menuHeader}>
              <Text numberOfLines={1} style={[styles.menuItemTitle, { color: theme.text }]}>
                {menuItem?.title}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleAction('edit')}
              style={styles.menuItem}
              accessibilityRole="button"
              accessibilityLabel="Edit item"
            >
              <Feather name="edit-2" size={17} color={theme.text} style={styles.menuIcon} />
              <Text style={[styles.menuLabel, { color: theme.text }]}>Edit Item</Text>
            </TouchableOpacity>

            {menuItem?.archived ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleAction('restore')}
                style={styles.menuItem}
                accessibilityRole="button"
                accessibilityLabel="Restore to inbox"
              >
                <Feather name="inbox" size={17} color={colors.terracotta} style={styles.menuIcon} />
                <Text style={[styles.menuLabel, { color: colors.terracotta }]}>
                  Restore to Inbox
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleAction('archive')}
                style={styles.menuItem}
                accessibilityRole="button"
                accessibilityLabel="Archive item"
              >
                <Feather name="archive" size={17} color={theme.textSecondary} style={styles.menuIcon} />
                <Text style={[styles.menuLabel, { color: theme.textSecondary }]}>Archive</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleAction('delete')}
              style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: theme.border }]}
              accessibilityRole="button"
              accessibilityLabel="Delete item"
            >
              <Feather name="trash-2" size={17} color={theme.danger} style={styles.menuIcon} />
              <Text style={[styles.menuLabel, { color: theme.danger, fontWeight: '600' }]}>
                Delete Item
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={itemToDelete !== null}
        title="Delete item?"
        message={`Are you sure you want to permanently delete "${itemToDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Keep"
        isDestructive
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  wordmarkGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordmark: {
    fontFamily: fontFamilies.serif,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  wordmarkDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginLeft: 3,
    marginBottom: 4,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segmentedContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filterChipsRow: {
    marginBottom: spacing.sm,
  },
  filterChipsScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxxl * 4,
  },
  listEmptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  menuBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  menuContainer: {
    borderRadius: borderRadius.card,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  menuHeader: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: spacing.xs,
  },
  menuItemTitle: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    minHeight: 46,
  },
  menuIcon: {
    marginRight: spacing.md,
  },
  menuLabel: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
  },
});
