/**
 * Otimização de imagem no NAVEGADOR, antes do upload.
 *
 * O cliente é fotógrafo/filmmaker: os arquivos vêm pesados da câmera (20–50MB).
 * Em vez de subir o original e onerar rede + servidor, convertemos para WebP
 * redimensionado já no browser (canvas) — o que sobe é ~0.3–1MB.
 *
 * É a primeira camada; o servidor ainda re-otimiza com sharp (garantia/segurança).
 * Qualquer falha aqui devolve o arquivo original (o servidor cobre o resto).
 */

const MAX_DIMENSION = 2400; // px — suficiente para telas retina
const TARGET_MAX_BYTES = 1_000_000; // ~1MB: alvo de peso por imagem
const START_QUALITY = 0.82;
const MIN_QUALITY = 0.5;

export async function optimizeImageForUpload(file: File): Promise<File> {
  // Vídeos e tipos não-imagem sobem direto.
  if (!file.type.startsWith('image/')) return file;
  if (
    typeof document === 'undefined' ||
    typeof createImageBitmap === 'undefined'
  ) {
    return file;
  }

  try {
    // imageOrientation: aplica a rotação do EXIF (fotos de retrato da câmera).
    const bitmap = await createImageBitmap(file, {
      imageOrientation: 'from-image',
    });

    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
    );
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close?.();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    const encode = (q: number) =>
      new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/webp', q),
      );

    let quality = START_QUALITY;
    let blob = await encode(quality);
    // Reduz a qualidade em passos até ficar perto de ~1MB (no máx. ~3 tentativas).
    while (blob && blob.size > TARGET_MAX_BYTES && quality > MIN_QUALITY) {
      quality = Math.max(MIN_QUALITY, quality - 0.12);
      blob = await encode(quality);
    }

    // Se o navegador não gerou WebP (ou ficou maior que o original), mantém o original.
    if (!blob || blob.size >= file.size) return file;

    const name = `${file.name.replace(/\.[^.]+$/, '')}.webp`;
    return new File([blob], name, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}
