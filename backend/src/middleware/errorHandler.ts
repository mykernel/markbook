import { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '../types';

export const asyncWrapper = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Unhandled error:', err);

  const response: ApiResponse = {
    success: false,
    error: err.message || 'Internal server error',
  };

  res.status(500).json(response);
};
