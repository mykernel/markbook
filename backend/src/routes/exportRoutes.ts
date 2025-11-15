import { Router } from 'express';
import { ExportController } from '../controllers/ExportController';
import { BookmarkService } from '../services/bookmarkService';
import { BookmarkRepository } from '../repositories/BookmarkRepository';
import { TagRepository } from '../repositories/TagRepository';
import { FolderRepository } from '../repositories/FolderRepository';

const router = Router();

// 依赖注入
const bookmarkRepository = new BookmarkRepository();
const tagRepository = new TagRepository();
const folderRepository = new FolderRepository();
const bookmarkService = new BookmarkService(bookmarkRepository, tagRepository, folderRepository);
const exportController = new ExportController(bookmarkService);

// 导出为HTML格式
router.get('/html', exportController.exportHTML);

// 导出为JSON格式
router.get('/json', exportController.exportJSON);

export default router;
