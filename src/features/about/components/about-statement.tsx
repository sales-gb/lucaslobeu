'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';

function Word({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  // Conclui a revelação em ~60% do scroll da seção, para o texto já estar
  // completo antes de o usuário chegar ao fim.
  const pct = (index / total) * 0.6;
  const opacity = useTransform(
    progress,
    [Math.max(0, pct - 0.01), Math.min(1, pct + 0.04)],
    [0.16, 1],
  );
  return (
    <motion.span style={{ opacity }} className="inline">
      {word}{' '}
    </motion.span>
  );
}

/**
 * Frase de abertura revelada palavra a palavra conforme o scroll. Mesmo recurso
 * usado na seção Sobre da home, isolado para reuso na página Sobre.
 */
export function AboutStatement({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.55'],
  });

  const words = text.split(' ');

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <Word key={i} word={word} index={i} total={words.length} progress={scrollYProgress} />
      ))}
    </p>
  );
}
