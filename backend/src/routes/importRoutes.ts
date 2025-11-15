import { Router } from 'express';
import { ImportController } from '../controllers/ImportController';
import { BookmarkService } from '../services/bookmarkService';
import { BookmarkRepository } from '../repositories/BookmarkRepository';
import { TagRepository } from '../repositories/TagRepository';
import { FolderService } from '../services/folderService';
import { FolderRepository } from '../repositories/FolderRepository';

const router = Router();

// 依赖注入
const bookmarkRepository = new BookmarkRepository();
const tagRepository = new TagRepository();
const folderRepository = new FolderRepository();
const bookmarkService = new BookmarkService(bookmarkRepository, tagRepository, folderRepository);
const folderService = new FolderService(folderRepository);
const importController = new ImportController(bookmarkService, folderService);

// 导入浏览器书签(HTML)
router.post('/html', importController.importBookmarks);

// 导入JSON格式书签
router.post('/json', importController.importJSON);

export default router;
