import { getDb, schema } from '@/lib/db';
import { eq, asc, ne } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Reveal from '@/components/portfolio/Reveal';
import ImageBlock from '@/components/portfolio/ImageBlock';
import type { Project } from '@/lib/db/schema';
import type { Metadata } from 'next';

// ── Types ────────────────────────────────────────────────────
type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'image'; tone?: string; ratio?: string; caption?: string }
  | { type: 'image-pair'; items: Array<{ tone?: string; ratio?: string; caption?: string }> }
  | { type: 'image-trio'; items: Array<{ tone?: string; ratio?: string; caption?: string }> }
  | { type: 'image-grid'; cols?: number; items: Array<{ tone?: string; ratio?: string }> };

type CreditRow = [string, string];

// ── Data fetching ────────────────────────────────────────────
async function getProject(slug: string): Promise<Project | null> {
  try {
    const db = getDb();
    const [project] = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.slug, slug))
      .limit(1);
    return project ?? null;
  } catch {
    return null;
  }
}

async function getSiblings(slug: string): Promise<{ prev: Project | null; next: Project | null }> {
  try {
    const db = getDb();
    const all = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.status, 'published'))
      .orderBy(asc(schema.projects.sortOrder));
    const idx = all.findIndex((p) => p.slug === slug);
    return {
      prev: idx > 0 ? all[idx - 1] : null,
      next: idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null,
    };
  } catch {
    return { prev: null, next: null };
  }
}

export async function generateStaticParams() {
  try {
    const db = getDb();
    const projects = await db
      .select({ slug: schema.projects.slug })
      .from(schema.projects)
      .where(eq(schema.projects.status, 'published'));
    return projects.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: 'Projeto não encontrado' };
  return {
    title: project.metaTitle ?? `${project.title} — Lucas Lobeu`,
    description: project.metaDescription ?? project.summary,
  };
}

// ── Body Blocks Renderer ─────────────────────────────────────
function BodyBlock({ block }: { block: ContentBlock }) {
  const tone = (t?: string): 'light' | 'mid' | 'dark' =>
    (t === 'light' || t === 'mid' || t === 'dark') ? t : 'mid';

  switch (block.type) {
    case 'paragraph':
      return (
        <div className="ll-block--paragraph">
          <p className="ll-body ll-body--large">{block.text}</p>
        </div>
      );
    case 'quote':
      return (
        <div className="ll-block--quote">
          <span className="ll-dot" />
          <blockquote className="ll-quote">{block.text}</blockquote>
          {block.attribution && (
            <cite className="ll-eyebrow">{block.attribution}</cite>
          )}
        </div>
      );
    case 'image':
      return (
        <div className="ll-block--image">
          <ImageBlock tone={tone(block.tone)} ratio={block.ratio ?? '16/9'} caption={block.caption} />
        </div>
      );
    case 'image-pair':
      return (
        <div className="ll-block--pair">
          {block.items.map((item, i) => (
            <ImageBlock key={i} tone={tone(item.tone)} ratio={item.ratio ?? '3/4'} caption={item.caption} />
          ))}
        </div>
      );
    case 'image-trio':
      return (
        <div className="ll-block--trio">
          {block.items.map((item, i) => (
            <ImageBlock key={i} tone={tone(item.tone)} ratio={item.ratio ?? '1/1'} caption={item.caption} />
          ))}
        </div>
      );
    case 'image-grid': {
      const cols = block.cols ?? 2;
      return (
        <div className="ll-block--grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {block.items.map((item, i) => (
            <ImageBlock key={i} tone={tone(item.tone)} ratio={item.ratio ?? '1/1'} />
          ))}
        </div>
      );
    }
    default:
      return null;
  }
}

