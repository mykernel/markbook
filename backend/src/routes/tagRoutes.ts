import { Router } from 'express';
import { TagController } from '../controllers/TagController';
import { TagService } from '../services/tagService';
import { TagRepository } from '../repositories/TagRepository';
import { asyncWrapper } from '../middleware/errorHandler';

const router = Router();

// Dependency injection
const tagRepo = new TagRepository();
const tagService = new TagService(tagRepo);
const controller = new TagController(tagService);

// Routes
router.get('/', asyncWrapper((req, res) => controller.getAll(req, res)));
router.get('/:id', asyncWrapper((req, res) => controller.getById(req, res)));
router.post('/', asyncWrapper((req, res) => controller.create(req, res)));
router.put('/:id', asyncWrapper((req, res) => controller.update(req, res)));
router.delete('/:id', asyncWrapper((req, res) => controller.delete(req, res)));

export default router;
