import { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '../types';

export abstract class BaseController {
  protected asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  protected handleSuccess<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
    };
    res.status(statusCode).json(response);
  }

  protected handleError(
    error: unknown,
    res: Response,
    context: string,
    statusCode: number = 500
  ): void {
    console.error(`[${context}] Error:`, error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    const response: ApiResponse = {
      success: false,
      error: errorMessage,
    };

    res.status(statusCode).json(response);
  }

  protected handleNotFound(res: Response, resource: string): void {
    const response: ApiResponse = {
      success: false,
      error: `${resource} not found`,
    };
    res.status(404).json(response);
  }

  protected handleBadRequest(res: Response, message: string): void {
    const response: ApiResponse = {
      success: false,
      error: message,
    };
    res.status(400).json(response);
  }
}
