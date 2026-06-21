import { getDb, schema } from '@/lib/db'
import { eq, asc, inArray } from 'drizzle-orm'
import type { Metadata } from 'next'
import ProjectsClient from '@/components/portfolio/ProjectsClient'
import type { Project } from '@/lib/db/schema'
import { storage } from '@/lib/storage'

export const metadata: Metadata = {
  title: 'Projetos — Lucas Lobeu',
  description: 'Portfólio de direção audiovisual e fotografia.',
}

export type ProjectWithUrls = Project & {
  coverImageUrl?: string
  coverHoverImageUrl?: string
}

async function getProjects(): Promise<Project[]> {
  try {
    const db = getDb()
    return await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.status, 'published'))
      .orderBy(asc(schema.projects.sortOrder))
  } catch {
    return []
  }
}

async function resolveCoverUrls(projects: Project[]): Promise<Map<string, string>> {
  const ids = [
    ...new Set([
      ...projects.map(p => p.coverImageId),
      ...projects.map(p => (p as ProjectWithUrls & { coverHoverImageId?: string | null }).coverHoverImageId),
    ].filter((id): id is string => !!id)),
  ]
  if (ids.length === 0) return new Map()
  try {
    const db = getDb()
    const records = await db
      .select()
      .from(schema.media)
      .where(inArray(schema.media.id, ids))
    const map = new Map<string, string>()
    for (const r of records) map.set(r.id, storage.getUrl(r.path))
    return map
  } catch {
    return new Map()
  }
}

async function getSettings() {
  try {
    const db = getDb()
    const [row] = await db.select().from(schema.homeSettings).where(eq(schema.homeSettings.id, 1))
    return row ?? null
  } catch {
    return null
  }
}

const FALLBACK: Project[] = [
  { id: '1', slug: 'editorial-sp', title: 'Editorial SP', client: 'Marca A', year: '2025', category: 'Foto', role: 'Dir. Foto', summary: 'Uma coleção de imagens editoriais.', coverTone: 'mid', coverKind: 'tall', template: 'editorial', status: 'published', sortOrder: 0, body: '[]', credits: '[]', coverImageId: null, coverHoverImageId: null, metaTitle: null, metaDescription: null, createdAt: '', updatedAt: '' },
  { id: '2', slug: 'campanha-verao', title: 'Campanha Verão', client: 'Marca B', year: '2025', category: 'Filme', role: 'Direção', summary: 'Campanha audiovisual completa.', coverTone: 'dark', coverKind: 'wide', template: 'gallery', status: 'published', sortOrder: 1, body: '[]', credits: '[]', coverImageId: null, coverHoverImageId: null, metaTitle: null, metaDescription: null, createdAt: '', updatedAt: '' },
  { id: '3', slug: 'social-first', title: 'Social First', client: 'Marca C', year: '2024', category: 'Social', role: 'Produção', summary: 'Estratégia e conteúdo para redes.', coverTone: 'light', coverKind: 'square', template: 'editorial', status: 'published', sortOrder: 2, body: '[]', credits: '[]', coverImageId: null, coverHoverImageId: null, metaTitle: null, metaDescription: null, createdAt: '', updatedAt: '' },
]

export default async function ProjectsPage() {
  const [projects, settings] = await Promise.all([getProjects(), getSettings()])
  const base = projects.length > 0 ? projects : FALLBACK

  const urlMap = await resolveCoverUrls(base)

  const display: ProjectWithUrls[] = base.map(p => ({
    ...p,
    coverImageUrl: p.coverImageId ? urlMap.get(p.coverImageId) : undefined,
    coverHoverImageUrl: (p as ProjectWithUrls & { coverHoverImageId?: string | null }).coverHoverImageId
      ? urlMap.get((p as ProjectWithUrls & { coverHoverImageId?: string | null }).coverHoverImageId!)
      : undefined,
  }))

  return (
    <ProjectsClient
      projects={display}
      heroSub={settings?.projectsHeroSub ?? ''}
      manifestoText={settings?.projectsManifestoText ?? ''}
      manifestoImageUrl={settings?.projectsManifestoImageUrl ?? ''}
    />
  )
}
