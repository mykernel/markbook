import { BookmarkRepository } from '../repositories/BookmarkRepository';
import { TagRepository } from '../repositories/TagRepository';
import { FolderRepository } from '../repositories/FolderRepository';
import type {
  CreateBookmarkInput,
  UpdateBookmarkInput,
  SearchBookmarksInput,
  BulkActionInput,
  SortOption,
} from '../validators/bookmarkValidator';

export class BookmarkService {
  constructor(
    private bookmarkRepo: BookmarkRepository,
    private tagRepo: TagRepository,
    private folderRepo: FolderRepository
  ) {}

  private resolveSort(sort?: SortOption) {
    switch (sort) {
      case 'visitCount':
        return { visitCount: 'desc' as const };
      case 'lastVisitedAt':
        return { lastVisitedAt: 'desc' as const };
      case 'createdAt':
      default:
        return { createdAt: 'desc' as const };
    }
  }

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
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllBookmarks(page: number = 1, limit: number = 20, sort?: SortOption) {
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
        orderBy: this.resolveSort(sort),
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
    const { query = '', tags = [], folderId, page = 1, limit = 20, sort } = input;
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
      orderBy: this.resolveSort(sort),
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

  async recordVisit(id: number) {
    const bookmark = await this.bookmarkRepo.findById(id);
    if (!bookmark) {
      throw new Error('Bookmark not found');
    }

    await this.bookmarkRepo.update(id, {
      visitCount: bookmark.visitCount + 1,
      lastVisitedAt: new Date(),
    });
  }

  async bulkAction(input: BulkActionInput) {
    const { action, bookmarkIds } = input;
    if (bookmarkIds.length === 0) return;

    switch (action) {
      case 'delete':
        await Promise.all(bookmarkIds.map(id => this.deleteBookmark(id)));
        break;
      case 'move':
        await Promise.all(
          bookmarkIds.map(id =>
            this.bookmarkRepo.update(id, {
              folder: input.targetFolderId
                ? { connect: { id: input.targetFolderId } }
                : { disconnect: true },
            })
          )
        );
        break;
      case 'addTags': {
        const tags = input.tags ?? [];
        if (tags.length === 0) break;
        const tagRecords = await Promise.all(tags.map(name => this.tagRepo.getOrCreate(name)));
        await Promise.all(
          bookmarkIds.map(id => this.bookmarkRepo.addTags(id, tagRecords.map(t => t.id)))
        );
        break;
      }
      case 'removeTags': {
        const tags = input.tags ?? [];
        if (tags.length === 0) break;
        const existingTags = await this.tagRepo.findByNames(tags);
        await Promise.all(
          bookmarkIds.map(id =>
            this.bookmarkRepo.removeTags(id, existingTags.map(t => t.id))
          )
        );
        break;
      }
      default:
        throw new Error(`Unsupported bulk action: ${action}`);
    }
  }
}
