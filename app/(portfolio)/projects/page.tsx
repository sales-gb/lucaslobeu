import { getDb, schema } from '@/lib/db'
import { eq, asc } from 'drizzle-orm'
import type { Metadata } from 'next'
import ProjectsClient from '@/components/portfolio/ProjectsClient'
import type { Project } from '@/lib/db/schema'

export const metadata: Metadata = {
  title: 'Projetos — Lucas Lobeu',
  description: 'Portfólio de direção audiovisual e fotografia.',
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

const FALLBACK: Project[] = [
  { id: '1', slug: 'editorial-sp', title: 'Editorial SP', client: 'Marca A', year: '2025', category: 'Foto', role: 'Dir. Foto', summary: 'Uma coleção de imagens editoriais.', coverTone: 'mid', coverKind: 'tall', template: 'editorial', status: 'published', sortOrder: 0, body: '[]', credits: '[]', coverImageId: null, metaTitle: null, metaDescription: null, createdAt: '', updatedAt: '' },
  { id: '2', slug: 'campanha-verao', title: 'Campanha Verão', client: 'Marca B', year: '2025', category: 'Filme', role: 'Direção', summary: 'Campanha audiovisual completa.', coverTone: 'dark', coverKind: 'wide', template: 'gallery', status: 'published', sortOrder: 1, body: '[]', credits: '[]', coverImageId: null, metaTitle: null, metaDescription: null, createdAt: '', updatedAt: '' },
  { id: '3', slug: 'social-first', title: 'Social First', client: 'Marca C', year: '2024', category: 'Social', role: 'Produção', summary: 'Estratégia e conteúdo para redes.', coverTone: 'light', coverKind: 'square', template: 'editorial', status: 'published', sortOrder: 2, body: '[]', credits: '[]', coverImageId: null, metaTitle: null, metaDescription: null, createdAt: '', updatedAt: '' },
  { id: '4', slug: 'identidade-visual', title: 'Identidade Visual', client: 'Marca D', year: '2024', category: 'Foto', role: 'Fotografia', summary: '', coverTone: 'mid', coverKind: 'tall', template: 'longform', status: 'published', sortOrder: 3, body: '[]', credits: '[]', coverImageId: null, metaTitle: null, metaDescription: null, createdAt: '', updatedAt: '' },
  { id: '5', slug: 'documentario', title: 'Documentário', client: 'Marca E', year: '2023', category: 'Filme', role: 'Direção', summary: '', coverTone: 'dark', coverKind: 'wide', template: 'gallery', status: 'published', sortOrder: 4, body: '[]', credits: '[]', coverImageId: null, metaTitle: null, metaDescription: null, createdAt: '', updatedAt: '' },
  { id: '6', slug: 'marca-premium', title: 'Marca Premium', client: 'Marca F', year: '2023', category: 'Foto', role: 'Dir. Arte', summary: '', coverTone: 'light', coverKind: 'tall', template: 'editorial', status: 'published', sortOrder: 5, body: '[]', credits: '[]', coverImageId: null, metaTitle: null, metaDescription: null, createdAt: '', updatedAt: '' },
]

export default async function ProjectsPage() {
  const projects = await getProjects()
  const display = projects.length > 0 ? projects : FALLBACK
  return <ProjectsClient projects={display} />
}
