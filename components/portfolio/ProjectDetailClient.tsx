'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Reveal from './Reveal'
import TextReveal from './TextReveal'
import ImageBlock from './ImageBlock'
import type { Project } from '@/lib/db/schema'

type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'image'; tone?: string; ratio?: string; caption?: string }
  | { type: 'image-pair'; items: Array<{ tone?: string; ratio?: string; caption?: string }> }
  | { type: 'image-trio'; items: Array<{ tone?: string; ratio?: string; caption?: string }> }
  | { type: 'image-grid'; cols?: number; items: Array<{ tone?: string; ratio?: string }> }

type CreditRow = [string, string]

function safeTone(t?: string | null): 'light' | 'mid' | 'dark' {
  return (t === 'light' || t === 'mid' || t === 'dark') ? t : 'mid'
}

function BodyBlock({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="ll-body ll-body--large ll-pd-block">{block.text}</p>
    case 'quote':
      return (
        <div className="ll-pd-block ll-pd-quote">
          <blockquote className="ll-quote">{block.text}</blockquote>
          {block.attribution && <cite className="ll-eyebrow">{block.attribution}</cite>}
        </div>
      )
    case 'image':
      return (
        <div className="ll-pd-block ll-pd-image">
          <ImageBlock tone={safeTone(block.tone)} ratio={block.ratio ?? '16/9'} caption={block.caption} />
        </div>
      )
    case 'image-pair':
      return (
        <div className="ll-pd-block ll-pd-pair">
          {block.items.map((item, i) => (
            <ImageBlock key={i} tone={safeTone(item.tone)} ratio={item.ratio ?? '3/4'} caption={item.caption} />
          ))}
        </div>
      )
    case 'image-trio':
      return (
        <div className="ll-pd-block ll-pd-trio">
          {block.items.map((item, i) => (
            <ImageBlock key={i} tone={safeTone(item.tone)} ratio={item.ratio ?? '1/1'} caption={item.caption} />
          ))}
        </div>
      )
    case 'image-grid': {
      const cols = block.cols ?? 2
      return (
        <div className="ll-pd-block ll-pd-grid" style={{ '--pd-cols': cols } as React.CSSProperties}>
          {block.items.map((item, i) => (
            <ImageBlock key={i} tone={safeTone(item.tone)} ratio={item.ratio ?? '1/1'} />
          ))}
        </div>
      )
    }
    default:
      return null
  }
}

interface Props {
  project: Project
  nextProject: Project | null
  prevProject?: Project | null
}

export default function ProjectDetailClient({ project, nextProject, prevProject }: Props) {
  let blocks: ContentBlock[] = []
  let credits: CreditRow[] = []
  try { blocks = JSON.parse(project.body) as ContentBlock[] } catch {}
  try { credits = JSON.parse(project.credits) as CreditRow[] } catch {}

  const tone = safeTone(project.coverTone)

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="ll-pd-hero">
        <div className="ll-pd-hero-inner">
          <Reveal y={0}>
            <div className="ll-section-marker">
              <span className="ll-accent-dot" />
              <span className="ll-eyebrow">Case studies</span>
            </div>
          </Reveal>

          <div className="ll-pd-hero-layout">
            <TextReveal
              text={project.title}
              as="h1"
              className="ll-pd-title"
              delay={60}
              stagger={0.04}
            />

            <Reveal y={20} delay={300} className="ll-pd-hero-desc">
              <p className="ll-pd-summary">{project.summary}</p>
            </Reveal>
          </div>
        </div>

        {/* Crosshairs */}
        <span className="ll-crosshair ll-crosshair--tl" aria-hidden />
        <span className="ll-crosshair ll-crosshair--tr" aria-hidden />
        <span className="ll-crosshair ll-crosshair--bl" aria-hidden />
        <span className="ll-crosshair ll-crosshair--br" aria-hidden />
      </section>

      {/* ── COVER IMAGE ──────────────────────────────────────── */}
      <div className="ll-pd-cover">
        <Reveal y={0}>
          <ImageBlock tone={tone} ratio="16/9" style={{ height: '100%' }} />
        </Reveal>
      </div>

      {/* ── METADATA TABLE ───────────────────────────────────── */}
      <section className="ll-pd-meta-section">
        <div className="ll-pd-meta-grid">
          {[
            { label: 'Data', value: project.year },
            { label: 'Cliente', value: project.client },
            { label: 'Categoria', value: project.category },
            { label: 'Serviços', value: project.role },
          ].map((item, i) => (
            <Reveal key={item.label} y={16} delay={i * 50}>
              <div className="ll-pd-meta-row">
                <span className="ll-pd-meta-label ll-mono small-cap">{item.label}</span>
                <span className="ll-pd-meta-value">{item.value}</span>
              </div>
            </Reveal>
          ))}
          {credits.length > 0 && credits.map(([role, name], i) => (
            <Reveal key={role} y={16} delay={(i + 4) * 50}>
              <div className="ll-pd-meta-row">
                <span className="ll-pd-meta-label ll-mono small-cap">{role}</span>
                <span className="ll-pd-meta-value">{name}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── BODY CONTENT ─────────────────────────────────────── */}
      {blocks.length > 0 && (
        <section className="ll-pd-body">
          {blocks.map((block, i) => (
            <Reveal key={i} y={24} delay={0}>
              <BodyBlock block={block} />
            </Reveal>
          ))}
        </section>
      )}

      {/* ── NEXT PROJECT ─────────────────────────────────────── */}
      {nextProject && (
        <section className="ll-pd-next">
          <Reveal y={0}>
            <div className="ll-section-marker">
              <span className="ll-accent-dot" />
              <span className="ll-eyebrow">Próximo projeto</span>
            </div>
          </Reveal>

          <Link href={`/projects/${nextProject.slug}`} className="ll-pd-next-link">
            <div className="ll-pd-next-image">
              <ImageBlock tone={safeTone(nextProject.coverTone)} ratio="16/9" style={{ height: '100%' }} />
              <div className="ll-pd-next-overlay" />
            </div>
            <div className="ll-pd-next-meta">
              <TextReveal
                text={nextProject.title}
                as="h2"
                className="ll-pd-next-title"
                stagger={0.04}
              />
              <span className="ll-mono small-cap muted ll-pd-next-cat">{nextProject.category} · {nextProject.year}</span>
            </div>
          </Link>

          {/* Crosshairs */}
          <span className="ll-crosshair ll-crosshair--tl" aria-hidden />
          <span className="ll-crosshair ll-crosshair--br" aria-hidden />
        </section>
      )}

      {/* ── NAVIGATION ───────────────────────────────────────── */}
      <div className="ll-pd-nav">
        <Link href="/projects" className="ll-link-rule muted">
          ← Todos os projetos
        </Link>
        {prevProject && (
          <Link href={`/projects/${prevProject.slug}`} className="ll-link-rule muted">
            ← {prevProject.title}
          </Link>
        )}
      </div>
    </>
  )
}
