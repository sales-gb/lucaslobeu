import { NextRequest } from 'next/server'
import { getDb, schema } from '@/lib/db'
import { asc, desc, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const tiles = await db
    .select()
    .from(schema.homeTiles)
    .orderBy(asc(schema.homeTiles.sortOrder))

  return Response.json(tiles)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { label, kind } = body

  if (!label) return Response.json({ error: 'label is required' }, { status: 400 })

  const db = getDb()
  const [maxOrder] = await db
    .select({ sortOrder: schema.homeTiles.sortOrder })
    .from(schema.homeTiles)
    .orderBy(desc(schema.homeTiles.sortOrder))
    .limit(1)

  const nextOrder = maxOrder ? maxOrder.sortOrder + 1 : 0

  const [tile] = await db
    .insert(schema.homeTiles)
    .values({
      label,
      kind: kind ?? 'photo',
      imageId: body.imageId ?? null,
      duration: body.duration ?? null,
      linkedProjectSlug: body.linkedProjectSlug ?? null,
      ratio: body.ratio ?? '4/5',
      tone: body.tone ?? 'mid',
      sortOrder: nextOrder,
    })
    .returning()

  return Response.json(tile, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Batch reorder: { order: string[] }
  if (Array.isArray(body.order)) {
    const db = getDb()
    for (let i = 0; i < body.order.length; i++) {
      await db
        .update(schema.homeTiles)
        .set({ sortOrder: i })
        .where(eq(schema.homeTiles.id, body.order[i]))
    }
    return Response.json({ success: true })
  }

  return Response.json({ error: 'Invalid payload' }, { status: 400 })
}
