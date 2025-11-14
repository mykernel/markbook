import { prisma } from '../config/database';
import type { Tag, Prisma } from '@prisma/client';

export class TagRepository {
  async findAll(): Promise<Tag[]> {
    return prisma.tag.findMany({
      where: {
        bookmarks: {
          some: {},
        },
      },
      include: {
        _count: {
          select: {
            bookmarks: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: number): Promise<Tag | null> {
    return prisma.tag.findUnique({
      where: { id },
      include: {
        bookmarks: {
          include: {
            bookmark: true,
          },
        },
      },
    });
  }

  async findByName(name: string): Promise<Tag | null> {
    return prisma.tag.findUnique({
      where: { name },
    });
  }

  async findByNames(names: string[]): Promise<Tag[]> {
    return prisma.tag.findMany({
      where: {
        name: { in: names },
      },
    });
  }

  async create(data: Prisma.TagCreateInput): Promise<Tag> {
    return prisma.tag.create({ data });
  }

  async update(id: number, data: Prisma.TagUpdateInput): Promise<Tag> {
    return prisma.tag.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Tag> {
    return prisma.tag.delete({
      where: { id },
    });
  }

  async getOrCreate(name: string, color?: string): Promise<Tag> {
    const existing = await this.findByName(name);
    if (existing) {
      return existing;
    }
    return this.create({ name, color });
  }
}
