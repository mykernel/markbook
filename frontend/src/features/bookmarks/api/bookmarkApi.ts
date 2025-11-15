import { apiClient } from '@/lib/apiClient';
import type {
  Bookmark,
  ApiResponse,
  PaginatedResponse,
  CreateBookmarkInput,
  UpdateBookmarkInput,
  SearchParams,
  BookmarkSortOption,
  BulkActionInput,
} from '~types';

export const bookmarkApi = {
  getAll: async (
    page: number = 1,
    limit: number = 20,
    sort?: BookmarkSortOption
  ): Promise<PaginatedResponse<Bookmark>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Bookmark>>>(
      '/bookmarks',
      { params: { page, limit, ...(sort ? { sort } : {}) } }
    );
    return response.data.data!;
  },

  getById: async (id: number): Promise<Bookmark> => {
    const response = await apiClient.get<ApiResponse<Bookmark>>(`/bookmarks/${id}`);
    return response.data.data!;
  },

  create: async (data: CreateBookmarkInput): Promise<Bookmark> => {
    const response = await apiClient.post<ApiResponse<Bookmark>>('/bookmarks', data);
    return response.data.data!;
  },

  update: async (id: number, data: UpdateBookmarkInput): Promise<Bookmark> => {
    const response = await apiClient.put<ApiResponse<Bookmark>>(`/bookmarks/${id}`, data);
    return response.data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/bookmarks/${id}`);
  },

  search: async (params: SearchParams): Promise<PaginatedResponse<Bookmark>> => {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.append('query', params.query);
    if (params.tags && params.tags.length > 0) searchParams.append('tags', params.tags.join(','));
    if (params.folderId) searchParams.append('folderId', params.folderId.toString());
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.sort) searchParams.append('sort', params.sort);

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Bookmark>>>(
      `/bookmarks/search?${searchParams.toString()}`
    );
    return response.data.data!;
  },

  trackVisit: async (id: number): Promise<void> => {
    await apiClient.post(`/bookmarks/${id}/visit`);
  },

  bulkAction: async (payload: BulkActionInput): Promise<void> => {
    await apiClient.post('/bookmarks/bulk/actions', payload);
  },
};
