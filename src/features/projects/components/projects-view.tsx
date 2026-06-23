'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import ImageBlock from '@/components/ui/image-block';
import Reveal from '@/components/ui/reveal';
import TextReveal from '@/components/ui/text-reveal';
import { Eyebrow } from '@/components/ui/eyebrow';
import { SectionMarker } from '@/components/ui/section-marker';
import { cn } from '@/lib/utils/cn';
import type { Project } from '@/lib/db/schema';
import type { ProjectWithUrls } from '@/features/projects/types';

const REVEAL_TONE: Record<'light' | 'mid' | 'dark', 'light' | 'mid' | 'dark'> = {
  light: 'dark',
  mid: 'dark',
  dark: 'light',
};

type Filter = 'Todos' | 'Filme' | 'Foto' | 'Social';
const FILTERS: Filter[] = ['Todos', 'Filme', 'Foto', 'Social'];
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// ─── Hero ─────────────────────────────────────────────────────
function ProjectsHero({ sub }: { sub: string }) {
  const desc = sub || 'Um conjunto de projetos que demonstra pensamento claro, execução forte e design que realmente funciona.'

  return (
    <section className="relative -mt-[72px] border-b-[0.5px] border-paper/8 px-[var(--page-x)] pt-[192px] pb-20 max-md:pt-[152px] max-md:pb-12">
      <span className="ll-crosshair ll-crosshair--tl" aria-hidden />
      <span className="ll-crosshair ll-crosshair--tr" aria-hidden />
      <span className="ll-crosshair ll-crosshair--bl" aria-hidden />
      <span className="ll-crosshair ll-crosshair--br" aria-hidden />

      <div className="flex flex-col gap-5">
        <Reveal y={0} delay={0}>
          <SectionMarker eyebrowClassName="text-paper/40">Portfolio</SectionMarker>
        </Reveal>

        <div className="grid grid-cols-2 items-end gap-10 pb-1 max-md:grid-cols-1 max-md:gap-6">
          <TextReveal
            text="Projetos"
            as="h1"
            className="font-serif font-light text-[clamp(80px,14vw,220px)] leading-[0.88] tracking-[-0.03em] text-paper/[0.82]"
            delay={80}
            stagger={0.06}
            splitBy="char"
          />
          <Reveal y={0} delay={600} className="flex items-end max-md:hidden">
            <p className="ml-auto max-w-[300px] text-right font-mono text-[11px] uppercase leading-[2] tracking-[0.18em] text-paper/[0.42]">
              {desc}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── Manifesto word (scroll-animated opacity) ─────────────────
function ManifestoWord({
  word,
  index,
  total,
  scrollYProgress,
}: {
  word: string;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const pct = (index / total) * 0.9;
  const opacity = useTransform(
    scrollYProgress,
    [Math.max(0, pct - 0.02), Math.min(1, pct + 0.05)],
    [0.12, 1],
  );
  return (
    <motion.span className="inline text-paper" style={{ opacity }}>
      {word}{' '}
    </motion.span>
  );
}

// ─── Manifesto section ────────────────────────────────────────
function ManifestoSection({ text, imageUrl }: { text: string; imageUrl: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 1', 'end 0'] });
  const words = (text || 'Cada projeto começa por uma conversa. A maior parte acontece antes da câmera ser acionada.').split(' ');
  const hasImage = !!imageUrl;

  return (
    <section className="relative bg-ink px-[var(--page-x)] text-paper" ref={ref}>
      <div
        className={cn(
          'grid items-start gap-20 max-[900px]:gap-0',
          hasImage
            ? 'grid-cols-[1fr_1.4fr] max-[900px]:grid-cols-1'
            : 'max-w-[900px] grid-cols-1 py-[var(--section-y)]',
        )}
      >
        {hasImage && (
          <div className="sticky top-[15vh] py-[var(--section-y)] max-[900px]:static max-[900px]:pt-[var(--section-y)] max-[900px]:pb-0">
            <div className="h-[65vh] max-h-[560px] overflow-hidden rounded-[2px] [&>*]:!h-full">
              <ImageBlock tone="dark" ratio="3/4" style={{ height: '100%' }} src={imageUrl} />
            </div>
          </div>
        )}
        <div className="py-[var(--section-y)] pb-[240px]">
          <SectionMarker tone="light" style={{ marginBottom: 32 }}>
            Manifesto
          </SectionMarker>
          <p className="mt-5 font-serif font-light text-[clamp(22px,3vw,48px)] leading-[1.22] tracking-[-0.01em] text-paper">
            {words.map((word, i) => (
              <ManifestoWord
                key={i}
                word={word}
                index={i}
                total={words.length}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </p>
          <div className="mt-14 border-t-[0.5px] border-paper/[0.12] pt-8">
            <Link href="/contact" className="ll-link-rule text-paper/75">
              Falar sobre um projeto <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Project card ─────────────────────────────────────────────
function ProjectCard({ project, index }: { project: ProjectWithUrls; index: number }) {
  const tone = (project.coverTone as 'light' | 'mid' | 'dark') ?? 'mid';
  const ratioMap: Record<string, string> = { tall: '3/4', wide: '4/3', square: '1/1' };
  const ratio = ratioMap[project.coverKind ?? 'tall'] ?? '3/4';
  const [hovered, setHovered] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const getPercent = (e: React.MouseEvent) => {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 50, y: 50 };
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  const reveal = (e: React.MouseEvent) => {
    const { x, y } = getPercent(e);
    const p = previewRef.current;
    if (!p) return;
    p.style.transition = 'none';
    p.style.clipPath = `circle(0% at ${x}% ${y}%)`;
    void p.offsetWidth;
    p.style.transition = 'clip-path 0.55s cubic-bezier(0.22, 1, 0.36, 1)';
    p.style.clipPath = `circle(150% at ${x}% ${y}%)`;
  };

  const conceal = (e: React.MouseEvent) => {
    const { x, y } = getPercent(e);
    const p = previewRef.current;
    if (!p) return;
    p.style.transition = 'clip-path 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
    p.style.clipPath = `circle(0% at ${x}% ${y}%)`;
  };

  return (
    <Reveal y={20} delay={index * 40}>
      <Link
        href={`/projects/${project.slug}`}
        className="group flex flex-col gap-4"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative overflow-hidden" ref={imgRef} onMouseEnter={reveal} onMouseLeave={conceal}>
          <motion.div
            className="transition-[filter] duration-500 group-hover:brightness-[0.92]"
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
          >
            <ImageBlock tone={tone} ratio={ratio} src={project.coverImageUrl} />
          </motion.div>
          <div
            ref={previewRef}
            className="pointer-events-none absolute inset-0 z-[2] [clip-path:circle(0%_at_50%_50%)] [&>figure]:h-full [&>figure>div]:h-full"
            aria-hidden
          >
            <ImageBlock
              tone={project.coverHoverImageUrl ? tone : REVEAL_TONE[tone]}
              ratio={ratio}
              src={project.coverHoverImageUrl ?? project.coverImageUrl}
              style={{ height: '100%' }}
            />
          </div>
          <motion.div
            className="absolute inset-x-4 bottom-4 z-[3] flex items-end justify-between text-paper [mix-blend-mode:difference]"
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            <div>
              <div className="ll-mono small-cap" style={{ fontSize: 10 }}>{project.category}</div>
              <div className="font-serif text-[18px]">{project.client}</div>
            </div>
            <motion.span
              className="text-[22px]"
              animate={{ x: hovered ? 0 : -8, opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
            >→</motion.span>
          </motion.div>
        </div>

        <div className="flex flex-row items-start justify-between gap-4 pt-[14px]">
          <span className="font-serif text-[22px] font-normal tracking-[-0.01em] text-paper/[0.88]">
            {project.title}
          </span>
          <div className="flex shrink-0 flex-col items-end gap-[3px] pt-1">
            {project.role && <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-paper/[0.38]">{project.role}</span>}
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-paper/[0.38]">{project.category}</span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

// ─── Main component ───────────────────────────────────────────
export default function ProjectsClient({
  projects,
  heroSub = '',
  manifestoText = '',
  manifestoImageUrl = '',
}: {
  projects: ProjectWithUrls[];
  heroSub?: string;
  manifestoText?: string;
  manifestoImageUrl?: string;
}) {
  const [active, setActive] = useState<Filter>('Todos');

  const filtered = active === 'Todos'
    ? projects
    : projects.filter((p) => p.category === active);

  const counts: Record<Filter, number> = {
    Todos: projects.length,
    Filme: projects.filter((p) => p.category === 'Filme').length,
    Foto: projects.filter((p) => p.category === 'Foto').length,
    Social: projects.filter((p) => p.category === 'Social').length,
  };

  // Fibonacci layout: alternating A (2 items: col1 + col3) and B (1 item: col2)
  const groups: Array<{ type: 'A' | 'B'; items: Project[] }> = [];
  let i = 0;
  while (i < filtered.length) {
    if (groups.length % 2 === 0) {
      const items = filtered.slice(i, Math.min(i + 2, filtered.length));
      groups.push({ type: 'A', items });
      i += items.length;
    } else {
      groups.push({ type: 'B', items: [filtered[i]] });
      i += 1;
    }
  }

  return (
    <div className="min-h-screen bg-ink text-paper">
      <ProjectsHero sub={heroSub} />

      {/* Filter bar */}
      <div className="border-y-[0.5px] border-paper/8 px-[var(--page-x)] py-5">
        <div className="flex flex-wrap items-center gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={cn(
                'inline-flex items-center gap-2.5 rounded-full border-[0.5px] border-transparent px-[18px] py-[10px] font-mono text-[12px] uppercase tracking-[0.14em] text-paper/45 transition-all duration-[250ms] hover:border-paper/[0.18] hover:text-paper/80',
                active === f && 'border-paper/[0.12] bg-paper/10 !text-paper',
              )}
              onClick={() => setActive(f)}
            >
              {active === f && <span className="inline-block size-[5px] rounded-full bg-accent" />}
              {f}
              <span className={active === f ? 'text-paper/45' : 'text-muted'}>{counts[f]}</span>
            </button>
          ))}
          <div className="flex-1" />
          <Eyebrow className="text-[11px] text-paper/40">
            {filtered.length} resultados
          </Eyebrow>
        </div>
      </div>

      {/* Fibonacci grid */}
      <div className="flex flex-col gap-20 px-[var(--page-x)] pt-20 pb-[120px]">
        {groups.length === 0 && (
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-paper/40">
            Nenhum projeto encontrado.
          </p>
        )}
        {groups.map((group, gi) => {
          const baseIdx = groups.slice(0, gi).reduce((sum, g) => sum + g.items.length, 0);
          const rowBase = 'grid grid-cols-3 items-start gap-7 max-[900px]:grid-cols-2 max-[900px]:gap-5 max-md:grid-cols-1';
          const gap = <div className="max-[900px]:hidden" aria-hidden />;
          if (group.type === 'A') {
            return (
              <div key={gi} className={rowBase}>
                <ProjectCard project={group.items[0]} index={baseIdx} />
                {gap}
                {group.items[1]
                  ? <ProjectCard project={group.items[1]} index={baseIdx + 1} />
                  : gap}
              </div>
            );
          }
          return (
            <div key={gi} className={cn(rowBase, 'max-[900px]:grid-cols-1')}>
              {gap}
              <ProjectCard project={group.items[0]} index={baseIdx} />
              {gap}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t-[0.5px] border-paper/8 px-[var(--page-x)] pt-10 pb-20">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper/40">
          {filtered.length} de {projects.length} projetos
        </span>
        <Link href="/contact" className="ll-link-rule text-paper/75">
          Iniciar um projeto <span>→</span>
        </Link>
      </div>

      <ManifestoSection text={manifestoText} imageUrl={manifestoImageUrl} />
    </div>
  );
}
