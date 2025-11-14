import { createApp } from './app';
import { DatabaseService } from './config/database';

const PORT = process.env.PORT || 3001;

const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🛑 Shutting down gracefully...');

  server.close(() => {
    console.log('✅ HTTP server closed');
  });

  await DatabaseService.disconnect();
  console.log('✅ Database connection closed');

  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
