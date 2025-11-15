import { Request, Response } from 'express';
import { BaseController } from '../utils/BaseController';
import { TagService } from '../services/tagService';
import { createTagSchema, updateTagSchema } from '../validators/tagValidator';
import { z } from 'zod';

export class TagController extends BaseController {
  constructor(private tagService: TagService) {
    super();
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const tags = await this.tagService.getAllTags();
      this.handleSuccess(res, tags);
    } catch (error) {
      this.handleError(error, res, 'TagController.getAll');
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        this.handleBadRequest(res, 'Invalid tag ID');
        return;
      }

      const tag = await this.tagService.getTagById(id);
      this.handleSuccess(res, tag);
    } catch (error) {
      if (error instanceof Error && error.message === 'Tag not found') {
        this.handleNotFound(res, 'Tag');
      } else {
        this.handleError(error, res, 'TagController.getById');
      }
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validated = createTagSchema.parse(req.body);
      const tag = await this.tagService.createTag(validated);
      this.handleSuccess(res, tag, 'Tag created successfully', 201);
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.handleBadRequest(res, error.errors.map(e => e.message).join(', '));
      } else if (error instanceof Error && error.message.includes('already exists')) {
        this.handleBadRequest(res, error.message);
      } else {
        this.handleError(error, res, 'TagController.create');
      }
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        this.handleBadRequest(res, 'Invalid tag ID');
        return;
      }

      const validated = updateTagSchema.parse(req.body);
      const tag = await this.tagService.updateTag(id, validated);
      this.handleSuccess(res, tag, 'Tag updated successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.handleBadRequest(res, error.errors.map(e => e.message).join(', '));
      } else if (error instanceof Error && (error.message === 'Tag not found' || error.message.includes('already exists'))) {
        this.handleBadRequest(res, error.message);
      } else {
        this.handleError(error, res, 'TagController.update');
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        this.handleBadRequest(res, 'Invalid tag ID');
        return;
      }

      await this.tagService.deleteTag(id);
      this.handleSuccess(res, null, 'Tag deleted successfully');
    } catch (error) {
      if (error instanceof Error && error.message === 'Tag not found') {
        this.handleNotFound(res, 'Tag');
      } else {
        this.handleError(error, res, 'TagController.delete');
      }
    }
  }
}
