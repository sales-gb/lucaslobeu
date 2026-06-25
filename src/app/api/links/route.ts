import { NextRequest } from 'next/server'
import { getDb, schema } from '@/lib/db'
import { asc, desc, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const rows = await db
    .select()
    .from(schema.links)
    .orderBy(asc(schema.links.sortOrder))

  return Response.json(rows)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { label, href } = body

  if (!label || !href) {
    return Response.json({ error: 'label and href are required' }, { status: 400 })
  }

  const validKinds = ['primary', 'social', 'contact']
  if (body.kind && !validKinds.includes(body.kind)) {
    return Response.json({ error: 'Invalid kind' }, { status: 400 })
  }

  const db = await getDb()
  const [maxOrder] = await db
    .select({ sortOrder: schema.links.sortOrder })
    .from(schema.links)
    .orderBy(desc(schema.links.sortOrder))
    .limit(1)

  const nextOrder = maxOrder ? maxOrder.sortOrder + 1 : 0

  const [link] = await db
    .insert(schema.links)
    .values({
      label,
      href,
      kind: body.kind ?? 'primary',
      enabled: body.enabled ?? true,
      sortOrder: nextOrder,
    })
    .returning()

  return Response.json(link, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  if (Array.isArray(body.order)) {
    const db = await getDb()
    for (let i = 0; i < body.order.length; i++) {
      await db
        .update(schema.links)
        .set({ sortOrder: i })
        .where(eq(schema.links.id, body.order[i]))
    }
    return Response.json({ success: true })
  }

  // Single link update: { id, label?, href?, kind?, enabled? }
  if (body.id) {
    const db = await getDb()
    const [existing] = await db.select().from(schema.links).where(eq(schema.links.id, body.id))
    if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

    const allowedFields = ['label', 'href', 'kind', 'enabled'] as const
    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) updates[field] = body[field]
    }

    const [updated] = await db.update(schema.links).set(updates).where(eq(schema.links.id, body.id)).returning()
    return Response.json(updated)
  }

  return Response.json({ error: 'Invalid payload' }, { status: 400 })
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  const db = await getDb()
  const [existing] = await db.select({ id: schema.links.id }).from(schema.links).where(eq(schema.links.id, id))
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

  await db.delete(schema.links).where(eq(schema.links.id, id))
  return Response.json({ success: true })
}
