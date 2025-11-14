import { apiClient } from '@/lib/apiClient';
import type { Tag, ApiResponse } from '~types';

export const tagApi = {
  getAll: async (): Promise<Tag[]> => {
    const response = await apiClient.get<ApiResponse<Tag[]>>('/tags');
    return response.data.data!;
  },

  getById: async (id: number): Promise<Tag> => {
    const response = await apiClient.get<ApiResponse<Tag>>(`/tags/${id}`);
    return response.data.data!;
  },

  create: async (data: { name: string; color?: string }): Promise<Tag> => {
    const response = await apiClient.post<ApiResponse<Tag>>('/tags', data);
    return response.data.data!;
  },

  update: async (id: number, data: { name?: string; color?: string }): Promise<Tag> => {
    const response = await apiClient.put<ApiResponse<Tag>>(`/tags/${id}`, data);
    return response.data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/tags/${id}`);
  },
};
