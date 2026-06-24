import type { StorageAdapter } from './interface';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const UPLOADS_DIR = process.env.UPLOADS_DIR ?? path.join(process.cwd(), 'public', 'uploads');

export const localAdapter: StorageAdapter = {
  async save(file: Buffer, filename: string, _mimeType: string): Promise<string> {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    const ext = path.extname(filename).toLowerCase();
    const hash = crypto.createHash('sha256').update(file).digest('hex').slice(0, 16);
    const stored = `${hash}${ext}`;
    const dest = path.join(UPLOADS_DIR, stored);
    await fs.writeFile(dest, file);
    return stored;
  },

  async delete(storedFilename: string): Promise<void> {
    const dest = path.join(UPLOADS_DIR, storedFilename);
    await fs.unlink(dest).catch(() => {});
  },

  getUrl(storedFilename: string): string {
    return `/uploads/${storedFilename}`;
  },
};
