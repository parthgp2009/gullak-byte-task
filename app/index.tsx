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
import { TagChip } from '../src/components/TagChip';
import { SearchBar } from '../src/components/SearchBar';
import { EmptyState } from '../src/components/EmptyState';
import { ConfirmDialog } from '../src/components/ConfirmDialog';
import { filterItemsBySearch } from '../src/utils/search';
import { borderRadius, spacing, typography, colors, shadows } from '../src/theme';

export default function InboxScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { items, isLoading, deleteItem, archiveItem, restoreItem, allTags } = useItems();

  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ItemFilterType>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Selected item for long-press / action menu
  const [menuItem, setMenuItem] = useState<Item | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    // 1. Filter by Active vs Archived
    let result = items.filter((item) =>
      activeTab === 'active' ? !item.archived : item.archived
    );

    // 2. Filter by Type
    if (typeFilter !== 'all') {
      result = result.filter((item) => item.type === typeFilter);
    }

    // 3. Filter by Selected Tag
    if (selectedTag) {
      result = result.filter(
        (item) => item.tags && item.tags.includes(selectedTag.toLowerCase())
      );
    }

    // 4. Filter by Search Query
    if (searchQuery.trim()) {
      result = filterItemsBySearch(result, searchQuery);
    }

    // 5. Sort by updatedAt descending
    result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return result;
  }, [items, activeTab, typeFilter, selectedTag, searchQuery]);

  const toggleTagFilter = (tag: string) => {
    setSelectedTag((prev) => (prev === tag ? null : tag));
  };

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
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Text style={[styles.appTitle, typography.display, { color: colors.terracotta }]}>
            Gullak
          </Text>
          <View style={[styles.coinDot, { backgroundColor: colors.marigold }]} />
        </View>

        <View style={styles.headerRightActions}>
          {/* Light / Dark Mode Toggle */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={toggleTheme}
            style={[
              styles.iconBtn,
              { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            <Feather
              name={isDark ? 'sun' : 'moon'}
              size={18}
              color={isDark ? colors.marigold : colors.terracotta}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Segmented Control: Active | Archived */}
      <View style={styles.tabBarContainer}>
        <View
          style={[
            styles.segmentedControl,
            { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('active')}
            style={[
              styles.segmentTab,
              activeTab === 'active' && [
                styles.segmentTabActive,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ],
            ]}
            accessibilityRole="tab"
            accessibilityLabel="Active items tab"
            accessibilityState={{ selected: activeTab === 'active' }}
          >
            <Feather
              name="inbox"
              size={15}
              color={activeTab === 'active' ? colors.terracotta : theme.textMuted}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                typography.subtext,
                {
                  color: activeTab === 'active' ? theme.text : theme.textMuted,
                  fontWeight: activeTab === 'active' ? '700' : '500',
                },
              ]}
            >
              Active
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('archived')}
            style={[
              styles.segmentTab,
              activeTab === 'archived' && [
                styles.segmentTabActive,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ],
            ]}
            accessibilityRole="tab"
            accessibilityLabel="Archived items tab"
            accessibilityState={{ selected: activeTab === 'archived' }}
          >
            <Feather
              name="archive"
              size={15}
              color={activeTab === 'archived' ? colors.terracotta : theme.textMuted}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                typography.subtext,
                {
                  color: activeTab === 'archived' ? theme.text : theme.textMuted,
                  fontWeight: activeTab === 'archived' ? '700' : '500',
                },
              ]}
            >
              Archived
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      {/* Filter Row: Type Chips */}
      <View style={styles.filterTypesRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTypesScroll}
        >
          {(['all', 'note', 'link', 'image'] as ItemFilterType[]).map((t) => (
            <TypeChip
              key={t}
              type={t}
              isSelected={typeFilter === t}
              onPress={() => setTypeFilter(t)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Filter Row: Tags */}
      {allTags.length > 0 && (
        <View style={styles.filterTagsRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterTagsScroll}
          >
            {allTags.map((tag) => (
              <TagChip
                key={tag}
                label={tag}
                variant="selectable"
                isSelected={selectedTag === tag}
                onPress={() => toggleTagFilter(tag)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Main Content List / Loading / Empty States */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.terracotta} />
          <Text style={[styles.loadingText, typography.subtext, { color: theme.textSecondary }]}>
            Opening your Gullak...
          </Text>
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
                  actionLabel="Clear all filters"
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
                actionLabel="Drop in your first find"
              />
            );
          }}
        />
      )}

      {/* Floating Action Button: "Drop in" */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => router.push('/item/new')}
        style={[styles.fab, shadows.fab, { backgroundColor: colors.terracotta }]}
        accessibilityRole="button"
        accessibilityLabel="Drop in"
        accessibilityHint="Opens screen to save a new note, link, or image"
      >
        <Feather name="plus" size={22} color="#FFFFFF" style={{ marginRight: 6 }} />
        <Text style={[styles.fabLabel, typography.button]}>Drop in</Text>
      </TouchableOpacity>

      {/* Quick Action Modal for Card */}
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
              <Text
                numberOfLines={1}
                style={[typography.h3, { color: theme.text, flex: 1 }]}
              >
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
              <Feather name="edit-2" size={18} color={theme.text} style={styles.menuIcon} />
              <Text style={[typography.body, { color: theme.text }]}>Edit Item</Text>
            </TouchableOpacity>

            {menuItem?.archived ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleAction('restore')}
                style={styles.menuItem}
                accessibilityRole="button"
                accessibilityLabel="Restore item to inbox"
              >
                <Feather name="inbox" size={18} color={colors.marigoldDark} style={styles.menuIcon} />
                <Text style={[typography.body, { color: colors.marigoldDark }]}>Restore to Inbox</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleAction('archive')}
                style={styles.menuItem}
                accessibilityRole="button"
                accessibilityLabel="Archive item"
              >
                <Feather name="archive" size={18} color={theme.textSecondary} style={styles.menuIcon} />
                <Text style={[typography.body, { color: theme.textSecondary }]}>Archive</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleAction('delete')}
              style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: theme.border }]}
              accessibilityRole="button"
              accessibilityLabel="Delete item"
            >
              <Feather name="trash-2" size={18} color={theme.danger} style={styles.menuIcon} />
              <Text style={[typography.body, { color: theme.danger, fontWeight: '600' }]}>
                Delete Item
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Delete Confirmation Modal */}
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  appTitle: {
    letterSpacing: -0.5,
  },
  coinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
    marginBottom: 4,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: 3,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 38,
  },
  segmentTabActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  filterTypesRow: {
    marginBottom: spacing.xs,
  },
  filterTypesScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 2,
  },
  filterTagsRow: {
    marginBottom: spacing.xs,
  },
  filterTagsScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxxl * 3,
  },
  listEmptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.pill,
    minHeight: 52,
  },
  fabLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  menuBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  menuContainer: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    marginBottom: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    minHeight: 48,
  },
  menuIcon: {
    marginRight: spacing.md,
  },
});
