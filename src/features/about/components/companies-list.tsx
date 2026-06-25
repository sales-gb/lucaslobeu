'use client';

import { useState } from 'react';
import type { Company } from '@/features/about/types';

/**
 * Lista de empresas/marcas em coluna única, ocupando toda a largura do
 * container. Nome à extrema esquerda, ano à extrema direita.
 *
 * No hover de uma linha, o nome desliza um pouco para a direita e a imagem do
 * trabalho surge no espaço aberto, à esquerda — ao lado do nome (revelação
 * inline). A imagem só existe no hover. Clicar abre o post do projeto no
 * Instagram da marca.
 *
 * No toque/mobile não há hover: a lista funciona só com nome + ano, sem
 * depender da imagem.
 */
export function CompaniesList({ companies }: { companies: Company[] }) {
  const [active, setActive] = useState<number | null>(null);
  if (companies.length === 0) return null;

  return (
    <ul className="flex w-full flex-col" onMouseLeave={() => setActive(null)}>
      {companies.map((c, i) => {
        const dimmed = active !== null && active !== i;
        const Row = (
          <div
            className="group/row flex items-center justify-between gap-6 py-7 transition-opacity duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] max-sm:py-5"
            style={{ opacity: dimmed ? 0.32 : 1 }}
          >
            {/* Cluster esquerdo: imagem (revelada no hover) + nome. */}
            <span className="flex min-w-0 items-center">
              {c.imageUrl && (
                <span
                  aria-hidden
                  className="block h-[clamp(58px,7vw,104px)] w-0 shrink-0 overflow-hidden rounded-[2px] opacity-0 transition-[width,opacity,margin] duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/row:mr-7 group-hover/row:w-[clamp(78px,9.3vw,140px)] group-hover/row:opacity-100 max-sm:group-hover/row:mr-4"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.imageUrl}
                    alt=""
                    className="h-full w-[clamp(78px,9.3vw,140px)] max-w-none object-cover"
                  />
                </span>
              )}

              <span className="truncate font-serif font-light leading-[0.95] tracking-[-0.02em] text-[clamp(34px,6vw,84px)]">
                {c.name}
              </span>
            </span>

            {/* Ano — extrema direita. */}
            <span className="shrink-0 font-mono text-[12px] tabular-nums tracking-[0.12em] text-muted transition-colors duration-300 group-hover/row:text-accent max-sm:text-[11px]">
              {c.year || (c.instagramUrl ? '↗' : '')}
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
                aria-label={`Ver trabalho na ${c.name} no Instagram${c.year ? `, ${c.year}` : ''}`}
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
  );
}
