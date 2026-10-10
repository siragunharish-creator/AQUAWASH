import type { Request, Response } from 'express';
import { app } from '../server.js';

export default function handler(req: Request, res: Response) {
  // Ensure req.url has /api prefix for Express routing
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url}`;
  }
  return app(req, res);
}
