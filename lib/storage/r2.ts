// R2 adapter stub — plug in when deploying to Cloudflare
// Replace bucket with the R2Bucket binding from wrangler.toml
import type { StorageAdapter } from './interface';

export function createR2Adapter(bucket: R2Bucket, publicUrl: string): StorageAdapter {
  return {
    async save(file: Buffer, filename: string, _mimeType: string): Promise<string> {
      const { ext } = await import('path').then(p => ({ ext: p.extname(filename) }));
      const { createHash } = await import('crypto');
      const hash = createHash('sha256').update(file).digest('hex').slice(0, 16);
      const stored = `${hash}${ext}`;
      await bucket.put(stored, file);
      return stored;
    },

    async delete(stored: string): Promise<void> {
      await bucket.delete(stored);
    },

    getUrl(stored: string): string {
      return `${publicUrl}/${stored}`;
    },
  };
}

// Type shim for non-Cloudflare build environments
declare global {
  interface R2Bucket {
    put(key: string, body: ArrayBuffer | Buffer): Promise<void>;
    delete(key: string): Promise<void>;
  }
}
