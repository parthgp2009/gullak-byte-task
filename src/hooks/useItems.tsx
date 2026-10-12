import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Item } from '../types';
import { itemRepository } from '../storage/itemRepository';

interface ItemsContextType {
  items: Item[];
  isLoading: boolean;
  error: string | null;
  refreshItems: () => Promise<void>;
  addItem: (data: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Item>;
  updateItem: (id: string, updates: Partial<Omit<Item, 'id' | 'createdAt'>>) => Promise<Item>;
  deleteItem: (id: string) => Promise<boolean>;
  archiveItem: (id: string) => Promise<Item>;
  restoreItem: (id: string) => Promise<Item>;
  getItemById: (id: string) => Item | undefined;
  allTags: string[];
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export const ItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const stored = await itemRepository.getAll();
      setItems(stored);
    } catch (err) {
      console.error('Error loading items from storage:', err);
      setError('Could not load your items. Please restart Gullak.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const addItem = useCallback(
    async (data: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> => {
      try {
        setError(null);
        const created = await itemRepository.create(data);
        setItems((prev) => [created, ...prev]);
        return created;
      } catch (err) {
        console.error('Error adding item:', err);
        setError('Failed to save item. Please try again.');
        throw err;
      }
    },
    []
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<Omit<Item, 'id' | 'createdAt'>>): Promise<Item> => {
      try {
        setError(null);
        const updated = await itemRepository.update(id, updates);
        setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
        return updated;
      } catch (err) {
        console.error('Error updating item:', err);
        setError('Failed to update item.');
        throw err;
      }
    },
    []
  );

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await itemRepository.remove(id);
      if (success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
      return success;
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to delete item.');
      throw err;
      return false;
    }
  }, []);

  const archiveItem = useCallback(
    async (id: string): Promise<Item> => {
      return updateItem(id, { archived: true });
    },
    [updateItem]
  );

  const restoreItem = useCallback(
    async (id: string): Promise<Item> => {
      return updateItem(id, { archived: false });
    },
    [updateItem]
  );

  const getItemById = useCallback(
    (id: string): Item | undefined => {
      return items.find((item) => item.id === id);
    },
    [items]
  );

  // Derive unique, sorted tags across all items
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach((item) => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach((tag) => {
          if (tag && tag.trim()) {
            tagSet.add(tag.trim().toLowerCase());
          }
        });
      }
    });
    return Array.from(tagSet).sort();
  }, [items]);

  return (
    <ItemsContext.Provider
      value={{
        items,
        isLoading,
        error,
        refreshItems: loadItems,
        addItem,
        updateItem,
        deleteItem,
        archiveItem,
        restoreItem,
        getItemById,
        allTags,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
};

export const useItems = (): ItemsContextType => {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
};
