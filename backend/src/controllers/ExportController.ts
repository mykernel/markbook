import { Request, Response } from 'express';
import { BaseController } from '../utils/BaseController';
import { BookmarkService } from '../services/bookmarkService';

export class ExportController extends BaseController {
  constructor(private bookmarkService: BookmarkService) {
    super();
  }

  /**
   * 导出为Netscape书签HTML格式
   */
  exportHTML = this.asyncHandler(async (req: Request, res: Response) => {
    const bookmarks = await this.bookmarkService.getAll();

    const html = this.generateNetscapeHTML(bookmarks);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="bookmarks.html"');
    res.send(html);
  });

  /**
   * 导出为JSON格式
   */
  exportJSON = this.asyncHandler(async (req: Request, res: Response) => {
    const bookmarks = await this.bookmarkService.getAll();

    const exportData = bookmarks.map(bm => ({
      title: bm.title,
      url: bm.url,
      description: bm.description,
      folder: bm.folder?.name,
      tags: bm.tags?.map(t => t.tag.name) || [],
      createdAt: bm.createdAt,
    }));

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="bookmarks.json"');
    res.json(exportData);
  });

  /**
   * 生成Netscape书签HTML格式
   */
  private generateNetscapeHTML(bookmarks: any[]): string {
    const timestamp = Math.floor(Date.now() / 1000);

    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

    // 按文件夹分组
    const folderMap = new Map<string, any[]>();
    const noFolderBookmarks: any[] = [];

    bookmarks.forEach(bm => {
      if (bm.folder) {
        const folderName = bm.folder.name;
        if (!folderMap.has(folderName)) {
          folderMap.set(folderName, []);
        }
        folderMap.get(folderName)!.push(bm);
      } else {
        noFolderBookmarks.push(bm);
      }
    });

    // 输出无文件夹的书签
    noFolderBookmarks.forEach(bm => {
      const addDate = Math.floor(new Date(bm.createdAt).getTime() / 1000);
      html += `    <DT><A HREF="${this.escapeHtml(bm.url)}" ADD_DATE="${addDate}">${this.escapeHtml(bm.title)}</A>\n`;
    });

    // 输出文件夹及其书签
    folderMap.forEach((bookmarks, folderName) => {
      html += `    <DT><H3 ADD_DATE="${timestamp}">${this.escapeHtml(folderName)}</H3>\n`;
      html += `    <DL><p>\n`;
      bookmarks.forEach(bm => {
        const addDate = Math.floor(new Date(bm.createdAt).getTime() / 1000);
        html += `        <DT><A HREF="${this.escapeHtml(bm.url)}" ADD_DATE="${addDate}">${this.escapeHtml(bm.title)}</A>\n`;
      });
      html += `    </DL><p>\n`;
    });

    html += `</DL><p>\n`;

    return html;
  }

  /**
   * HTML转义
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, char => map[char]);
  }
}
