'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ImageBlock from './ImageBlock';
import Reveal from './Reveal';
import type { Project } from '@/lib/db/schema';

type Filter = 'Todos' | 'Filme' | 'Foto' | 'Social';

const FILTERS: Filter[] = ['Todos', 'Filme', 'Foto', 'Social'];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const tone = (project.coverTone as 'light' | 'mid' | 'dark') ?? 'mid';
  const ratioMap: Record<string, string> = { tall: '3/4', wide: '4/3', square: '1/1' };
  const ratio = ratioMap[project.coverKind ?? 'tall'] ?? '3/4';
  const [hovered, setHovered] = useState(false);

  return (
    <Reveal y={20} delay={index * 40}>
      <Link
        href={`/projects/${project.slug}`}
        className="ll-projectcard"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="ll-projectcard-imgwrap">
          <motion.div
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
          >
            <ImageBlock tone={tone} ratio={ratio} />
          </motion.div>
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

export default function ProjectsClient({ projects }: { projects: Project[] }) {
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
    </>
  );
}
