import { localAdapter } from './local';
import type { StorageAdapter } from './interface';

// In production on Cloudflare, swap this for the R2 adapter.
// The binding is injected by the runtime; the local adapter is
// used for all local/CI builds.
export const storage: StorageAdapter = localAdapter;
export { UPLOAD_LIMITS } from './interface';
