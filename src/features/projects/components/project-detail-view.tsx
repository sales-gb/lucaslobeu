'use client'

import Link from 'next/link'
import Reveal from '@/components/ui/reveal'
import TextReveal from '@/components/ui/text-reveal'
import ImageBlock from '@/components/ui/image-block'
import { Eyebrow } from '@/components/ui/eyebrow'
import { SectionMarker } from '@/components/ui/section-marker'
import { VideoEmbed } from '@/components/ui/video-embed'
import type { Project } from '@/lib/db/schema'

// Padding horizontal próprio da página de detalhe (era --page-x: 153px nesta página).
const PX = 'px-[153px] max-[1200px]:px-20 max-md:px-6'

// Block types use `kind` (matching admin editor output)
type ImageSlot = {
  imageId?: string
  imageUrl?: string
  ratio?: string
  caption?: string
}

type ContentBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'quote'; text: string; attribution?: string }
  | { kind: 'image'; imageId?: string; imageUrl?: string; ratio?: string; caption?: string }
  | { kind: 'image-pair'; items: ImageSlot[] }
  | { kind: 'image-trio'; items: ImageSlot[] }
  | { kind: 'image-grid'; cols?: number; items: ImageSlot[] }
  | { kind: 'video'; url: string; caption?: string }

type CreditRow = [string, string]

function safeTone(t?: string | null): 'light' | 'mid' | 'dark' {
  return t === 'light' || t === 'mid' || t === 'dark' ? t : 'mid'
}

function BodyBlock({ block }: { block: ContentBlock }) {
  switch (block.kind) {
    case 'paragraph':
      return (
        <div>
          <p className="font-sans font-light text-[22px] leading-[1.4] text-paper/80">{block.text}</p>
        </div>
      )
    case 'quote':
      return (
        <div className="mx-auto flex max-w-[800px] flex-col items-center gap-4 text-center">
          <blockquote className="ll-quote text-paper/90">{block.text}</blockquote>
          {block.attribution && <Eyebrow as="cite">{block.attribution}</Eyebrow>}
        </div>
      )
    case 'image':
      return (
        <div className="overflow-hidden rounded-[2px]">
          <ImageBlock ratio={block.ratio ?? '16/9'} src={block.imageUrl} caption={block.caption} />
        </div>
      )
    case 'image-pair':
      return (
        <div className="grid grid-cols-2 gap-6 max-sm:grid-cols-1">
          {(block.items ?? []).map((item, i) => (
            <ImageBlock key={i} ratio={item.ratio ?? '3/4'} src={item.imageUrl} caption={item.caption} />
          ))}
        </div>
      )
    case 'image-trio':
      return (
        <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
          {(block.items ?? []).map((item, i) => (
            <ImageBlock key={i} ratio={item.ratio ?? '1/1'} src={item.imageUrl} caption={item.caption} />
          ))}
        </div>
      )
    case 'image-grid': {
      const cols = block.cols ?? 2
      return (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {(block.items ?? []).map((item, i) => (
            <ImageBlock key={i} ratio={item.ratio ?? '1/1'} src={item.imageUrl} />
          ))}
        </div>
      )
    }
    case 'video':
      return (
        <figure className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-[2px]">
            <VideoEmbed url={block.url} />
          </div>
          {block.caption && (
            <figcaption className="ll-mono small-cap text-paper/45" style={{ fontSize: 11 }}>
              {block.caption}
            </figcaption>
          )}
        </figure>
      )
    default:
      return null
  }
}

interface Props {
  project: Project
  nextProject: Project | null
  prevProject?: Project | null
  coverImageUrl?: string
  nextCoverImageUrl?: string
}

