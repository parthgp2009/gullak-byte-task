export type ItemType = 'note' | 'link' | 'image' | 'snippet';

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  content: string; // note body, or optional description for link/image
  url?: string; // for links
  imageUri?: string; // for images
  tags: string[]; // lowercase, trimmed, unique
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  archived: boolean;
}

export type ItemFilterType = 'all' | ItemType;

export type TabType = 'active' | 'archived';
