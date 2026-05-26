import { NextRequest } from 'next/server'
import { getDb, schema } from '@/lib/db'
import { eq, ne, asc } from 'drizzle-orm'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const db = getDb()
  const [project] = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, id))

  if (!project) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(project)
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const db = getDb()

  const [existing] = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, id))

  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

  if (body.slug && body.slug !== existing.slug) {
    const [conflict] = await db
      .select({ id: schema.projects.id })
      .from(schema.projects)
      .where(eq(schema.projects.slug, body.slug))
    if (conflict) return Response.json({ error: 'Slug already in use' }, { status: 409 })
  }

  const allowedFields = [
    'slug', 'title', 'client', 'year', 'category', 'role', 'summary',
    'body', 'credits', 'coverImageId', 'coverTone', 'coverKind',
    'template', 'status', 'sortOrder', 'metaTitle', 'metaDescription',
  ] as const

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() }
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field]
  }

  const [updated] = await db
    .update(schema.projects)
    .set(updates)
    .where(eq(schema.projects.id, id))
    .returning()

  return Response.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const db = getDb()

  const [existing] = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, id))

  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

  await db.delete(schema.projects).where(eq(schema.projects.id, id))

  // Reorder remaining projects
  const remaining = await db
    .select()
    .from(schema.projects)
    .where(ne(schema.projects.id, id))
    .orderBy(asc(schema.projects.sortOrder))

  for (let i = 0; i < remaining.length; i++) {
    await db
      .update(schema.projects)
      .set({ sortOrder: i })
      .where(eq(schema.projects.id, remaining[i].id))
  }

  return Response.json({ success: true })
}
