import { getDb, schema } from '@/lib/db'
import { eq, asc } from 'drizzle-orm'
import Link from 'next/link'
import Reveal from '@/components/portfolio/Reveal'
import ImageBlock from '@/components/portfolio/ImageBlock'
import HomeClient from '@/components/portfolio/HomeClient'

async function getData() {
  try {
    const db = getDb()
    const [settings] = await db
      .select()
      .from(schema.homeSettings)
      .where(eq(schema.homeSettings.id, 1))
      .limit(1)
    const featuredProjects = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.status, 'published'))
      .orderBy(asc(schema.projects.sortOrder))
      .limit(5)
    return { settings, featuredProjects }
  } catch {
    return { settings: null, featuredProjects: [] }
  }
}

const defaultManifesto =
  'Cada projeto começa por um caderno. A maior parte dele acontece antes da câmera ser acionada. O resto é só obediência ao plano.'
const defaultCTA = 'Tem um projeto?'
const defaultSub = 'O estúdio aceita três a quatro projetos por trimestre.'

const FALLBACK_PROJECTS = [
  { id: '1', slug: 'editorial-sp', title: 'Editorial SP', client: 'Marca A', year: '2025', category: 'Foto', role: 'Dir. Foto', summary: '', coverTone: 'mid', status: 'published', sortOrder: 0, coverKind: 'tall', template: 'editorial', body: '[]', credits: '[]', coverImageId: null, metaTitle: null, metaDescription: null, createdAt: '', updatedAt: '' },
  { id: '2', slug: 'campanha-verao', title: 'Campanha Verão', client: 'Marca B', year: '2025', category: 'Filme', role: 'Direção', summary: '', coverTone: 'dark', status: 'published', sortOrder: 1, coverKind: 'wide', template: 'gallery', body: '[]', credits: '[]', coverImageId: null, metaTitle: null, metaDescription: null, createdAt: '', updatedAt: '' },
  { id: '3', slug: 'social-first', title: 'Social First', client: 'Marca C', year: '2024', category: 'Social', role: 'Produção', summary: '', coverTone: 'light', status: 'published', sortOrder: 2, coverKind: 'square', template: 'editorial', body: '[]', credits: '[]', coverImageId: null, metaTitle: null, metaDescription: null, createdAt: '', updatedAt: '' },
  { id: '4', slug: 'documentario', title: 'Documentário', client: 'Marca D', year: '2023', category: 'Filme', role: 'Direção', summary: '', coverTone: 'mid', status: 'published', sortOrder: 3, coverKind: 'tall', template: 'gallery', body: '[]', credits: '[]', coverImageId: null, metaTitle: null, metaDescription: null, createdAt: '', updatedAt: '' },
]

export default async function HomePage() {
  const { settings, featuredProjects } = await getData()

  const manifestoText = settings?.manifestoText ?? defaultManifesto
  const ctaHeadline = settings?.ctaHeadline ?? defaultCTA
  const ctaSub = settings?.ctaSub ?? defaultSub
  const projects = featuredProjects.length > 0 ? featuredProjects : FALLBACK_PROJECTS

  return (
    <HomeClient
      projects={projects}
      manifestoText={manifestoText}
      ctaHeadline={ctaHeadline}
      ctaSub={ctaSub}
    />
  )
}
