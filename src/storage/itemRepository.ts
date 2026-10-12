import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system/legacy';
import { Item } from '../types';

export const STORAGE_KEY = 'gullak:items:v1';

// Base directory for permanently saved images in the app's document directory
const IMAGES_DIR = `${FileSystem.documentDirectory || ''}gullak_images/`;

/**
 * Ensures the persistent images folder exists in the app's document directory.
 */
async function ensureImagesDirectory(): Promise<void> {
  try {
    if (!FileSystem.documentDirectory) return;
    const dirInfo = await FileSystem.getInfoAsync(IMAGES_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
    }
  } catch (error) {
    console.warn('Error creating images directory:', error);
  }
}

/**
 * Copies a picked image from camera/gallery into the app's document directory
 * so it survives app restarts and system cache clearing.
 * Returns the permanent local file URI.
 */
export async function saveImagePermanently(sourceUri: string): Promise<string> {
  try {
    if (!sourceUri) return '';
    // If the image is already in our permanent folder, no need to copy again
    if (sourceUri.startsWith(IMAGES_DIR)) {
      return sourceUri;
    }

    await ensureImagesDirectory();

    // Determine extension, default to .jpg
    const match = sourceUri.match(/\.([a-zA-Z0-9]+)(\?.*)?$/);
    const extension = match ? `.${match[1].toLowerCase()}` : '.jpg';
    const filename = `gullak_${Crypto.randomUUID()}${extension}`;
    const destinationUri = `${IMAGES_DIR}${filename}`;

    await FileSystem.copyAsync({
      from: sourceUri,
      to: destinationUri,
    });

    return destinationUri;
  } catch (error) {
    console.warn('Failed to copy image to document directory, fallback to source URI:', error);
    return sourceUri;
  }
}

/**
 * Deletes a persistent image file from disk if it exists.
 */
export async function deleteImageFile(fileUri?: string): Promise<void> {
  if (!fileUri) return;
  try {
    const info = await FileSystem.getInfoAsync(fileUri);
    if (info.exists) {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }
  } catch (error) {
    console.warn('Failed to delete image file from filesystem:', error);
  }
}

/**
 * Checks whether an image file actually exists on the filesystem.
 */
export async function checkImageExists(fileUri?: string): Promise<boolean> {
  if (!fileUri) return false;
  try {
    const info = await FileSystem.getInfoAsync(fileUri);
    return info.exists;
  } catch {
    return false;
  }
}

/**
 * Repository for managing Items with AsyncStorage persistence.
 */
export const itemRepository = {
  /**
   * Retrieves all items from AsyncStorage.
   * Gracefully returns [] on empty or corrupt data.
   */
  async getAll(): Promise<Item[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (!json) {
        return [];
      }
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) {
        console.warn('Corrupt data in AsyncStorage, resetting to []');
        return [];
      }
      return parsed;
    } catch (error) {
      console.warn('Failed to load items from AsyncStorage:', error);
      return [];
    }
  },

  /**
   * Retrieves a single item by id.
   */
  async getById(id: string): Promise<Item | null> {
    try {
      const items = await this.getAll();
      return items.find((item) => item.id === id) || null;
    } catch (error) {
      console.warn(`Failed to get item ${id}:`, error);
      return null;
    }
  },

  /**
   * Creates and stores a new item.
   */
  async create(data: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> {
    try {
      const items = await this.getAll();
      const now = new Date().toISOString();

      let persistentImageUri = data.imageUri;
      if (data.type === 'image' && data.imageUri) {
        persistentImageUri = await saveImagePermanently(data.imageUri);
      }

      const newItem: Item = {
        id: Crypto.randomUUID(),
        type: data.type,
        title: data.title,
        content: data.content,
        url: data.url,
        imageUri: persistentImageUri,
        tags: data.tags,
        createdAt: now,
        updatedAt: now,
        archived: Boolean(data.archived),
      };

      const updatedList = [newItem, ...items];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      return newItem;
    } catch (error) {
      console.error('Failed to create item in repository:', error);
      throw error;
    }
  },

  /**
   * Updates an existing item by ID.
   */
  async update(id: string, updates: Partial<Omit<Item, 'id' | 'createdAt'>>): Promise<Item> {
    try {
      const items = await this.getAll();
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new Error(`Item with id ${id} not found`);
      }

      const existing = items[index];
      let newImageUri = updates.imageUri !== undefined ? updates.imageUri : existing.imageUri;

      // If image changed, clean up previous file and copy new one permanently
      if (updates.imageUri && updates.imageUri !== existing.imageUri) {
        if (existing.imageUri) {
          await deleteImageFile(existing.imageUri);
        }
        newImageUri = await saveImagePermanently(updates.imageUri);
      } else if (updates.imageUri === '' && existing.imageUri) {
        await deleteImageFile(existing.imageUri);
        newImageUri = undefined;
      }

      const updatedItem: Item = {
        ...existing,
        ...updates,
        imageUri: newImageUri,
        updatedAt: new Date().toISOString(),
      };

      items[index] = updatedItem;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      return updatedItem;
    } catch (error) {
      console.error(`Failed to update item ${id}:`, error);
      throw error;
    }
  },

  /**
   * Permanently removes an item and deletes its associated copied image file.
   */
  async remove(id: string): Promise<boolean> {
    try {
      const items = await this.getAll();
      const itemToDelete = items.find((item) => item.id === id);
      if (!itemToDelete) {
        return false;
      }

      // Delete image file if present
      if (itemToDelete.imageUri) {
        await deleteImageFile(itemToDelete.imageUri);
      }

      const filtered = items.filter((item) => item.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error(`Failed to remove item ${id}:`, error);
      throw error;
    }
  },

  /**
   * Archives an item.
   */
  async archive(id: string): Promise<Item> {
    return this.update(id, { archived: true });
  },

  /**
   * Restores an archived item back to active.
   */
  async restore(id: string): Promise<Item> {
    return this.update(id, { archived: false });
  },
};
