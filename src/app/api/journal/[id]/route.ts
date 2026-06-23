import { NextRequest } from 'next/server'
import { getDb, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const db = getDb()
  const [entry] = await db
    .select()
    .from(schema.journal)
    .where(eq(schema.journal.id, id))

  if (!entry) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(entry)
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const db = getDb()

  const [existing] = await db
    .select()
    .from(schema.journal)
    .where(eq(schema.journal.id, id))

  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

  if (body.slug && body.slug !== existing.slug) {
    const [conflict] = await db
      .select({ id: schema.journal.id })
      .from(schema.journal)
      .where(eq(schema.journal.slug, body.slug))
    if (conflict) return Response.json({ error: 'Slug already in use' }, { status: 409 })
  }

  const allowedFields = ['slug', 'title', 'excerpt', 'content', 'imageId', 'readTime', 'publishedAt'] as const
  const updates: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field]
  }

  const [updated] = await db
    .update(schema.journal)
    .set(updates)
    .where(eq(schema.journal.id, id))
    .returning()

  return Response.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const db = getDb()

  const [existing] = await db
    .select({ id: schema.journal.id })
    .from(schema.journal)
    .where(eq(schema.journal.id, id))

  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

  await db.delete(schema.journal).where(eq(schema.journal.id, id))
  return Response.json({ success: true })
}
