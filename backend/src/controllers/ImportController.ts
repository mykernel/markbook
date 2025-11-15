import { Request, Response } from 'express';
import { BaseController } from '../utils/BaseController';
import { BookmarkService } from '../services/bookmarkService';
import { FolderService } from '../services/folderService';
import { parse as parseHTML } from 'node-html-parser';

interface ImportedBookmark {
  title: string;
  url: string;
  folder?: string;
  addDate?: number;
}

export class ImportController extends BaseController {
  constructor(
    private bookmarkService: BookmarkService,
    private folderService: FolderService
  ) {
    super();
  }

  /**
   * 导入浏览器书签（HTML格式）
   */
  importBookmarks = this.asyncHandler(async (req: Request, res: Response) => {
    const { htmlContent } = req.body;

    if (!htmlContent || typeof htmlContent !== 'string') {
      res.status(400).json({ error: '请提供有效的HTML内容' });
      return;
    }

    try {
      const bookmarks = this.parseNetscapeBookmarks(htmlContent);
      const result = await this.saveImportedBookmarks(bookmarks);

      res.json({
        message: '导入成功',
        imported: result.imported,
        skipped: result.skipped,
        errors: result.errors,
      });
    } catch (error) {
      console.error('导入书签失败:', error);
      res.status(500).json({ error: '导入失败，请检查文件格式' });
    }
  });

  /**
   * 解析Netscape书签HTML格式
   */
  private parseNetscapeBookmarks(html: string): ImportedBookmark[] {
    const root = parseHTML(html);
    const bookmarks: ImportedBookmark[] = [];

    // 递归解析DL列表
    const parseDL = (dlElement: any, folderPath = '') => {
      const items = dlElement.querySelectorAll(':scope > dt');

      items.forEach((dt: any) => {
        const link = dt.querySelector('a');
        const h3 = dt.querySelector('h3');
        const subDL = dt.querySelector('dl');

        if (link) {
          // 这是一个书签
          const href = link.getAttribute('href');
          const title = link.textContent?.trim() || href || 'Untitled';
          const addDate = link.getAttribute('add_date');

          if (href) {
            bookmarks.push({
              title,
              url: href,
              folder: folderPath || undefined,
              addDate: addDate ? parseInt(addDate) : undefined,
            });
          }
        } else if (h3 && subDL) {
          // 这是一个文件夹
          const folderName = h3.textContent?.trim() || 'Unnamed Folder';
          const newPath = folderPath ? `${folderPath}/${folderName}` : folderName;
          parseDL(subDL, newPath);
        }
      });
    };

    const mainDL = root.querySelector('dl');
    if (mainDL) {
      parseDL(mainDL);
    }

    return bookmarks;
  }

  /**
   * 保存导入的书签到数据库
   */
  private async saveImportedBookmarks(bookmarks: ImportedBookmark[]) {
    const result = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // 创建文件夹映射
    const folderMap = new Map<string, number>();

    for (const bookmark of bookmarks) {
      try {
        let folderId: number | undefined;

        // 如果有文件夹路径，创建或获取文件夹
        if (bookmark.folder) {
          const folderPath = bookmark.folder.split('/');
          let parentId: number | null = null;

          for (const folderName of folderPath) {
            const fullPath = folderPath.slice(0, folderPath.indexOf(folderName) + 1).join('/');

            if (!folderMap.has(fullPath)) {
              try {
                const folder = await this.folderService.createFolder({
                  name: folderName,
                  parentId: parentId ?? undefined,
                });
                folderMap.set(fullPath, folder.id);
                parentId = folder.id;
              } catch (error) {
                // 文件夹可能已存在，尝试查找
                const existingFolders = await this.folderService.getAllFolders();
                const existing = existingFolders.find(
                  f => f.name === folderName && f.parentId === parentId
                );
                if (existing) {
                  folderMap.set(fullPath, existing.id);
                  parentId = existing.id;
                } else {
                  throw error;
                }
              }
            } else {
              parentId = folderMap.get(fullPath)!;
            }
          }

          folderId = parentId ?? undefined;
        }

        // 创建书签
        await this.bookmarkService.createBookmark({
          title: bookmark.title,
          url: bookmark.url,
          folderId,
          tags: [],
        });

        result.imported++;
      } catch (error) {
        console.error(`导入书签失败: ${bookmark.title}`, error);
        result.errors.push(`${bookmark.title}: ${error}`);
        result.skipped++;
      }
    }

    return result;
  }

  /**
   * 导入JSON格式的书签
   */
  importJSON = this.asyncHandler(async (req: Request, res: Response) => {
    const { bookmarks } = req.body;

    if (!Array.isArray(bookmarks)) {
      res.status(400).json({ error: '请提供有效的书签数组' });
      return;
    }

    const result = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const bm of bookmarks) {
      try {
        await this.bookmarkService.createBookmark({
          title: bm.title || 'Untitled',
          url: bm.url,
          description: bm.description,
          folderId: bm.folderId,
          tags: bm.tags || [],
        });
        result.imported++;
      } catch (error) {
        result.errors.push(`${bm.title}: ${error}`);
        result.skipped++;
      }
    }

    res.json(result);
  });
}
