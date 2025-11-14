import { FolderRepository } from '../repositories/FolderRepository';
import type { CreateFolderInput, UpdateFolderInput } from '../validators/folderValidator';

export class FolderService {
  constructor(private folderRepo: FolderRepository) {}

  async getAllFolders() {
    return this.folderRepo.findAll();
  }

  async getRootFolders() {
    return this.folderRepo.findRootFolders();
  }

  async getFolderById(id: number) {
    const folder = await this.folderRepo.findById(id);
    if (!folder) {
      throw new Error('Folder not found');
    }
    return folder;
  }

  async createFolder(input: CreateFolderInput) {
    if (input.parentId) {
      const parent = await this.folderRepo.findById(input.parentId);
      if (!parent) {
        throw new Error('Parent folder not found');
      }
    }

    return this.folderRepo.create({
      name: input.name,
      ...(input.parentId && {
        parent: {
          connect: { id: input.parentId },
        },
      }),
    });
  }

  async updateFolder(id: number, input: UpdateFolderInput) {
    const existing = await this.folderRepo.findById(id);
    if (!existing) {
      throw new Error('Folder not found');
    }

    if (input.parentId !== undefined) {
      if (input.parentId === id) {
        throw new Error('Folder cannot be its own parent');
      }

      if (input.parentId !== null) {
        const parent = await this.folderRepo.findById(input.parentId);
        if (!parent) {
          throw new Error('Parent folder not found');
        }
      }
    }

    return this.folderRepo.update(id, {
      ...(input.name && { name: input.name }),
      ...(input.parentId !== undefined && {
        parent: input.parentId ? {
          connect: { id: input.parentId },
        } : {
          disconnect: true,
        },
      }),
    });
  }

  async deleteFolder(id: number) {
    const existing = await this.folderRepo.findById(id);
    if (!existing) {
      throw new Error('Folder not found');
    }
    return this.folderRepo.delete(id);
  }
}
