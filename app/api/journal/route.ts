import { NextRequest } from 'next/server'
import { getDb, schema } from '@/lib/db'
import { desc, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const rows = await db
    .select()
    .from(schema.journal)
    .orderBy(desc(schema.journal.publishedAt))

  return Response.json(rows)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { slug, title, excerpt } = body

  if (!slug || !title || !excerpt) {
    return Response.json({ error: 'slug, title, and excerpt are required' }, { status: 400 })
  }

  const db = getDb()
  const [existing] = await db
    .select({ id: schema.journal.id })
    .from(schema.journal)
    .where(eq(schema.journal.slug, slug))

  if (existing) {
    return Response.json({ error: 'Slug already exists' }, { status: 409 })
  }

  const [entry] = await db
    .insert(schema.journal)
    .values({
      slug,
      title,
      excerpt,
      content: body.content ?? '',
      imageId: body.imageId ?? null,
      readTime: body.readTime ?? '3 min',
      publishedAt: body.publishedAt ?? new Date().toISOString(),
    })
    .returning()

  return Response.json(entry, { status: 201 })
}
