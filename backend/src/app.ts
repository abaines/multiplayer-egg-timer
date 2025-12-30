import express from 'express';
import path from 'path';
import { VERSION_INFO } from 'shared';

export function createApp(): express.Application {
  const app = express();

  const frontendPath = path.join(import.meta.dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      version: VERSION_INFO,
    });
  });

  return app;
}
