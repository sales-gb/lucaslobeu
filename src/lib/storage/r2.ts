// Adapter R2 para produção (Cloudflare). O `bucket` é o binding MEDIA_BUCKET do
// wrangler.toml; `publicUrl` é a URL pública do bucket (r2.dev ou domínio).
import type { StorageAdapter } from './interface';

export function createR2Adapter(bucket: R2Bucket, publicUrl: string): StorageAdapter {
  const base = publicUrl.replace(/\/+$/, '');
  return {
    async save(file: Buffer, filename: string, mimeType: string): Promise<string> {
      // O filename já vem único (hex aleatório + extensão) da rota de mídia.
      await bucket.put(filename, file, { httpMetadata: { contentType: mimeType } });
      return filename;
    },

    async delete(stored: string): Promise<void> {
      await bucket.delete(stored);
    },

    getUrl(stored: string): string {
      return `${base}/${stored}`;
    },
  };
}

// Shim de tipo mínimo para ambientes sem @cloudflare/workers-types.
declare global {
  interface R2Bucket {
    put(key: string, body: ArrayBuffer | Buffer, options?: { httpMetadata?: { contentType?: string } }): Promise<void>;
    delete(key: string): Promise<void>;
  }
}
