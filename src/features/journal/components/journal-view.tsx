'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import Reveal from '@/components/ui/reveal'
import TextReveal from '@/components/ui/text-reveal'
import ImageBlock from '@/components/ui/image-block'
import { Eyebrow } from '@/components/ui/eyebrow'
import { SectionMarker } from '@/components/ui/section-marker'
import { cn } from '@/lib/utils/cn'
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

  // Zebra: entradas pares invertem mídia/texto via direction (texto interno volta a ltr).
  const even = index % 2 === 1

  return (
    <div ref={ref} className="relative border-b-[0.5px] border-rule">
      <Link
        href={`/journal/${entry.slug}`}
        className={cn(
          'group grid grid-cols-2 items-center gap-[60px] px-[var(--page-x)] py-20 text-inherit no-underline max-lg:grid-cols-1 max-lg:gap-8 max-lg:py-[60px]',
          even && '[direction:rtl]',
        )}
      >
        {/* Image side */}
        <div
          className={cn(
            'aspect-[4/3] overflow-hidden rounded-[2px]',
            even && '[direction:ltr]',
          )}
        >
          <motion.div
            className="h-[110%] w-full -mt-[5%] will-change-transform [&>*]:!h-full"
            style={{ y: imageY, scale: imageScale }}
          >
            <ImageBlock
              tone={(['light', 'mid', 'dark'] as const)[index % 3]}
              ratio="4/3"
              style={{ height: '100%' }}
            />
          </motion.div>
        </div>

        {/* Text side */}
        <div className={cn('flex flex-col gap-5', even && '[direction:ltr]')}>
          <Reveal y={0}>
            <div className="flex items-center gap-4">
              <span className="ll-mono small-cap muted">{String(index + 1).padStart(2, '0')}</span>
              <Eyebrow>{formatDate(entry.publishedAt)}</Eyebrow>
              {entry.readTime && <Eyebrow>· {entry.readTime} leitura</Eyebrow>}
            </div>
          </Reveal>

          <Reveal y={24} delay={60}>
            <h2 className="font-serif font-light text-[clamp(28px,3.5vw,52px)] leading-[1.05] tracking-[-0.02em] transition-colors duration-300 group-hover:text-accent">
              {entry.title}
            </h2>
          </Reveal>

          <Reveal y={16} delay={100}>
            <p className="max-w-[480px] font-sans text-[clamp(15px,1.4vw,17px)] leading-[1.65] text-muted">
              {entry.excerpt}
            </p>
          </Reveal>

          <Reveal y={12} delay={160}>
            <span className="ll-link-rule inline-flex">
              Ler entrada <span>→</span>
            </span>
          </Reveal>
        </div>
      </Link>

      {/* Animated bottom rule */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[0.5px] origin-left bg-accent"
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
      <section className="relative flex min-h-[60vh] items-end overflow-hidden bg-ink px-[var(--page-x)] py-20 text-paper">
        <div className="relative z-[1] max-w-[880px]">
          <Reveal y={0}>
            {/* tom "dark" (muted) = paridade com o original (eyebrow discreto) */}
            <SectionMarker>Diário · Processo</SectionMarker>
          </Reveal>

          <TextReveal
            text="Diário"
            as="h1"
            className="mt-6 mb-8 font-serif font-light text-[clamp(72px,12vw,180px)] leading-[0.88] tracking-[-0.03em] text-paper"
            delay={60}
            stagger={0.06}
          />

          <Reveal y={20} delay={300}>
            <p className="max-w-[560px] font-sans text-[clamp(16px,1.8vw,20px)] leading-[1.6] text-[rgba(244,241,234,0.65)]">
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
      <section>
        {entries.map((entry, i) => (
          <JournalEntry key={entry.id} entry={entry} index={i} />
        ))}
      </section>
    </>
  )
}
