import { getDb, schema } from '@/lib/db'
import { desc } from 'drizzle-orm'
import type { JournalEntry } from '@/lib/db/schema'
import type { Metadata } from 'next'
import JournalClient from '@/components/portfolio/JournalClient'

export const metadata: Metadata = {
  title: 'Diário — Lucas Lobeu',
  description: 'Notas, reflexões e bastidores de processo.',
}

async function getEntries(): Promise<JournalEntry[]> {
  try {
    const db = getDb()
    return await db.select().from(schema.journal).orderBy(desc(schema.journal.publishedAt))
  } catch {
    return []
  }
}

const FALLBACK_ENTRIES: JournalEntry[] = [
  {
    id: '1',
    slug: 'sobre-o-caderno',
    title: 'Sobre o caderno que precede a câmera',
    excerpt: 'Toda imagem boa tem um peso antes de ter uma forma. Isso é o que tento capturar aqui.',
    content: '',
    readTime: '4 min',
    publishedAt: '2026-03-15',
    createdAt: '2026-03-15',
    imageId: null,
  },
  {
    id: '2',
    slug: 'luz-natural-inverno',
    title: 'O que a luz natural de inverno ensina',
    excerpt: 'Fotografar no inverno paulistano tem uma qualidade que nenhum estúdio consegue replicar.',
    content: '',
    readTime: '3 min',
    publishedAt: '2026-02-08',
    createdAt: '2026-02-08',
    imageId: null,
  },
  {
    id: '3',
    slug: 'metodo-editorial',
    title: 'Por que todo projeto começa por um briefing editorial',
    excerpt: 'Antes de qualquer câmera ligada, o projeto precisa existir em palavras.',
    content: '',
    readTime: '6 min',
    publishedAt: '2026-01-22',
    createdAt: '2026-01-22',
    imageId: null,
  },
]

export default async function JournalPage() {
  const entries = await getEntries()
  const display = entries.length > 0 ? entries : FALLBACK_ENTRIES
  return <JournalClient entries={display} />
}
