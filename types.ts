
export interface Folder {
  id: string;
  name: string;
  icon: string;
  count: number;
  color?: string;
  parentId?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string;
  folderId: string;
  tags: string[]; // tag names
  createdAt: string; // Display string
  createdAtTimestamp: number; // For sorting
  favicon?: string;
  visitCount: number; // For "Frequently Visited"
  lastVisited: number; // Timestamp for "Recently Visited"
  content?: string; // Markdown content
}

export type ViewMode = 'grid' | 'list';

export type SortOption = 'created' | 'frequent' | 'recent';

export type SortOrder = 'asc' | 'desc';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}
