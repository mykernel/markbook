import { Router } from 'express';
import { AiController } from '../controllers/AiController';
import { AiService } from '../services/aiService';
import { BookmarkRepository } from '../repositories/BookmarkRepository';
import { FolderRepository } from '../repositories/FolderRepository';
import { TagRepository } from '../repositories/TagRepository';

const router = Router();

const bookmarkRepo = new BookmarkRepository();
const folderRepo = new FolderRepository();
const tagRepo = new TagRepository();
const aiService = new AiService(bookmarkRepo, folderRepo, tagRepo);
const controller = new AiController(aiService);

router.post('/organize', controller.generateOrganizeSuggestions);

export default router;
