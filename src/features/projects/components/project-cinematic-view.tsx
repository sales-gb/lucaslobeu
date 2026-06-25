'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import Reveal from '@/components/ui/reveal';
import TextReveal from '@/components/ui/text-reveal';
import ImageBlock from '@/components/ui/image-block';
import { Eyebrow } from '@/components/ui/eyebrow';
import { SectionMarker } from '@/components/ui/section-marker';
import { FlowButton } from '@/components/ui/flow-button';
import { VideoEmbed, isVideoEmbedUrl } from '@/components/ui/video-embed';
import { Lightbox } from '@/components/ui/lightbox';
import { CtaSection } from '@/features/home/components/cta-section';
import type { Project } from '@/lib/db/schema';

const EASE = [0.22, 1, 0.36, 1] as const;
const PX = 'px-[var(--page-x)]';

// ─── Tipos dos blocos do corpo (espelha o editor + 'break') ───────────────
type ImageSlot = { imageUrl?: string; ratio?: string; caption?: string };
type ContentBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'quote'; text: string; attribution?: string }
  | { kind: 'image'; imageUrl?: string; ratio?: string; caption?: string }
  | { kind: 'image-pair'; items: ImageSlot[] }
  | { kind: 'image-trio'; items: ImageSlot[] }
  | { kind: 'image-grid'; cols?: number; items: ImageSlot[] }
  | { kind: 'video'; url: string; caption?: string }
  | { kind: 'break'; imageUrl?: string; url?: string; text?: string; caption?: string };

type Media = { type: 'image'; url: string; caption?: string } | { type: 'video'; url: string };

type CreditRow = [string, string];

function flattenMedia(block: ContentBlock): Media[] {
  switch (block.kind) {
    case 'image':
      return block.imageUrl ? [{ type: 'image', url: block.imageUrl, caption: block.caption }] : [];
    case 'image-pair':
    case 'image-trio':
    case 'image-grid':
      return (block.items ?? [])
        .filter((i) => i.imageUrl)
        .map((i) => ({ type: 'image' as const, url: i.imageUrl as string, caption: i.caption }));
    case 'video':
      return block.url ? [{ type: 'video', url: block.url }] : [];
    default:
      return [];
  }
}

// ─── View ─────────────────────────────────────────────────────────────────
interface Props {
  project: Project;
  next: Project | null;
  coverImageUrl?: string;
  nextCoverImageUrl?: string;
}

