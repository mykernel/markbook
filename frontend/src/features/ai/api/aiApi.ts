import { apiClient } from '@/lib/apiClient';
import type { AiSuggestion, ApiResponse } from '~types';

export const aiApi = {
  organize: async (bookmarkIds: number[], profile?: string): Promise<AiSuggestion[]> => {
    const response = await apiClient.post<ApiResponse<{ suggestions: AiSuggestion[] }>>(
      '/ai/organize',
      { bookmarkIds, profile }
    );
    return response.data.data?.suggestions ?? [];
  },
};