export default function ProjectDetailClient({ project, nextProject, prevProject, coverImageUrl, nextCoverImageUrl }: Props) {
  let blocks: ContentBlock[] = []
  let credits: CreditRow[] = []
  try { const b = JSON.parse(project.body); if (Array.isArray(b)) blocks = b as ContentBlock[] } catch {}
  try { const c = JSON.parse(project.credits); if (Array.isArray(c)) credits = c as CreditRow[] } catch {}

  const tone = safeTone(project.coverTone)
  const coverRatioMap: Record<string, string> = { tall: '3/4', wide: '4/3', square: '1/1' }
  const coverRatio = coverRatioMap[project.coverKind ?? 'tall'] ?? '3/4'

  // Separate text blocks (paragraphs) from media blocks
  const paragraphBlocks = blocks.filter(b => b.kind === 'paragraph')
  const mediaBlocks = blocks.filter(b => b.kind !== 'paragraph')

  // Metadata rows for the info section
  const metaRows = [
    { label: 'Data', value: project.year },
    { label: 'Cliente', value: project.client },
    { label: 'Categoria', value: project.category },
    { label: 'Serviços', value: project.role },
    ...credits.map(([role, name]) => ({ label: role, value: name })),
  ].filter(item => item.value)

  return (
    <div className="bg-ink text-paper">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className={`relative -mt-[72px] overflow-hidden pt-[192px] pb-20 ${PX} max-md:min-h-[60vh] max-md:pt-20 max-md:pb-[60px]`}>
        <div className="flex flex-col gap-8">
          <Reveal y={0}>
            <SectionMarker eyebrowClassName="text-paper/40">Case studies</SectionMarker>
          </Reveal>

          <div className="grid grid-cols-[1.4fr_1fr] items-end gap-20 max-md:grid-cols-1 max-md:gap-6">
            <TextReveal
              text={project.title}
              as="h1"
              className="font-serif font-light text-[clamp(64px,10vw,160px)] leading-[0.88] tracking-[-0.03em] text-paper/[0.88]"
              delay={60}
              stagger={0.04}
            />
            {project.summary && (
              <Reveal y={0} delay={300} className="flex flex-col justify-end pb-2">
                <p className="text-right font-mono text-[11px] uppercase leading-[2] tracking-[0.18em] text-paper/[0.42]">
                  {project.summary}
                </p>
              </Reveal>
            )}
          </div>
        </div>

        <span className="ll-crosshair ll-crosshair--tl" aria-hidden />
        <span className="ll-crosshair ll-crosshair--tr" aria-hidden />
        <span className="ll-crosshair ll-crosshair--bl" aria-hidden />
        <span className="ll-crosshair ll-crosshair--br" aria-hidden />
      </section>

      {/* ── COVER ────────────────────────────────────────────── */}
      <div className="[&>*]:w-full">
        <ImageBlock tone={tone} ratio={coverRatio} src={coverImageUrl} />
      </div>

      {/* ── INFO SECTION: image left / text+meta right ───────── */}
      <section className={`grid grid-cols-[5fr_7fr] items-start gap-20 py-20 ${PX} max-[900px]:grid-cols-1 max-[900px]:gap-10`}>
        {/* Left: cover image at portrait crop */}
        <Reveal y={20} className="w-full">
          <ImageBlock tone={tone} ratio="3/4" src={coverImageUrl} />
        </Reveal>

        {/* Right: overview text + metadata */}
        <div className="flex flex-col items-end gap-14 text-right max-[900px]:items-start max-[900px]:text-left">
          {/* Overview paragraphs */}
          {(paragraphBlocks.length > 0 || project.summary) && (
            <div className="flex flex-col gap-5">
              <Reveal y={0}>
                <Eyebrow className="text-paper/35">Overview</Eyebrow>
              </Reveal>
              {paragraphBlocks.length > 0
                ? paragraphBlocks.map((block, i) => (
                    block.kind === 'paragraph' && (
                      <Reveal key={i} y={16} delay={i * 60}>
                        <p className="font-sans font-light text-[clamp(16px,1.5vw,19px)] leading-[1.65] text-paper/[0.72]">{block.text}</p>
                      </Reveal>
                    )
                  ))
                : (
                  <Reveal y={16} delay={60}>
                    <p className="font-sans font-light text-[clamp(16px,1.5vw,19px)] leading-[1.65] text-paper/[0.72]">{project.summary}</p>
                  </Reveal>
                )
              }
            </div>
          )}

          {/* Metadata list */}
          {metaRows.length > 0 && (
            <Reveal y={0} delay={120}>
              <div className="flex w-full flex-col border-t-[0.5px] border-paper/8">
                {metaRows.map((item) => (
                  <div key={item.label} className="grid grid-cols-2 items-baseline gap-4 border-b-[0.5px] border-paper/8 py-[18px]">
                    <span className="text-left font-mono text-[10px] uppercase tracking-[0.2em] text-paper/[0.32]">{item.label}</span>
                    <span className="text-right font-mono text-[11px] uppercase tracking-[0.14em] text-paper/70">{item.value}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── MEDIA BLOCKS (images, quotes, pairs, etc.) ───────── */}
      {mediaBlocks.length > 0 && (
        <section className={`flex flex-col gap-[60px] pt-[60px] pb-20 ${PX}`}>
          {mediaBlocks.map((block, i) => (
            <Reveal key={i} y={24} delay={0}>
              <BodyBlock block={block} />
            </Reveal>
          ))}
        </section>
      )}

      {/* ── NEXT PROJECT ─────────────────────────────────────── */}
      {nextProject && (
        <section className={`relative overflow-hidden border-t-[0.5px] border-paper/8 py-20 ${PX} max-md:py-[60px]`}>
          <Reveal y={0}>
            <SectionMarker eyebrowClassName="text-paper/40">Próximo projeto</SectionMarker>
          </Reveal>

          <Link href={`/projects/${nextProject.slug}`} className="group mt-8 flex flex-col text-inherit no-underline">
            <div className="relative aspect-video overflow-hidden rounded-[2px] [&>*]:!h-full">
              <ImageBlock
                tone={safeTone(nextProject.coverTone)}
                ratio="16/9"
                src={nextCoverImageUrl}
                style={{ height: '100%' }}
              />
              <div className="absolute inset-0 bg-[rgba(10,10,10,0.4)] transition-[background] duration-[400ms] group-hover:bg-[rgba(10,10,10,0.1)]" />
            </div>
            <div className="flex flex-col gap-2 pt-5">
              <TextReveal
                text={nextProject.title}
                as="h2"
                className="font-serif font-light text-[clamp(40px,5.5vw,88px)] leading-[0.92] tracking-[-0.02em] text-paper"
                stagger={0.04}
              />
              <span className="ll-mono small-cap text-paper/50">
                {nextProject.category} · {nextProject.year}
              </span>
            </div>
          </Link>

          <span className="ll-crosshair ll-crosshair--tl" aria-hidden />
          <span className="ll-crosshair ll-crosshair--br" aria-hidden />
        </section>
      )}

      {/* ── NAVIGATION ───────────────────────────────────────── */}
      <div className={`flex gap-8 border-t-[0.5px] border-paper/8 py-8 text-paper/50 ${PX}`}>
        <Link href="/projects" className="ll-link-rule text-paper/50">
          ← Todos os projetos
        </Link>
        {prevProject && (
          <Link href={`/projects/${prevProject.slug}`} className="ll-link-rule text-paper/50">
            ← {prevProject.title}
          </Link>
        )}
      </div>

    </div>
  )
}
