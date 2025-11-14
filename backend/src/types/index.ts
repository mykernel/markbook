import { Request, Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams extends PaginationParams {
  query?: string;
  tags?: string[];
  folderId?: number;
}

export type AsyncRequestHandler = (
  req: Request,
  res: Response
) => Promise<void>;
