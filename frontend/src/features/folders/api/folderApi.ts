import { apiClient } from '@/lib/apiClient';
import type { Folder, ApiResponse } from '~types';

export const folderApi = {
  getAll: async (): Promise<Folder[]> => {
    const response = await apiClient.get<ApiResponse<Folder[]>>('/folders');
    return response.data.data!;
  },

  getRoots: async (): Promise<Folder[]> => {
    const response = await apiClient.get<ApiResponse<Folder[]>>('/folders/roots');
    return response.data.data!;
  },

  getById: async (id: number): Promise<Folder> => {
    const response = await apiClient.get<ApiResponse<Folder>>(`/folders/${id}`);
    return response.data.data!;
  },

  create: async (data: { name: string; parentId?: number }): Promise<Folder> => {
    const response = await apiClient.post<ApiResponse<Folder>>('/folders', data);
    return response.data.data!;
  },

  update: async (id: number, data: { name?: string; parentId?: number | null }): Promise<Folder> => {
    const response = await apiClient.put<ApiResponse<Folder>>(`/folders/${id}`, data);
    return response.data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/folders/${id}`);
  },
};