// ── Templates ────────────────────────────────────────────────
function EditorialTemplate({ project, blocks, credits }: {
  project: Project;
  blocks: ContentBlock[];
  credits: CreditRow[];
}) {
  const tone = (project.coverTone as 'light' | 'mid' | 'dark') ?? 'mid';

  return (
    <>
      <div className="ll-project-hero">
        <div className="ll-project-meta">
          <span className="ll-eyebrow">{project.category}</span>
          <span className="ll-eyebrow muted">{project.year}</span>
        </div>
        <Reveal y={40}>
          <h1 className="ll-project-title">{project.title}</h1>
        </Reveal>
        <Reveal y={20} delay={80}>
          <p className="ll-project-summary">{project.summary}</p>
        </Reveal>
        <div className="ll-project-info-bar">
          {[
            { label: 'Cliente', value: project.client },
            { label: 'Ano', value: project.year },
            { label: 'Categoria', value: project.category },
            { label: 'Papel', value: project.role },
          ].map((item) => (
            <div key={item.label}>
              <div className="ll-eyebrow">{item.label}</div>
              <div>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="ll-project-cover">
        <ImageBlock tone={tone} ratio="16/9" />
      </div>

      <div className="ll-project-body">
        {blocks.map((block, i) => (
          <Reveal key={i} y={20} delay={i * 30}>
            <BodyBlock block={block} />
          </Reveal>
        ))}
      </div>
    </>
  );
}

function GalleryTemplate({ project, blocks, credits }: {
  project: Project;
  blocks: ContentBlock[];
  credits: CreditRow[];
}) {
  const tone = (project.coverTone as 'light' | 'mid' | 'dark') ?? 'mid';

  return (
    <>
      <div className="ll-project-hero--gallery">
        <ImageBlock tone={tone} ratio="21/9" />
        <div className="ll-project-gallery-overlay">
          <span className="ll-eyebrow" style={{ color: 'inherit' }}>{project.category} · {project.year}</span>
          <h1 className="ll-project-title ll-project-title--overlay">{project.title}</h1>
        </div>
      </div>

      <div className="ll-project-gallery-text">
        <Reveal y={20}>
          <p className="ll-project-summary">{project.summary}</p>
        </Reveal>
        <Reveal y={20} delay={60}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { label: 'Cliente', value: project.client },
              { label: 'Papel', value: project.role },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="ll-eyebrow">{item.label}</span>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="ll-project-body ll-project-body--gallery">
        {blocks.map((block, i) => (
          <Reveal key={i} y={20} delay={i * 30}>
            <BodyBlock block={block} />
          </Reveal>
        ))}
      </div>
    </>
  );
}

function LongformTemplate({ project, blocks, credits }: {
  project: Project;
  blocks: ContentBlock[];
  credits: CreditRow[];
}) {
  const tone = (project.coverTone as 'light' | 'mid' | 'dark') ?? 'mid';

  return (
    <>
      <div className="ll-project-hero">
        <div className="ll-project-meta">
          <span className="ll-eyebrow">{project.category}</span>
          <span className="ll-eyebrow muted">{project.year}</span>
        </div>
        <Reveal y={40}>
          <h1 className="ll-project-title ll-project-title--longform">{project.title}</h1>
        </Reveal>
      </div>

      <div className="ll-project-longform-grid">
        <aside>
          <div className="ll-project-longform-aside-stuck">
            {[
              { label: 'Cliente', value: project.client },
              { label: 'Ano', value: project.year },
              { label: 'Categoria', value: project.category },
              { label: 'Papel', value: project.role },
            ].map((item) => (
              <div key={item.label} className="ll-project-aside-block">
                <div className="ll-eyebrow">{item.label}</div>
                <div>{item.value}</div>
              </div>
            ))}

            {credits.length > 0 && (
              <>
                <div className="ll-rule" />
                {credits.map(([role, name]) => (
                  <div key={role} className="ll-project-aside-block">
                    <div className="ll-eyebrow">{role}</div>
                    <div>{name}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </aside>

        <div className="ll-project-longform-flow">
          <Reveal y={20}>
            <p className="ll-project-summary">{project.summary}</p>
          </Reveal>
          <ImageBlock tone={tone} ratio="16/9" />
          {blocks.map((block, i) => (
            <Reveal key={i} y={20} delay={i * 30}>
              <BodyBlock block={block} />
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Credits & Pagination ─────────────────────────────────────
function Credits({ credits }: { credits: CreditRow[] }) {
  if (credits.length === 0) return null;
  return (
    <div className="ll-project-credits">
      <div>
        <span className="ll-eyebrow">Créditos</span>
      </div>
      <div className="ll-project-credits-list">
        {credits.map(([role, name]) => (
          <div key={role} className="ll-project-credits-row">
            <div className="ll-eyebrow">{role}</div>
            <div>{name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Pagination({ prev, next }: { prev: Project | null; next: Project | null }) {
  return (
    <div className="ll-project-pagination">
      <div className="ll-pag-link">
        {prev && (
          <Link href={`/projects/${prev.slug}`}>
            <div className="ll-eyebrow muted">← Anterior</div>
            <div className="ll-pag-title">{prev.title}</div>
          </Link>
        )}
      </div>
      <Link href="/projects" className="ll-eyebrow">Todos os projetos</Link>
      <div className="ll-pag-link ll-pag-link--next">
        {next && (
          <Link href={`/projects/${next.slug}`}>
            <div className="ll-eyebrow muted">Próximo →</div>
            <div className="ll-pag-title">{next.title}</div>
          </Link>
        )}
      </div>
    </div>
  );
}

import ProjectDetailClient from '@/components/portfolio/ProjectDetailClient';

// ── Page ─────────────────────────────────────────────────────
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const { prev, next } = await getSiblings(slug);

  return (
    <ProjectDetailClient project={project} nextProject={next} prevProject={prev} />
  );
}
