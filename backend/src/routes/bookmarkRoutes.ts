import { Router } from 'express';
import { BookmarkController } from '../controllers/BookmarkController';
import { BookmarkService } from '../services/bookmarkService';
import { BookmarkRepository } from '../repositories/BookmarkRepository';
import { TagRepository } from '../repositories/TagRepository';
import { FolderRepository } from '../repositories/FolderRepository';
import { asyncWrapper } from '../middleware/errorHandler';

const router = Router();

// Dependency injection
const bookmarkRepo = new BookmarkRepository();
const tagRepo = new TagRepository();
const folderRepo = new FolderRepository();
const bookmarkService = new BookmarkService(bookmarkRepo, tagRepo, folderRepo);
const controller = new BookmarkController(bookmarkService);

// Routes
router.get('/', asyncWrapper((req, res) => controller.getAll(req, res)));
router.get('/search', asyncWrapper((req, res) => controller.search(req, res)));
router.get('/:id', asyncWrapper((req, res) => controller.getById(req, res)));
router.post('/', asyncWrapper((req, res) => controller.create(req, res)));
router.put('/:id', asyncWrapper((req, res) => controller.update(req, res)));
router.delete('/:id', asyncWrapper((req, res) => controller.delete(req, res)));

export default router;
