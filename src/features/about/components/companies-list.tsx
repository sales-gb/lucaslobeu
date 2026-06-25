'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eyebrow } from '@/components/ui/eyebrow';
import ImageBlock from '@/components/ui/image-block';
import type { Company } from '@/features/about/types';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Lista de empresas/marcas. No hover de uma linha, o nome desliza para a
 * esquerda e a imagem do trabalho surge no palco à direita (crossfade entre
 * itens). Clicar abre o post do projeto no Instagram da empresa.
 *
 * Hover é só enriquecimento: no toque/mobile o palco lateral é ocultado e cada
 * linha mostra a miniatura inline, então a informação nunca depende de hover.
 */
export function CompaniesList({ companies }: { companies: Company[] }) {
  const [active, setActive] = useState<number | null>(null);
  if (companies.length === 0) return null;

  const activeCompany = active !== null ? companies[active] : null;

  return (
    <div className="grid grid-cols-[1fr_minmax(300px,38%)] gap-x-16 max-lg:grid-cols-1">
      {/* ── Lista (coluna esquerda) ───────────────────────────── */}
      <ul
        className="flex flex-col"
        onMouseLeave={() => setActive(null)}
      >
        {companies.map((c, i) => {
          const dimmed = active !== null && active !== i;
          const Row = (
            <div
              className="group/row relative grid grid-cols-[44px_1fr_auto] items-center gap-5 py-6 transition-[opacity,transform] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ opacity: dimmed ? 0.32 : 1 }}
            >
              <span className="font-mono text-[11px] tabular-nums text-muted">
                {String(i + 1).padStart(2, '0')}
              </span>

              <span className="flex items-baseline gap-4 transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/row:-translate-x-2 max-lg:group-hover/row:translate-x-0">
                <span className="font-serif font-light leading-[0.95] tracking-[-0.02em] text-[clamp(34px,5vw,68px)]">
                  {c.name}
                </span>
              </span>

              <span className="flex items-center gap-3 justify-self-end">
                {/* Miniatura inline — só no mobile (sem hover). */}
                {c.imageUrl && (
                  <span className="hidden size-14 overflow-hidden rounded-[2px] max-lg:block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.imageUrl} alt={c.name} className="size-full object-cover" />
                  </span>
                )}
                {c.instagramUrl && (
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted opacity-0 -translate-x-1 transition-[opacity,transform,color] duration-300 group-hover/row:translate-x-0 group-hover/row:text-accent group-hover/row:opacity-100 max-lg:translate-x-0 max-lg:opacity-100">
                    ↗
                  </span>
                )}
              </span>
            </div>
          );

          return (
            <li
              key={`${c.name}-${i}`}
              className="border-b-[0.5px] border-rule first:border-t-[0.5px]"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
            >
              {c.instagramUrl ? (
                <a
                  href={c.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Ver trabalho na ${c.name} no Instagram`}
                  className="block"
                >
                  {Row}
                </a>
              ) : (
                Row
              )}
            </li>
          );
        })}
      </ul>

      {/* ── Palco da imagem (coluna direita) — só desktop ─────── */}
      <div className="relative max-lg:hidden" aria-hidden>
        <div className="sticky top-[18vh] h-[clamp(320px,42vh,520px)] overflow-hidden rounded-[2px]">
          <AnimatePresence mode="wait">
            {activeCompany?.imageUrl ? (
              <motion.div
                key={activeCompany.imageUrl}
                initial={{ opacity: 0, clipPath: 'inset(14% 0 14% 0)', scale: 1.04 }}
                animate={{ opacity: 1, clipPath: 'inset(0% 0 0% 0)', scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.55, ease: EASE }}
                className="absolute inset-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeCompany.imageUrl}
                  alt=""
                  className="size-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
                  <Eyebrow className="text-paper/80">{activeCompany.name}</Eyebrow>
                  {activeCompany.instagramUrl && (
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/70">
                      Instagram ↗
                    </span>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="absolute inset-0"
              >
                <ImageBlock tone="dark" ratio="4/3" style={{ height: '100%' }} />
                <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] uppercase tracking-[0.2em] text-paper/30">
                  Passe o cursor
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
