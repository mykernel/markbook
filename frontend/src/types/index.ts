export interface Bookmark {
  id: number;
  title: string;
  url: string;
  description?: string | null;
  favicon?: string | null;
  folderId?: number | null;
  visitCount: number;
  lastVisitedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  tags?: BookmarkTag[];
  folder?: Folder | null;
}

export interface Tag {
  id: number;
  name: string;
  color?: string | null;
  createdAt: string;
  _count?: {
    bookmarks: number;
  };
}

export interface BookmarkTag {
  bookmarkId: number;
  tagId: number;
  tag: Tag;
}

export interface Folder {
  id: number;
  name: string;
  parentId?: number | null;
  createdAt: string;
  updatedAt: string;
  children?: Folder[];
  parent?: Folder | null;
  _count?: {
    bookmarks: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  bookmarks: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
  };
}

export interface CreateBookmarkInput {
  title: string;
  url: string;
  description?: string;
  favicon?: string;
  folderId?: number;
  tags?: string[];
}

export interface UpdateBookmarkInput {
  title?: string;
  url?: string;
  description?: string | null;
  favicon?: string | null;
  folderId?: number | null;
  tags?: string[];
}

export interface SearchParams {
  query?: string;
  tags?: string[];
  folderId?: number;
  page?: number;
  limit?: number;
  sort?: BookmarkSortOption;
}

export type BookmarkSortOption = 'createdAt' | 'visitCount' | 'lastVisitedAt';

export interface BulkActionInput {
  action: 'delete' | 'move' | 'addTags' | 'removeTags';
  bookmarkIds: number[];
  targetFolderId?: number | null;
  tags?: string[];
}

export interface AiSuggestion {
  bookmarkId: number;
  recommendedFolder?: string | null;
  recommendedTags?: string[];
  reason?: string;
}
