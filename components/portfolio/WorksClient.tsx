'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Reveal from './Reveal'
import TextReveal from './TextReveal'
import ImageBlock from './ImageBlock'
import type { Project } from '@/lib/db/schema'

const CATEGORIES = ['Todos', 'Filme', 'Foto', 'Social']

function WorkItem({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['6%', '-6%'])

  return (
    <Reveal y={40} delay={0}>
      <div ref={ref}>
        <Link
          href={`/projects/${project.slug}`}
          className="ll-work-item"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Image block */}
          <div className="ll-work-image">
            <motion.div className="ll-work-image-inner" style={{ y: imageY }}>
              <ImageBlock
                tone={(project.coverTone as 'dark' | 'mid' | 'light') ?? 'mid'}
                ratio="16/9"
                style={{ height: '100%' }}
              />
            </motion.div>
            <motion.div
              className="ll-work-image-overlay"
              animate={{ opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
            {/* Hover label */}
            <AnimatePresence>
              {hovered && (
                <motion.span
                  className="ll-work-view-label"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                >
                  Ver projeto →
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Metadata row */}
          <div className="ll-work-meta">
            <div className="ll-work-meta-left">
              <span className="ll-work-num ll-mono small-cap muted">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h2 className="ll-work-title">{project.title}</h2>
              <span className="ll-work-client muted">{project.client}</span>
            </div>
            <div className="ll-work-meta-right">
              <span className="ll-work-cat small-cap">{project.category}</span>
              <span className="ll-work-year ll-mono muted">{project.year}</span>
            </div>
          </div>

          {/* Bottom rule */}
          <motion.div
            className="ll-work-rule"
            animate={{ scaleX: hovered ? 1 : 0.4, opacity: hovered ? 1 : 0.3 }}
            style={{ transformOrigin: 'left' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </Link>
      </div>
    </Reveal>
  )
}

export default function WorksClient({ projects }: { projects: Project[] }) {
  const [activeCategory, setActiveCategory] = useState('Todos')

  const filtered = activeCategory === 'Todos'
    ? projects
    : projects.filter((p) => p.category === activeCategory)

  return (
    <>
      {/* ── HEADER ──────────────────────────────────────────── */}
      <section className="ll-works-header">
        <div className="ll-works-header-inner">
          <Reveal y={0}>
            <div className="ll-section-marker">
              <span className="ll-accent-dot" />
              <span className="ll-eyebrow">Case studies</span>
            </div>
          </Reveal>
          <TextReveal
            text="Construídos para se destacar."
            as="h1"
            className="ll-works-title"
            delay={60}
            stagger={0.035}
          />
          <Reveal y={20} delay={300}>
            <p className="ll-works-sub">
              Um conjunto de projetos que exige pensamento forte, execução precisa
              e design que realmente funciona.
            </p>
          </Reveal>
        </div>

        {/* Crosshairs */}
        <span className="ll-crosshair ll-crosshair--tl" aria-hidden />
        <span className="ll-crosshair ll-crosshair--tr" aria-hidden />
        <span className="ll-crosshair ll-crosshair--bl" aria-hidden />
        <span className="ll-crosshair ll-crosshair--br" aria-hidden />
      </section>

      {/* ── FILTER ──────────────────────────────────────────── */}
      <div className="ll-works-filter">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`ll-works-filter-btn${activeCategory === cat ? ' is-active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
            <span className="ll-works-filter-count">
              {cat === 'Todos' ? projects.length : projects.filter((p) => p.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* ── PROJECTS LIST ───────────────────────────────────── */}
      <section className="ll-works-list">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {filtered.map((p, i) => (
              <WorkItem key={p.id} project={p} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>
    </>
  )
}
