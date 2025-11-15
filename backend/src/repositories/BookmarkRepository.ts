import { prisma } from '../config/database';
import type { Bookmark, Prisma } from '@prisma/client';

export class BookmarkRepository {
  async findAll(options?: {
    skip?: number;
    take?: number;
    where?: Prisma.BookmarkWhereInput;
    include?: Prisma.BookmarkInclude;
    orderBy?: Prisma.BookmarkOrderByWithRelationInput;
  }): Promise<Bookmark[]> {
    return prisma.bookmark.findMany({
      ...options,
      orderBy: options?.orderBy ?? { createdAt: 'desc' },
    });
  }

  async findById(id: number): Promise<Bookmark | null> {
    return prisma.bookmark.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        folder: true,
      },
    });
  }

  async count(where?: Prisma.BookmarkWhereInput): Promise<number> {
    return prisma.bookmark.count({ where });
  }

  async create(data: Prisma.BookmarkCreateInput): Promise<Bookmark> {
    return prisma.bookmark.create({
      data,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        folder: true,
      },
    });
  }

  async update(id: number, data: Prisma.BookmarkUpdateInput): Promise<Bookmark> {
    return prisma.bookmark.update({
      where: { id },
      data,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        folder: true,
      },
    });
  }

  async delete(id: number): Promise<Bookmark> {
    return prisma.bookmark.delete({
      where: { id },
    });
  }

  async addTags(bookmarkId: number, tagIds: number[]): Promise<void> {
    if (tagIds.length === 0) return;
    const uniqueTagIds = Array.from(new Set(tagIds));
    await prisma.bookmarkTag.createMany({
      data: uniqueTagIds.map(tagId => ({ bookmarkId, tagId })),
    });
  }

  async removeTags(bookmarkId: number, tagIds: number[]): Promise<void> {
    if (tagIds.length === 0) return;
    await prisma.bookmarkTag.deleteMany({
      where: {
        bookmarkId,
        tagId: { in: tagIds },
      },
    });
  }

  async search(query: string, options?: {
    skip?: number;
    take?: number;
    folderIds?: number[];
    tagIds?: number[];
    orderBy?: Prisma.BookmarkOrderByWithRelationInput;
  }): Promise<{ bookmarks: Bookmark[]; total: number }> {
    const where = this.buildSearchWhere(query, options);

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where,
        skip: options?.skip,
        take: options?.take,
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
          folder: true,
        },
        orderBy: options?.orderBy ?? { createdAt: 'desc' },
      }),
      prisma.bookmark.count({ where }),
    ]);

    return { bookmarks, total };
  }

  private buildSearchWhere(
    query: string,
    options?: { folderIds?: number[]; tagIds?: number[] }
  ): Prisma.BookmarkWhereInput {
    const conditions: Prisma.BookmarkWhereInput[] = [];
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      conditions.push({
        OR: [
          { title: { contains: trimmedQuery } },
          { description: { contains: trimmedQuery } },
          { url: { contains: trimmedQuery } },
        ],
      });
    }

    if (options?.folderIds && options.folderIds.length > 0) {
      conditions.push({ folderId: { in: options.folderIds } });
    }

    if (options?.tagIds && options.tagIds.length > 0) {
      conditions.push({
        tags: {
          some: {
            tagId: { in: options.tagIds },
          },
        },
      });
    }

    return conditions.length > 0 ? { AND: conditions } : {};
  }
}
