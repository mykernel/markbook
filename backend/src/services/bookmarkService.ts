import { BookmarkRepository } from '../repositories/BookmarkRepository';
import { TagRepository } from '../repositories/TagRepository';
import { FolderRepository } from '../repositories/FolderRepository';
import type { CreateBookmarkInput, UpdateBookmarkInput, SearchBookmarksInput } from '../validators/bookmarkValidator';

export class BookmarkService {
  constructor(
    private bookmarkRepo: BookmarkRepository,
    private tagRepo: TagRepository,
    private folderRepo: FolderRepository
  ) {}

  async getAll() {
    return this.bookmarkRepo.findAll({
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

  async getAllBookmarks(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [bookmarks, total] = await Promise.all([
      this.bookmarkRepo.findAll({
        skip,
        take: limit,
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
          folder: true,
        },
      }),
      this.bookmarkRepo.count(),
    ]);

    return {
      bookmarks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBookmarkById(id: number) {
    const bookmark = await this.bookmarkRepo.findById(id);
    if (!bookmark) {
      throw new Error('Bookmark not found');
    }
    return bookmark;
  }

  async createBookmark(input: CreateBookmarkInput) {
    const { tags, folderId, ...bookmarkData } = input;

    // Handle tags
    let tagConnections: any = undefined;
    if (tags && tags.length > 0) {
      const tagRecords = await Promise.all(
        tags.map(tagName => this.tagRepo.getOrCreate(tagName))
      );

      tagConnections = {
        create: tagRecords.map(tag => ({
          tag: {
            connect: { id: tag.id },
          },
        })),
      };
    }

    return this.bookmarkRepo.create({
      ...bookmarkData,
      ...(folderId !== undefined && {
        folder: {
          connect: { id: folderId },
        },
      }),
      ...(tagConnections && { tags: tagConnections }),
    });
  }

  async updateBookmark(id: number, input: UpdateBookmarkInput) {
    const existing = await this.bookmarkRepo.findById(id);
    if (!existing) {
      throw new Error('Bookmark not found');
    }

    const { tags, folderId, ...bookmarkData } = input;

    // Handle tags update
    let tagUpdate: any = undefined;
    if (tags !== undefined) {
      // Delete existing tags and create new ones
      tagUpdate = {
        deleteMany: {},
        create: tags.length > 0 ? await Promise.all(
          tags.map(async tagName => {
            const tag = await this.tagRepo.getOrCreate(tagName);
            return {
              tag: {
                connect: { id: tag.id },
              },
            };
          })
        ) : [],
      };
    }

    return this.bookmarkRepo.update(id, {
      ...bookmarkData,
      ...(folderId !== undefined && {
        folder: folderId ? {
          connect: { id: folderId },
        } : {
          disconnect: true,
        },
      }),
      ...(tagUpdate && { tags: tagUpdate }),
    });
  }

  async deleteBookmark(id: number) {
    const existing = await this.bookmarkRepo.findById(id);
    if (!existing) {
      throw new Error('Bookmark not found');
    }
    return this.bookmarkRepo.delete(id);
  }

  async searchBookmarks(input: SearchBookmarksInput) {
    const { query = '', tags = [], folderId, page = 1, limit = 20 } = input;
    const skip = (page - 1) * limit;

    let tagIds: number[] = [];
    if (tags.length > 0) {
      const tagRecords = await this.tagRepo.findByNames(tags);
      tagIds = tagRecords.map(t => t.id);
    }

    let folderIds: number[] | undefined;
    if (folderId !== undefined) {
      folderIds = await this.folderRepo.getDescendantIds(folderId);
    }

    const { bookmarks, total } = await this.bookmarkRepo.search(query, {
      skip,
      take: limit,
      folderIds,
      tagIds,
    });

    return {
      bookmarks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
