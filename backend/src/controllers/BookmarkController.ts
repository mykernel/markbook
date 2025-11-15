import { Request, Response } from 'express';
import { BaseController } from '../utils/BaseController';
import { BookmarkService } from '../services/bookmarkService';
import {
  createBookmarkSchema,
  updateBookmarkSchema,
  searchBookmarksSchema,
  bulkActionSchema,
  sortOptions,
} from '../validators/bookmarkValidator';
import { z } from 'zod';

export class BookmarkController extends BaseController {
  constructor(private bookmarkService: BookmarkService) {
    super();
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const sort = req.query.sort ? sortOptions.parse(req.query.sort) : undefined;

      const result = await this.bookmarkService.getAllBookmarks(page, limit, sort);
      this.handleSuccess(res, result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.handleBadRequest(res, error.errors.map(e => e.message).join(', '));
      } else {
        this.handleError(error, res, 'BookmarkController.getAll');
      }
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        this.handleBadRequest(res, 'Invalid bookmark ID');
        return;
      }

      const bookmark = await this.bookmarkService.getBookmarkById(id);
      this.handleSuccess(res, bookmark);
    } catch (error) {
      if (error instanceof Error && error.message === 'Bookmark not found') {
        this.handleNotFound(res, 'Bookmark');
      } else {
        this.handleError(error, res, 'BookmarkController.getById');
      }
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validated = createBookmarkSchema.parse(req.body);
      const bookmark = await this.bookmarkService.createBookmark(validated);
      this.handleSuccess(res, bookmark, 'Bookmark created successfully', 201);
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.handleBadRequest(res, error.errors.map(e => e.message).join(', '));
      } else {
        this.handleError(error, res, 'BookmarkController.create');
      }
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        this.handleBadRequest(res, 'Invalid bookmark ID');
        return;
      }

      const validated = updateBookmarkSchema.parse(req.body);
      const bookmark = await this.bookmarkService.updateBookmark(id, validated);
      this.handleSuccess(res, bookmark, 'Bookmark updated successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.handleBadRequest(res, error.errors.map(e => e.message).join(', '));
      } else if (error instanceof Error && error.message === 'Bookmark not found') {
        this.handleNotFound(res, 'Bookmark');
      } else {
        this.handleError(error, res, 'BookmarkController.update');
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        this.handleBadRequest(res, 'Invalid bookmark ID');
        return;
      }

      await this.bookmarkService.deleteBookmark(id);
      this.handleSuccess(res, null, 'Bookmark deleted successfully');
    } catch (error) {
      if (error instanceof Error && error.message === 'Bookmark not found') {
        this.handleNotFound(res, 'Bookmark');
      } else {
        this.handleError(error, res, 'BookmarkController.delete');
      }
    }
  }

  async search(req: Request, res: Response): Promise<void> {
    try {
      const validated = searchBookmarksSchema.parse({
        query: req.query.query,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        folderId: req.query.folderId ? parseInt(req.query.folderId as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sort: req.query.sort ? sortOptions.parse(req.query.sort) : undefined,
      });

      const result = await this.bookmarkService.searchBookmarks(validated);
      this.handleSuccess(res, result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.handleBadRequest(res, error.errors.map(e => e.message).join(', '));
      } else {
        this.handleError(error, res, 'BookmarkController.search');
      }
    }
  }

  async recordVisit(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        this.handleBadRequest(res, 'Invalid bookmark ID');
        return;
      }

      await this.bookmarkService.recordVisit(id);
      this.handleSuccess(res, null, 'Visit recorded');
    } catch (error) {
      if (error instanceof Error && error.message === 'Bookmark not found') {
        this.handleNotFound(res, 'Bookmark');
      } else {
        this.handleError(error, res, 'BookmarkController.recordVisit');
      }
    }
  }

  async bulk(req: Request, res: Response): Promise<void> {
    try {
      const validated = bulkActionSchema.parse(req.body);
      await this.bookmarkService.bulkAction(validated);
      this.handleSuccess(res, null, 'Bulk action completed');
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.handleBadRequest(res, error.errors.map(e => e.message).join(', '));
      } else {
        this.handleError(error, res, 'BookmarkController.bulk');
      }
    }
  }
}
