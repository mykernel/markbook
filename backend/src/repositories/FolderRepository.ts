import { prisma } from '../config/database';
import type { Folder, Prisma } from '@prisma/client';

export class FolderRepository {
  async findAll(): Promise<Folder[]> {
    return prisma.folder.findMany({
      include: {
        children: true,
        parent: true,
        _count: {
          select: {
            bookmarks: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: number): Promise<Folder | null> {
    return prisma.folder.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
        bookmarks: true,
      },
    });
  }

  async findRootFolders(): Promise<Folder[]> {
    return prisma.folder.findMany({
      where: { parentId: null },
      include: {
        children: true,
        _count: {
          select: {
            bookmarks: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async countRootFolders(): Promise<number> {
    return prisma.folder.count({
      where: { parentId: null },
    });
  }

  async countChildren(parentId: number): Promise<number> {
    return prisma.folder.count({
      where: { parentId },
    });
  }

  async create(data: Prisma.FolderCreateInput): Promise<Folder> {
    return prisma.folder.create({
      data,
      include: {
        children: true,
        parent: true,
      },
    });
  }

  async update(id: number, data: Prisma.FolderUpdateInput): Promise<Folder> {
    return prisma.folder.update({
      where: { id },
      data,
      include: {
        children: true,
        parent: true,
      },
    });
  }

  async delete(id: number): Promise<Folder> {
    return prisma.folder.delete({
      where: { id },
    });
  }

  async getDescendantIds(folderId: number): Promise<number[]> {
    const folders = await prisma.folder.findMany({
      select: {
        id: true,
        parentId: true,
      },
    });

    const descendantIds = new Set<number>();
    const stack = [folderId];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (descendantIds.has(current)) continue;
      descendantIds.add(current);

      folders.forEach(folder => {
        if (folder.parentId === current) {
          stack.push(folder.id);
        }
      });
    }

    return Array.from(descendantIds);
  }

  async findByNameAndParent(name: string, parentId: number | null): Promise<Folder | null> {
    return prisma.folder.findFirst({
      where: {
        name,
        parentId,
      },
    });
  }
}
