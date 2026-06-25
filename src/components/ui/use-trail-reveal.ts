'use client';

import { useEffect, useRef } from 'react';

// Efeito de "pincel de rastro": a cada movimento do mouse, carimbos circulares
// revelam a imagem (alinhada ao card, como o exemplo com background-attachment
// fixed) ao longo do caminho do cursor. Cada carimbo some rápido → rastro curto.

const LIFETIME = 480; // ms até o carimbo sumir (vs. 3000 do exemplo original)
const STEP = 9; // distância mín. (px) entre carimbos
const SIZE_RATIO = 0.24; // diâmetro do carimbo relativo à menor dimensão do card
const MAX_FILL = 6; // máx. de carimbos interpolados num movimento rápido

/**
 * @param imageUrl  imagem revelada pelo pincel (hover ou capa).
 * @param filter    filtro CSS opcional (usado p/ diferenciar quando se revela a
 *                  própria capa, na ausência de uma 2ª imagem).
 */
export function useTrailReveal(imageUrl?: string, filter?: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const timers = useRef<number[]>([]);

  const spawn = (x: number, y: number, w: number, h: number) => {
    const layer = layerRef.current;
    if (!layer || !imageUrl) return;
    const r = (Math.min(w, h) * SIZE_RATIO) / 2;
    const s = document.createElement('span');
    s.className = 'll-brush';
    s.style.left = `${x - r}px`;
    s.style.top = `${y - r}px`;
    s.style.width = `${r * 2}px`;
    s.style.height = `${r * 2}px`;
    s.style.backgroundImage = `url("${imageUrl}")`;
    s.style.backgroundSize = `${w}px ${h}px`;
    // alinha a imagem ao card: o carimbo é uma janela para a imagem inteira.
    s.style.backgroundPosition = `${-(x - r)}px ${-(y - r)}px`;
    s.style.animationDuration = `${LIFETIME}ms`;
    if (filter) s.style.filter = filter;
    layer.appendChild(s);
    const id = window.setTimeout(() => {
      s.remove();
      timers.current = timers.current.filter((t) => t !== id);
    }, LIFETIME);
    timers.current.push(id);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const c = containerRef.current;
    if (!c || !imageUrl) return;
    const rect = c.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const l = last.current;

    if (l) {
      const dist = Math.hypot(x - l.x, y - l.y);
      if (dist < STEP) return;
      // preenche o rastro quando o mouse anda rápido (sem buracos)
      const fill = Math.min(Math.floor(dist / STEP), MAX_FILL);
      for (let i = 1; i < fill; i++) {
        spawn(
          l.x + ((x - l.x) * i) / fill,
          l.y + ((y - l.y) * i) / fill,
          rect.width,
          rect.height,
        );
      }
    }
    spawn(x, y, rect.width, rect.height);
    last.current = { x, y };
  };

  const onMouseLeave = () => {
    last.current = null;
  };

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    },
    [],
  );

  return { containerRef, layerRef, onMouseMove, onMouseLeave };
}
