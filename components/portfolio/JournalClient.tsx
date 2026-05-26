'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import Reveal from './Reveal'
import TextReveal from './TextReveal'
import ImageBlock from './ImageBlock'
import type { JournalEntry } from '@/lib/db/schema'

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function JournalEntry({ entry, index }: { entry: JournalEntry; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['6%', '-6%'])
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.04, 1, 1.04])

  return (
    <div ref={ref} className="ll-journal-entry">
      <Link href={`/journal/${entry.slug}`} className="ll-journal-entry-link">
        {/* Image side */}
        <div className="ll-journal-entry-media">
          <motion.div className="ll-journal-entry-image" style={{ y: imageY, scale: imageScale }}>
            <ImageBlock
              tone={(['light', 'mid', 'dark'] as const)[index % 3]}
              ratio="4/3"
              style={{ height: '100%' }}
            />
          </motion.div>
        </div>

        {/* Text side */}
        <div className="ll-journal-entry-body">
          <Reveal y={0}>
            <div className="ll-journal-entry-date">
              <span className="ll-mono small-cap muted">{String(index + 1).padStart(2, '0')}</span>
              <span className="ll-eyebrow muted">{formatDate(entry.publishedAt)}</span>
              {entry.readTime && (
                <span className="ll-eyebrow muted">· {entry.readTime} leitura</span>
              )}
            </div>
          </Reveal>

          <Reveal y={24} delay={60}>
            <h2 className="ll-journal-entry-title">{entry.title}</h2>
          </Reveal>

          <Reveal y={16} delay={100}>
            <p className="ll-journal-entry-excerpt">{entry.excerpt}</p>
          </Reveal>

          <Reveal y={12} delay={160}>
            <span className="ll-journal-entry-cta ll-link-rule">
              Ler entrada <span>→</span>
            </span>
          </Reveal>
        </div>
      </Link>

      {/* Animated bottom rule */}
      <motion.div
        className="ll-journal-entry-rule"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}

interface Props {
  entries: JournalEntry[]
}

export default function JournalClient({ entries }: Props) {
  return (
    <>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <section className="ll-journal-hero">
        <div className="ll-journal-hero-inner">
          <Reveal y={0}>
            <div className="ll-section-marker">
              <span className="ll-accent-dot" />
              <span className="ll-eyebrow">Diário · Processo</span>
            </div>
          </Reveal>

          <TextReveal
            text="Diário"
            as="h1"
            className="ll-journal-hero-title"
            delay={60}
            stagger={0.06}
          />

          <Reveal y={20} delay={300}>
            <p className="ll-journal-hero-sub">
              Notas sobre processo, bastidores e o que acontece antes da câmera ser ligada.
            </p>
          </Reveal>
        </div>

        <span className="ll-crosshair ll-crosshair--tl" aria-hidden />
        <span className="ll-crosshair ll-crosshair--tr" aria-hidden />
        <span className="ll-crosshair ll-crosshair--bl" aria-hidden />
        <span className="ll-crosshair ll-crosshair--br" aria-hidden />
      </section>

      {/* ── ENTRY LIST ─────────────────────────────────────── */}
      <section className="ll-journal-list-v2">
        {entries.map((entry, i) => (
          <JournalEntry key={entry.id} entry={entry} index={i} />
        ))}
      </section>
    </>
  )
}