export default function ProjectCinematicView({
  project,
  next,
  coverImageUrl,
  nextCoverImageUrl,
}: Props) {
  const [lbIndex, setLbIndex] = useState<number | null>(null);

  let blocks: ContentBlock[] = [];
  let credits: CreditRow[] = [];
  try {
    const b = JSON.parse(project.body);
    if (Array.isArray(b)) blocks = b as ContentBlock[];
  } catch {}
  try {
    const c = JSON.parse(project.credits);
    if (Array.isArray(c)) credits = c as CreditRow[];
  } catch {}

  // Descrição = parágrafos do corpo.
  const paragraphs = blocks
    .filter((b): b is Extract<ContentBlock, { kind: 'paragraph' }> => b.kind === 'paragraph')
    .map((b) => b.text)
    .filter(Boolean);

  // Quebra opcional: divide a mídia em "galeria" (antes) e "grid 2×2" (depois).
  const breakIdx = blocks.findIndex((b) => b.kind === 'break');
  const breakBlock = breakIdx >= 0 ? (blocks[breakIdx] as Extract<ContentBlock, { kind: 'break' }>) : null;
  const beforeBlocks = breakIdx >= 0 ? blocks.slice(0, breakIdx) : blocks;
  const afterBlocks = breakIdx >= 0 ? blocks.slice(breakIdx + 1) : [];

  const galleryMedia = beforeBlocks.flatMap(flattenMedia);
  const gridMedia = afterBlocks.flatMap(flattenMedia).filter((m) => m.type === 'image').slice(0, 4);

  // Lista única de imagens (galeria + grid) para o lightbox.
  const lightboxImages = [...galleryMedia, ...gridMedia]
    .filter((m) => m.type === 'image')
    .map((m) => m.url);
  const lbOf = (url: string) => lightboxImages.indexOf(url);

  const metaRows = [
    { label: 'Cliente', value: project.client },
    { label: 'Papel', value: project.role },
    { label: 'Ano', value: project.year },
    { label: 'Categoria', value: project.category },
    ...credits.map(([role, name]) => ({ label: role, value: name })),
  ].filter((r) => r.value);

  return (
    <div className="bg-ink text-paper">
      {/* ── HERO (sticky, blur) — coberto pela descrição ao rolar ─────── */}
      <section className="sticky top-0 z-0 -mt-[72px] flex h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className="scale-110 object-cover blur-[6px] brightness-[0.55]"
            />
          ) : (
            <div className="absolute inset-0 bg-ink-soft" />
          )}
          <div className="absolute inset-0 bg-ink/30" />
        </div>
        <div className="relative z-[1] flex flex-col items-center gap-6 px-6 text-center">
          <Reveal y={0}>
            <Eyebrow className="text-paper/55">{project.category} · {project.year}</Eyebrow>
          </Reveal>
          <TextReveal
            text={project.title}
            as="h1"
            className="font-serif font-light text-[clamp(56px,11vw,200px)] leading-[0.9] tracking-[-0.03em] text-paper"
            delay={80}
            stagger={0.04}
          />
        </div>
        <span className="absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">
          Role para descobrir
        </span>
      </section>

      {/* ── CONTEÚDO (z-10, cobre o hero) ─────────────────────────────── */}
      <div className="relative z-10 bg-ink">
        {/* Descrição enfática */}
        {(paragraphs.length > 0 || project.summary) && (
          <section className={`border-t-[0.5px] border-paper/8 py-[clamp(80px,14vh,180px)] ${PX}`}>
            <Reveal y={0}>
              <SectionMarker eyebrowClassName="text-paper/40">O projeto</SectionMarker>
            </Reveal>
            <div className="mt-10 max-w-[1100px]">
              {(paragraphs.length > 0 ? paragraphs : [project.summary ?? '']).map((p, i) => (
                <Reveal key={i} y={20} delay={i * 80}>
                  <p className="font-serif font-light text-[clamp(24px,3.6vw,52px)] leading-[1.2] tracking-[-0.015em] text-paper/[0.9] [&:not(:first-child)]:mt-10">
                    {p}
                  </p>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Stats sticky (esq) + galeria rolando (dir) */}
        <section
          className={`grid grid-cols-[minmax(260px,4fr)_8fr] items-start gap-16 border-t-[0.5px] border-paper/8 py-[100px] ${PX} max-[900px]:grid-cols-1 max-[900px]:gap-10`}
        >
          <div className="sticky top-[110px] flex flex-col gap-10 self-start max-[900px]:static">
            <div>
              <SectionMarker eyebrowClassName="text-paper/40">Informações</SectionMarker>
              <div className="mt-6 flex w-full flex-col border-t-[0.5px] border-paper/8">
                {metaRows.map((item) => (
                  <div key={item.label} className="grid grid-cols-2 items-baseline gap-4 border-b-[0.5px] border-paper/8 py-[14px]">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/[0.32]">{item.label}</span>
                    <span className="text-right font-mono text-[11px] uppercase tracking-[0.14em] text-paper/70">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <FlowButton text="Iniciar um projeto" href="/contact" />
          </div>

          <div className="flex flex-col gap-6">
            {galleryMedia.map((m, i) =>
              m.type === 'video' ? (
                <Reveal key={i} y={24} className="overflow-hidden rounded-[2px]">
                  <VideoEmbed url={m.url} />
                </Reveal>
              ) : (
                <Reveal key={i} y={24}>
                  <button
                    type="button"
                    className="group block w-full overflow-hidden rounded-[2px]"
                    onClick={() => setLbIndex(lbOf(m.url))}
                    aria-label="Abrir imagem em tela cheia"
                  >
                    <div className="transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]">
                      <Image
                        src={m.url}
                        alt={m.caption ?? ''}
                        width={1600}
                        height={1067}
                        sizes="(max-width: 900px) 100vw, 66vw"
                        className="h-auto w-full"
                      />
                    </div>
                  </button>
                  {m.caption && (
                    <span className="ll-mono small-cap mt-3 block text-paper/45" style={{ fontSize: 11 }}>
                      {m.caption}
                    </span>
                  )}
                </Reveal>
              ),
            )}
          </div>
        </section>

        {/* Quebra opcional — tela cheia (imagem / vídeo / texto) */}
        {breakBlock && <BreakSection block={breakBlock} />}

        {/* Assinatura (esq) + grid 2×2 (dir) — só com quebra */}
        {breakBlock && gridMedia.length > 0 && (
          <section
            className={`grid grid-cols-[minmax(260px,4fr)_8fr] items-start gap-16 border-t-[0.5px] border-paper/8 py-[100px] ${PX} max-[900px]:grid-cols-1 max-[900px]:gap-10`}
          >
            <div className="sticky top-[110px] flex flex-col gap-4 self-start max-[900px]:static">
              <SectionMarker eyebrowClassName="text-paper/40">Assinatura</SectionMarker>
              <span className="font-serif font-light text-[clamp(30px,3vw,48px)] leading-[1.05] tracking-[-0.02em] text-paper">
                Lucas Lobeu
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper/45">
                {project.role || 'Direção & Fotografia'} · {project.year}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
              {gridMedia.map((m, i) => (
                <Reveal key={i} y={24} delay={(i % 2) * 70}>
                  <button
                    type="button"
                    className="group block w-full overflow-hidden rounded-[2px]"
                    onClick={() => setLbIndex(lbOf(m.url))}
                    aria-label="Abrir imagem em tela cheia"
                  >
                    <div className="transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]">
                      <ImageBlock ratio="1/1" src={m.url} style={{ height: '100%' }} />
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Card do próximo projeto */}
        {next && (
          <section className={`border-t-[0.5px] border-paper/8 py-[100px] ${PX}`}>
            <Reveal y={0}>
              <SectionMarker eyebrowClassName="text-paper/40">Próximo projeto</SectionMarker>
            </Reveal>
            <Link href={`/projects/${next.slug}`} className="group mt-8 flex flex-col text-inherit no-underline">
              <div className="relative aspect-[16/7] overflow-hidden rounded-[2px] [&>*]:!h-full">
                <ImageBlock ratio="16/7" src={nextCoverImageUrl} style={{ height: '100%' }} />
                <div className="absolute inset-0 bg-[rgba(10,10,10,0.45)] transition-[background] duration-[400ms] group-hover:bg-[rgba(10,10,10,0.15)]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
                  <TextReveal
                    text={next.title}
                    as="h2"
                    className="font-serif font-light text-[clamp(40px,6vw,96px)] leading-[0.92] tracking-[-0.02em] text-paper"
                    stagger={0.04}
                  />
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper/60">
                    {next.category} · {next.year}
                  </span>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* CTA padrão (Footer vem do layout) */}
        <CtaSection
          headline="Vamos criar algo memorável?"
          sub="O estúdio aceita três a quatro projetos por trimestre. Conte sobre o seu."
        />
      </div>

      <Lightbox
        images={lightboxImages}
        index={lbIndex}
        onClose={() => setLbIndex(null)}
        onIndex={setLbIndex}
      />
    </div>
  );
}

// ─── Quebra: seção tela cheia ───────────────────────────────────────────────
function BreakSection({ block }: { block: Extract<ContentBlock, { kind: 'break' }> }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  const isVideo = isVideoEmbedUrl(block.url);
  const hasImage = !isVideo && !!block.imageUrl;
  const hasText = !isVideo && !hasImage && !!block.text;

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden bg-ink">
      {isVideo ? (
        <VideoEmbed url={block.url!} title="Destaque" background />
      ) : hasImage ? (
        <motion.div className="absolute inset-0 will-change-transform" style={{ y, scale: 1.12 }}>
          <Image src={block.imageUrl!} alt="" fill priority sizes="100vw" className="object-cover" />
        </motion.div>
      ) : hasText ? (
        <div className="flex h-full items-center justify-center px-[var(--page-x)]">
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20%' }}
            transition={{ duration: 0.9, ease: EASE }}
            className="max-w-[1100px] text-center font-serif font-light italic text-[clamp(32px,6vw,96px)] leading-[1.05] tracking-[-0.02em] text-paper"
          >
            {block.text}
          </motion.p>
        </div>
      ) : null}

      {(hasImage || isVideo) && block.caption && (
        <span className="absolute bottom-8 left-[var(--page-x)] z-[2] font-mono text-[11px] uppercase tracking-[0.16em] text-paper/70 [mix-blend-mode:difference]">
          {block.caption}
        </span>
      )}
    </section>
  );
}
