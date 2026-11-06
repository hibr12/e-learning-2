import { mkdirSync } from 'node:fs';
import path from 'node:path';

export const uploadsDir = path.resolve(process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads'));

mkdirSync(uploadsDir, { recursive: true });
