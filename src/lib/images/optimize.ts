import sharp from "sharp";

export interface OptimizedImage {
  buffer: Buffer;
  width: number;
  height: number;
  mimeType: string;
  ext: string;
}

/** Maior dimensão (px) — suficiente para telas retina sem peso excessivo. */
const MAX_DIMENSION = 2400;
/** Qualidade WebP — bom equilíbrio peso/qualidade para fotografia. */
const WEBP_QUALITY = 80;

/**
 * Otimiza uma imagem enviada pelo CMS para carregamento leve:
 *  - corrige orientação via EXIF e remove metadados (privacidade + peso);
 *  - redimensiona para caber em MAX_DIMENSION (nunca amplia);
 *  - converte para WebP (q80), que costuma reduzir 50–80% do tamanho.
 *
 * Retorna o buffer otimizado já como WebP, com dimensões finais.
 */
export async function optimizeImage(input: Buffer): Promise<OptimizedImage> {
  const { data, info } = await sharp(input)
    .rotate() // aplica orientação EXIF antes de descartar metadados
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    width: info.width,
    height: info.height,
    mimeType: "image/webp",
    ext: ".webp",
  };
}
