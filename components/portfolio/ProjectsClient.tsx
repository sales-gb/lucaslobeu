'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import ImageBlock from './ImageBlock';
import Reveal from './Reveal';
import TextReveal from './TextReveal';
import type { Project } from '@/lib/db/schema';

// The tone revealed "behind" the cover on hover — the opposite end of the
// tonal range so the reveal reads as a distinct second frame.
const REVEAL_TONE: Record<'light' | 'mid' | 'dark', 'light' | 'mid' | 'dark'> = {
  light: 'dark',
  mid: 'dark',
  dark: 'light',
};

type Filter = 'Todos' | 'Filme' | 'Foto' | 'Social';

const FILTERS: Filter[] = ['Todos', 'Filme', 'Foto', 'Social'];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// ─── Hero section (dark) ──────────────────────────────────────
function ProjectsHero({ sub }: { sub: string }) {
  return (
    <section className="ll-projects-hero">
      <span className="ll-crosshair ll-crosshair--tl" aria-hidden />
      <span className="ll-crosshair ll-crosshair--tr" aria-hidden />
      <div className="ll-projects-hero-inner">
        <Reveal y={8} delay={0}>
          <div className="ll-section-marker" style={{ marginBottom: 24 }}>
            <span className="ll-accent-dot" />
            <span className="ll-eyebrow" style={{ color: 'rgba(244,241,234,.5)' }}>Portfolio</span>
          </div>
        </Reveal>
        <TextReveal
          text="Projetos"
          as="h1"
          className="ll-projects-hero-title"
          delay={80}
          stagger={0.06}
          splitBy="char"
        />
        {sub && (
          <Reveal y={12} delay={500}>
            <p className="ll-projects-hero-sub">{sub}</p>
          </Reveal>
        )}
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

// ─── Manifesto section (image left + scroll text right) ───────
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
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const tone = (project.coverTone as 'light' | 'mid' | 'dark') ?? 'mid';
  const ratioMap: Record<string, string> = { tall: '3/4', wide: '4/3', square: '1/1' };
  const ratio = ratioMap[project.coverKind ?? 'tall'] ?? '3/4';
  const [hovered, setHovered] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Expanding circular clip-path, centred on the cursor, reveals the frame
  // sitting "behind" the cover image. Driven imperatively to avoid re-renders.
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
    void p.offsetWidth; // force reflow so the transition runs
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
            <ImageBlock tone={tone} ratio={ratio} />
          </motion.div>
          {/* Frame revealed "behind" the cover on hover */}
          <div ref={previewRef} className="ll-projectcard-preview" aria-hidden>
            <ImageBlock tone={REVEAL_TONE[tone]} ratio={ratio} style={{ height: '100%' }} />
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
          <span className="ll-projectcard-num ll-mono small-cap" style={{ fontSize: 10 }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="ll-projectcard-title">
            <span className="ll-projectcard-name">{project.title}</span>
            <span className="muted" style={{ fontSize: 14 }}>{project.client} · {project.year}</span>
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
  projects: Project[];
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

  // Distribute into 3 masonry columns round-robin
  const cols: Project[][] = [[], [], []];
  filtered.forEach((p, i) => cols[i % 3].push(p));

  return (
    <>
      <ProjectsHero sub={heroSub || 'Direção audiovisual, fotografia e social media.'} />

      <div className="ll-projects-filterbar" style={{ padding: '24px var(--page-x)' }}>
        <div className="ll-filter">
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
          <span className="ll-eyebrow">{filtered.length} resultados</span>
        </div>
      </div>

      <div className="ll-masonry" style={{ padding: '60px var(--page-x)' }}>
        {cols.map((col, ci) => (
          <div key={ci} className="ll-masonry-col">
            {col.map((project, pi) => (
              <ProjectCard key={project.id} project={project} index={pi * 3 + ci} />
            ))}
          </div>
        ))}
      </div>

      <div className="ll-projects-foot">
        <span className="ll-eyebrow muted">{filtered.length} de {projects.length} projetos</span>
        <Link href="/contact" className="ll-link-rule">
          Iniciar um projeto <span>→</span>
        </Link>
      </div>

      <ManifestoSection text={manifestoText} imageUrl={manifestoImageUrl} />
    </>
  );
}
