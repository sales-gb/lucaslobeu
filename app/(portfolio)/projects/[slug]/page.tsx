import { getDb, schema } from '@/lib/db'
import { eq, asc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Project } from '@/lib/db/schema'
import { storage } from '@/lib/storage'
import ProjectDetailClient from '@/components/portfolio/ProjectDetailClient'

// ── Data fetching ────────────────────────────────────────────────

async function getProject(slug: string): Promise<Project | null> {
  try {
    const db = getDb()
    const [project] = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.slug, slug))
      .limit(1)
    return project ?? null
  } catch {
    return null
  }
}

async function getCoverImageUrl(coverImageId: string | null): Promise<string | undefined> {
  if (!coverImageId) return undefined
  try {
    const db = getDb()
    const [record] = await db
      .select()
      .from(schema.media)
      .where(eq(schema.media.id, coverImageId))
      .limit(1)
    return record ? storage.getUrl(record.path) : undefined
  } catch {
    return undefined
  }
}

async function getSiblings(slug: string): Promise<{ prev: Project | null; next: Project | null }> {
  try {
    const db = getDb()
    const all = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.status, 'published'))
      .orderBy(asc(schema.projects.sortOrder))
    const idx = all.findIndex((p) => p.slug === slug)
    return {
      prev: idx > 0 ? all[idx - 1] : null,
      next: idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null,
    }
  } catch {
    return { prev: null, next: null }
  }
}

export async function generateStaticParams() {
  try {
    const db = getDb()
    const projects = await db
      .select({ slug: schema.projects.slug })
      .from(schema.projects)
      .where(eq(schema.projects.status, 'published'))
    return projects.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) return { title: 'Projeto não encontrado' }
  return {
    title: project.metaTitle ?? `${project.title} — Lucas Lobeu`,
    description: project.metaDescription ?? project.summary,
  }
}

// ── Page ─────────────────────────────────────────────────────────

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()

  const [{ prev, next }, coverImageUrl] = await Promise.all([
    getSiblings(slug),
    getCoverImageUrl(project.coverImageId),
  ])

  const nextCoverImageUrl = next ? await getCoverImageUrl(next.coverImageId) : undefined

  return (
    <ProjectDetailClient
      project={project}
      nextProject={next}
      prevProject={prev}
      coverImageUrl={coverImageUrl}
      nextCoverImageUrl={nextCoverImageUrl}
    />
  )
}
