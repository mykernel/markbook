import { z } from 'zod';

export const sortOptions = z.enum(['createdAt', 'visitCount', 'lastVisitedAt']);

export const createBookmarkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  url: z.string().url('Invalid URL format'),
  description: z.string().max(1000).optional(),
  favicon: z.string().url().optional(),
  folderId: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateBookmarkSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  url: z.string().url().optional(),
  description: z.string().max(1000).optional().nullable(),
  favicon: z.string().url().optional().nullable(),
  folderId: z.number().int().positive().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export const searchBookmarksSchema = z.object({
  query: z.string().optional(),
  tags: z.array(z.string()).optional(),
  folderId: z.number().int().positive().optional(),
  page: z.number().int().positive().default(1).optional(),
  limit: z.number().int().positive().max(100).default(20).optional(),
  sort: sortOptions.optional(),
});

export const bulkActionSchema = z.object({
  action: z.enum(['delete', 'move', 'addTags', 'removeTags']),
  bookmarkIds: z.array(z.number().int().positive()).min(1),
  targetFolderId: z.number().int().positive().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;
export type UpdateBookmarkInput = z.infer<typeof updateBookmarkSchema>;
export type SearchBookmarksInput = z.infer<typeof searchBookmarksSchema>;
export type BulkActionInput = z.infer<typeof bulkActionSchema>;
export type SortOption = z.infer<typeof sortOptions>;
