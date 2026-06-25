// Upload limits (enforced server-side — never trust client)
export const UPLOAD_LIMITS = {
  // 30 MB: rede de segurança. O cliente já converte para WebP (~1MB) no
  // navegador antes do upload; este limite só cobre o fallback (conversão
  // indisponível) de um original pesado da câmera, que o sharp então otimiza.
  maxSizeBytes: 30 * 1024 * 1024,          // 30 MB for images
  maxVideoSizeBytes: 200 * 1024 * 1024,    // 200 MB for videos
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.mp4'],
} as const;

export interface StorageAdapter {
  save(file: Buffer, filename: string, mimeType: string): Promise<string>;
  delete(path: string): Promise<void>;
  getUrl(path: string): string;
}
