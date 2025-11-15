import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import bookmarkRoutes from './routes/bookmarkRoutes';
import folderRoutes from './routes/folderRoutes';
import tagRoutes from './routes/tagRoutes';
import importRoutes from './routes/importRoutes';
import exportRoutes from './routes/exportRoutes';

dotenv.config();

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' })); // 增加限制以支持大文件
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Routes
  app.use('/api/bookmarks', bookmarkRoutes);
  app.use('/api/folders', folderRoutes);
  app.use('/api/tags', tagRoutes);
  app.use('/api/import', importRoutes);
  app.use('/api/export', exportRoutes);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};
