import { FolderRepository } from '../repositories/FolderRepository';
import type { Prisma } from '@prisma/client';
import type { CreateFolderInput, UpdateFolderInput } from '../validators/folderValidator';

const MAX_ROOT_FOLDERS = 5;
const MAX_SECOND_LEVEL_FOLDERS = 20;

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
    if (!input.parentId) {
      const rootCount = await this.folderRepo.countRootFolders();
      if (rootCount >= MAX_ROOT_FOLDERS) {
        throw new Error('一级文件夹数量已达上限（5 个）');
      }
      return this.folderRepo.create({ name: input.name });
    }

    const parent = await this.folderRepo.findById(input.parentId);
    if (!parent) {
      throw new Error('Parent folder not found');
    }

    if (parent.parentId !== null) {
      throw new Error('仅支持两级文件夹结构');
    }

    const childCount = await this.folderRepo.countChildren(parent.id);
    if (childCount >= MAX_SECOND_LEVEL_FOLDERS) {
      throw new Error('该一级文件夹下的二级文件夹数量已达上限（20 个）');
    }

    return this.folderRepo.create({
      name: input.name,
      parent: {
        connect: { id: parent.id },
      },
    });
  }

  async updateFolder(id: number, input: UpdateFolderInput) {
    const existing = await this.folderRepo.findById(id);
    if (!existing) {
      throw new Error('Folder not found');
    }

    const updateData: Prisma.FolderUpdateInput = {};

    if (input.parentId !== undefined) {
      if (input.parentId === id) {
        throw new Error('Folder cannot be its own parent');
      }

      if (input.parentId === null) {
        if (existing.parentId !== null) {
          const rootCount = await this.folderRepo.countRootFolders();
          if (rootCount >= MAX_ROOT_FOLDERS) {
            throw new Error('一级文件夹数量已达上限（5 个）');
          }
        }
        updateData.parent = { disconnect: true };
      } else {
        const parent = await this.folderRepo.findById(input.parentId);
        if (!parent) {
          throw new Error('Parent folder not found');
        }
        if (parent.parentId !== null) {
          throw new Error('仅支持两级文件夹结构');
        }
        if (existing.parentId !== parent.id) {
          const childCount = await this.folderRepo.countChildren(parent.id);
          if (childCount >= MAX_SECOND_LEVEL_FOLDERS) {
            throw new Error('该一级文件夹下的二级文件夹数量已达上限（20 个）');
          }
        }
        updateData.parent = {
          connect: { id: parent.id },
        };
      }
    }

    return this.folderRepo.update(id, {
      ...(input.name && { name: input.name }),
      ...updateData,
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
