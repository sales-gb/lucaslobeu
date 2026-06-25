'use client';

import { useCallback, useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Galeria em tela cheia. Clica numa imagem → abre aqui; navega com setas do
 * teclado / botões, fecha com Esc ou clicando no fundo.
 */
export function Lightbox({
  images,
  index,
  onClose,
  onIndex,
}: {
  images: string[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const open = index !== null;

  const go = useCallback(
    (dir: number) => {
      if (index === null || images.length === 0) return;
      onIndex((index + dir + images.length) % images.length);
    },
    [index, images.length, onIndex],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, go, onClose]);

  return (
    <AnimatePresence>
      {open && index !== null && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/95 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          onClick={onClose}
        >
          {/* Topo: contador + fechar */}
          <div className="absolute inset-x-0 top-0 z-[2] flex items-center justify-between px-[var(--page-x)] py-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/50">
              {String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              className="font-mono text-[12px] uppercase tracking-[0.16em] text-paper/70 transition-colors hover:text-paper"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              Fechar ✕
            </button>
          </div>

          {/* Imagem */}
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              className="relative h-[78vh] w-[86vw] max-w-[1400px]"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.32, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[index]}
                alt=""
                fill
                sizes="86vw"
                className="object-contain"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Navegação */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Anterior"
                className="absolute left-[var(--page-x)] z-[2] flex size-12 items-center justify-center rounded-full border-[0.5px] border-paper/20 text-[18px] text-paper/70 transition-all hover:border-paper/50 hover:text-paper max-md:left-3"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Próxima"
                className="absolute right-[var(--page-x)] z-[2] flex size-12 items-center justify-center rounded-full border-[0.5px] border-paper/20 text-[18px] text-paper/70 transition-all hover:border-paper/50 hover:text-paper max-md:right-3"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
              >
                →
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
