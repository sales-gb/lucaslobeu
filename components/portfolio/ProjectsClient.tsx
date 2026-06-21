'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import ImageBlock from './ImageBlock';
import Reveal from './Reveal';
import TextReveal from './TextReveal';
import type { Project } from '@/lib/db/schema';
import type { ProjectWithUrls } from '@/app/(portfolio)/projects/page';

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
    <section className="ll-projects-hero">
      <span className="ll-crosshair ll-crosshair--tl" aria-hidden />
      <span className="ll-crosshair ll-crosshair--tr" aria-hidden />
      <span className="ll-crosshair ll-crosshair--bl" aria-hidden />
      <span className="ll-crosshair ll-crosshair--br" aria-hidden />

      <div className="ll-projects-hero-inner">
        <Reveal y={0} delay={0}>
          <div className="ll-section-marker">
            <span className="ll-accent-dot" />
            <span className="ll-eyebrow" style={{ color: 'rgba(244,241,234,.4)' }}>Portfolio</span>
          </div>
        </Reveal>

        <div className="ll-projects-hero-body">
          <TextReveal
            text="Projetos"
            as="h1"
            className="ll-projects-hero-title"
            delay={80}
            stagger={0.06}
            splitBy="char"
          />
          <Reveal y={0} delay={600} className="ll-projects-hero-desc-wrap">
            <p className="ll-projects-hero-desc">{desc}</p>
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
    <motion.span className="ll-projects-manifesto-word" style={{ opacity }}>
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
    <section className="ll-projects-manifesto" ref={ref}>
      <div className={`ll-projects-manifesto-grid${!hasImage ? ' ll-projects-manifesto-grid--noimg' : ''}`}>
        {hasImage && (
          <div className="ll-projects-manifesto-img-col">
            <div className="ll-projects-manifesto-img">
              <ImageBlock tone="dark" ratio="3/4" style={{ height: '100%' }} src={imageUrl} />
            </div>
          </div>
        )}
        <div className="ll-projects-manifesto-text-col">
          <div className="ll-section-marker" style={{ marginBottom: 32 }}>
            <span className="ll-accent-dot" />
            <span className="ll-eyebrow" style={{ color: 'rgba(244,241,234,.5)' }}>Manifesto</span>
          </div>
          <p className="ll-projects-manifesto-statement">
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
          <div className="ll-projects-manifesto-foot">
            <Link href="/contact" className="ll-link-rule" style={{ color: 'rgba(244,241,234,.75)' }}>
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
        className="ll-projectcard"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="ll-projectcard-imgwrap" ref={imgRef} onMouseEnter={reveal} onMouseLeave={conceal}>
          <motion.div
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
          >
            <ImageBlock tone={tone} ratio={ratio} src={project.coverImageUrl} />
          </motion.div>
          <div ref={previewRef} className="ll-projectcard-preview" aria-hidden>
            <ImageBlock
              tone={project.coverHoverImageUrl ? tone : REVEAL_TONE[tone]}
              ratio={ratio}
              src={project.coverHoverImageUrl ?? project.coverImageUrl}
              style={{ height: '100%' }}
            />
          </div>
          <motion.div
            className="ll-projectcard-overlay"
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            <div>
              <div className="ll-mono small-cap" style={{ fontSize: 10 }}>{project.category}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>{project.client}</div>
            </div>
            <motion.span
              className="ll-projectcard-arrow"
              animate={{ x: hovered ? 0 : -8, opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
            >→</motion.span>
          </motion.div>
        </div>

        <div className="ll-projectcard-meta">
          <span className="ll-projectcard-name">{project.title}</span>
          <div className="ll-projectcard-tags">
            {project.role && <span className="ll-projectcard-tag">{project.role}</span>}
            <span className="ll-projectcard-tag">{project.category}</span>
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
    <div className="ll-projects-page">
      <ProjectsHero sub={heroSub} />

      {/* Filter bar */}
      <div className="ll-projects-filterbar" style={{ padding: '20px var(--page-x)' }}>
        <div className="ll-filter ll-filter--dark">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`ll-filter-btn${active === f ? ' is-active' : ''}`}
              onClick={() => setActive(f)}
            >
              {active === f && <span className="ll-filter-dot" />}
              {f}
              <span className="muted">{counts[f]}</span>
            </button>
          ))}
          <div className="ll-filter-grow" />
          <span className="ll-eyebrow" style={{ color: 'rgba(244,241,234,.4)', fontSize: 11 }}>
            {filtered.length} resultados
          </span>
        </div>
      </div>

      {/* Fibonacci grid */}
      <div className="ll-projects-fib" style={{ padding: '80px var(--page-x) 120px' }}>
        {groups.length === 0 && (
          <p style={{ color: 'rgba(244,241,234,.4)', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase' }}>
            Nenhum projeto encontrado.
          </p>
        )}
        {groups.map((group, gi) => {
          const baseIdx = groups.slice(0, gi).reduce((sum, g) => sum + g.items.length, 0);
          if (group.type === 'A') {
            return (
              <div key={gi} className="ll-fib-row ll-fib-row--a">
                <ProjectCard project={group.items[0]} index={baseIdx} />
                <div className="ll-fib-gap" aria-hidden />
                {group.items[1]
                  ? <ProjectCard project={group.items[1]} index={baseIdx + 1} />
                  : <div className="ll-fib-gap" aria-hidden />
                }
              </div>
            );
          } else {
            return (
              <div key={gi} className="ll-fib-row ll-fib-row--b">
                <div className="ll-fib-gap" aria-hidden />
                <ProjectCard project={group.items[0]} index={baseIdx} />
                <div className="ll-fib-gap" aria-hidden />
              </div>
            );
          }
        })}
      </div>

      <div className="ll-projects-foot ll-projects-foot--dark">
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(244,241,234,.4)' }}>
          {filtered.length} de {projects.length} projetos
        </span>
        <Link href="/contact" className="ll-link-rule" style={{ color: 'rgba(244,241,234,.75)' }}>
          Iniciar um projeto <span>→</span>
        </Link>
      </div>

      <ManifestoSection text={manifestoText} imageUrl={manifestoImageUrl} />
    </div>
  );
}
