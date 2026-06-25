import { NextRequest } from 'next/server'
import { getDb, schema } from '@/lib/db'
import { asc, desc, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'

// Campos editáveis de um cliente (além de name).
const FIELDS = ['name', 'year', 'category', 'imageUrl', 'instagramUrl'] as const

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const rows = await db
    .select()
    .from(schema.clients)
    .orderBy(asc(schema.clients.sortOrder))

  return Response.json(rows)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) return Response.json({ error: 'name is required' }, { status: 400 })

  const db = getDb()
  const [maxOrder] = await db
    .select({ sortOrder: schema.clients.sortOrder })
    .from(schema.clients)
    .orderBy(desc(schema.clients.sortOrder))
    .limit(1)
  const nextOrder = maxOrder ? maxOrder.sortOrder + 1 : 0

  const [client] = await db
    .insert(schema.clients)
    .values({
      name,
      year: body.year ?? '',
      category: body.category ?? '',
      imageUrl: body.imageUrl ?? '',
      instagramUrl: body.instagramUrl ?? '',
      sortOrder: nextOrder,
    })
    .returning()

  return Response.json(client, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Reordenação em lote: { order: [id, id, ...] }
  if (Array.isArray(body.order)) {
    const db = getDb()
    for (let i = 0; i < body.order.length; i++) {
      await db.update(schema.clients).set({ sortOrder: i }).where(eq(schema.clients.id, body.order[i]))
    }
    return Response.json({ success: true })
  }

  // Atualização individual: { id, name?, year?, category?, imageUrl?, instagramUrl? }
  if (body.id) {
    const db = getDb()
    const [existing] = await db.select().from(schema.clients).where(eq(schema.clients.id, body.id))
    if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

    const updates: Record<string, unknown> = {}
    for (const field of FIELDS) {
      if (field in body) updates[field] = body[field]
    }
    updates.updatedAt = new Date().toISOString()

    const [updated] = await db.update(schema.clients).set(updates).where(eq(schema.clients.id, body.id)).returning()

    // Mantém o nome desnormalizado dos projetos atrelados em sincronia.
    if ('name' in updates) {
      await db.update(schema.projects).set({ client: updates.name as string }).where(eq(schema.projects.clientId, body.id))
    }

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

  const db = getDb()
  const [existing] = await db.select({ id: schema.clients.id }).from(schema.clients).where(eq(schema.clients.id, id))
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

  // Desatrela projetos que apontavam para este cliente (mantém o nome em `client`).
  await db.update(schema.projects).set({ clientId: null }).where(eq(schema.projects.clientId, id))
  await db.delete(schema.clients).where(eq(schema.clients.id, id))
  return Response.json({ success: true })
}
