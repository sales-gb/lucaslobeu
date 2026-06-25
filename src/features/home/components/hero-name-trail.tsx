'use client';

import { useRef, type ReactNode } from 'react';

const STEP = 88; // distância mín. (px) entre imagens carimbadas
const LIFETIME = 760; // ms até a imagem sumir

/**
 * Rastro de imagens guiado pelo cursor, só na Home. A cada passo do mouse
 * sobre a área do título, carimba uma das imagens dos projetos (ciclando pela
 * lista), que sobe e some. As imagens ficam atrás do conteúdo (z-0), então o
 * nome continua legível. Sem imagens (ou em reduced-motion), é um wrapper inerte.
 */
export function HeroNameTrail({
  images,
  className,
  children,
}: {
  images: string[];
  className?: string;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const idx = useRef(0);

  const spawn = (x: number, y: number) => {
    const layer = layerRef.current;
    if (!layer || images.length === 0) return;
    const url = images[idx.current % images.length];
    idx.current += 1;
    const el = document.createElement('div');
    el.className = 'll-hero-trail-img';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.backgroundImage = `url("${url}")`;
    el.style.animationDuration = `${LIFETIME}ms`;
    layer.appendChild(el);
    window.setTimeout(() => el.remove(), LIFETIME);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const c = containerRef.current;
    if (!c || images.length === 0) return;
    const rect = c.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const l = last.current;
    if (!l || Math.hypot(x - l.x, y - l.y) >= STEP) {
      spawn(x, y);
      last.current = { x, y };
    }
  };

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseMove={onMouseMove}
      onMouseLeave={() => {
        last.current = null;
      }}
    >
      <div ref={layerRef} className="pointer-events-none absolute inset-0 z-0 overflow-visible" aria-hidden />
      <div className="relative z-[1] flex flex-col items-center">{children}</div>
    </div>
  );
}
