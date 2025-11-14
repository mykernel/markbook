import { Router } from 'express';
import { FolderController } from '../controllers/FolderController';
import { FolderService } from '../services/folderService';
import { FolderRepository } from '../repositories/FolderRepository';
import { asyncWrapper } from '../middleware/errorHandler';

const router = Router();

// Dependency injection
const folderRepo = new FolderRepository();
const folderService = new FolderService(folderRepo);
const controller = new FolderController(folderService);

// Routes
router.get('/', asyncWrapper((req, res) => controller.getAll(req, res)));
router.get('/roots', asyncWrapper((req, res) => controller.getRoots(req, res)));
router.get('/:id', asyncWrapper((req, res) => controller.getById(req, res)));
router.post('/', asyncWrapper((req, res) => controller.create(req, res)));
router.put('/:id', asyncWrapper((req, res) => controller.update(req, res)));
router.delete('/:id', asyncWrapper((req, res) => controller.delete(req, res)));

export default router;
