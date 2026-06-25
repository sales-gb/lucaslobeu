'use client';

import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import type { TrajectoryItem } from '@/features/about/types';

const EASE = [0.22, 1, 0.36, 1] as const;

function Milestone({ item }: { item: TrajectoryItem }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' });

  return (
    <li
      ref={ref}
      className="group grid grid-cols-[88px_1fr] py-9 max-sm:grid-cols-[56px_1fr]"
    >
      {/* Coluna do ano — encosta na régua pela direita. */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, ease: EASE }}
        className="pr-6 pt-[6px] text-right font-mono text-[13px] tabular-nums tracking-[0.04em] text-muted max-sm:pr-3"
      >
        {item.year}
      </motion.span>

      {/* Coluna do conteúdo — começa exatamente na régua (nó centrado nela). */}
      <div className="relative pl-9 max-sm:pl-6">
        <span className="absolute left-0 top-[14px] z-10 size-[9px] -translate-x-1/2 rounded-full bg-rule-strong transition-[background,transform] duration-500 group-hover:scale-[1.5] group-hover:bg-accent" />

        <motion.h3
          initial={{ opacity: 0, y: 22 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
          className="font-serif font-light leading-[1.05] tracking-[-0.015em] text-[clamp(26px,3.4vw,46px)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5"
        >
          {item.title}
        </motion.h3>

        {item.description && (
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE, delay: 0.14 }}
            className="ll-body mt-3 max-w-[58ch]"
          >
            {item.description}
          </motion.p>
        )}
      </div>
    </li>
  );
}

/** Linha do tempo com trilho que se preenche conforme o scroll avança. */
export function TrajectoryList({ items }: { items: TrajectoryItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.75', 'end 0.65'],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  if (items.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      {/* Régua base + preenchimento animado (origem no topo). Fica na divisa
          entre a coluna do ano (88px) e a do conteúdo. */}
      <div className="absolute bottom-0 left-[88px] top-0 w-px bg-rule max-sm:left-[56px]" aria-hidden />
      <motion.div
        className="absolute left-[88px] top-0 h-full w-px origin-top bg-accent max-sm:left-[56px]"
        style={{ scaleY }}
        aria-hidden
      />
      <ul className="flex flex-col">
        {items.map((item, i) => (
          <Milestone key={`${item.year}-${i}`} item={item} />
        ))}
      </ul>
    </div>
  );
}
