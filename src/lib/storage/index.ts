import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { StorageAdapter } from './interface';

export { UPLOAD_LIMITS } from './interface';

/**
 * Resolve o adapter de storage conforme o ambiente:
 *
 * - **Produção (Workers):** bucket **R2** (`env.MEDIA_BUCKET`) + URL pública
 *   (`env.R2_PUBLIC_URL`). Os módulos Node (fs) nunca são carregados.
 * - **Dev local:** adapter de arquivo (`public/uploads`), carregado por import
 *   dinâmico para não entrar no bundle do Worker.
 *
 * Async porque os adapters são carregados sob demanda. Chame uma vez por
 * request e reutilize a instância (ex.: `const st = await getStorage()`).
 */
export async function getStorage(): Promise<StorageAdapter> {
  try {
    const { env } = getCloudflareContext();
    if (env.MEDIA_BUCKET && env.R2_PUBLIC_URL) {
      const { createR2Adapter } = await import('./r2');
      return createR2Adapter(env.MEDIA_BUCKET, env.R2_PUBLIC_URL);
    }
  } catch {
    // Fora do contexto Cloudflare (next dev) → adapter local.
  }
  const { localAdapter } = await import('./local');
  return localAdapter;
}
