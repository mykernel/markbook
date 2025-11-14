import axios from 'axios';

const API_BASE_URL = '/api/import';

export interface ImportResult {
  message: string;
  imported: number;
  skipped: number;
  errors: string[];
}

export const importApi = {
  /**
   * 导入浏览器书签 (HTML格式)
   */
  importHTML: async (htmlContent: string): Promise<ImportResult> => {
    const response = await axios.post<ImportResult>(`${API_BASE_URL}/html`, {
      htmlContent,
    });
    return response.data;
  },

  /**
   * 导入JSON格式书签
   */
  importJSON: async (bookmarks: any[]): Promise<ImportResult> => {
    const response = await axios.post<ImportResult>(`${API_BASE_URL}/json`, {
      bookmarks,
    });
    return response.data;
  },
};
