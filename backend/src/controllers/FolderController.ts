import { Request, Response } from 'express';
import { BaseController } from '../utils/BaseController';
import { FolderService } from '../services/folderService';
import { createFolderSchema, updateFolderSchema } from '../validators/folderValidator';
import { z } from 'zod';

export class FolderController extends BaseController {
  constructor(private folderService: FolderService) {
    super();
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const folders = await this.folderService.getAllFolders();
      this.handleSuccess(res, folders);
    } catch (error) {
      this.handleError(error, res, 'FolderController.getAll');
    }
  }

  async getRoots(req: Request, res: Response): Promise<void> {
    try {
      const folders = await this.folderService.getRootFolders();
      this.handleSuccess(res, folders);
    } catch (error) {
      this.handleError(error, res, 'FolderController.getRoots');
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        this.handleBadRequest(res, 'Invalid folder ID');
        return;
      }

      const folder = await this.folderService.getFolderById(id);
      this.handleSuccess(res, folder);
    } catch (error) {
      if (error instanceof Error && error.message === 'Folder not found') {
        this.handleNotFound(res, 'Folder');
      } else {
        this.handleError(error, res, 'FolderController.getById');
      }
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validated = createFolderSchema.parse(req.body);
      const folder = await this.folderService.createFolder(validated);
      this.handleSuccess(res, folder, 'Folder created successfully', 201);
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.handleBadRequest(res, error.errors.map(e => e.message).join(', '));
      } else if (error instanceof Error && error.message.includes('not found')) {
        this.handleBadRequest(res, error.message);
      } else {
        this.handleError(error, res, 'FolderController.create');
      }
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        this.handleBadRequest(res, 'Invalid folder ID');
        return;
      }

      const validated = updateFolderSchema.parse(req.body);
      const folder = await this.folderService.updateFolder(id, validated);
      this.handleSuccess(res, folder, 'Folder updated successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.handleBadRequest(res, error.errors.map(e => e.message).join(', '));
      } else if (error instanceof Error && (error.message.includes('not found') || error.message.includes('own parent'))) {
        this.handleBadRequest(res, error.message);
      } else {
        this.handleError(error, res, 'FolderController.update');
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        this.handleBadRequest(res, 'Invalid folder ID');
        return;
      }

      await this.folderService.deleteFolder(id);
      this.handleSuccess(res, null, 'Folder deleted successfully');
    } catch (error) {
      if (error instanceof Error && error.message === 'Folder not found') {
        this.handleNotFound(res, 'Folder');
      } else {
        this.handleError(error, res, 'FolderController.delete');
      }
    }
  }
}
