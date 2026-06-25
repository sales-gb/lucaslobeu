import { NextRequest } from 'next/server'
import { getDb, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'

const JSON_FIELDS = ['body', 'selectedClients', 'companies', 'recognition', 'trajectory', 'numbers'] as const
const ALLOWED_FIELDS = [
  'intro', 'contactBlurb', 'portraitImageUrl', 'portraitImageId',
  ...JSON_FIELDS,
] as const

function parseRow(row: Record<string, unknown>) {
  const out = { ...row }
  for (const f of JSON_FIELDS) {
    if (typeof out[f] === 'string') {
      try { out[f] = JSON.parse(out[f] as string) } catch { out[f] = [] }
    }
  }
  return out
}

function buildUpdates(body: Record<string, unknown>) {
  const updates: Record<string, unknown> = {}
  for (const key of ALLOWED_FIELDS) {
    if (!(key in body)) continue
    const val = body[key]
    updates[key] = (JSON_FIELDS as readonly string[]).includes(key)
      ? JSON.stringify(val)
      : val
  }
  updates.updatedAt = new Date().toISOString()
  return updates
}

async function upsert(updates: Record<string, unknown>) {
  const db = await getDb()
  const [existing] = await db.select({ id: schema.aboutContent.id }).from(schema.aboutContent)
  if (existing) {
    await db.update(schema.aboutContent).set(updates as never).where(eq(schema.aboutContent.id, 1))
  } else {
    await db.insert(schema.aboutContent).values({ id: 1, ...updates } as never)
  }
  const [updated] = await db.select().from(schema.aboutContent)
  return updated
}

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const [row] = await db.select().from(schema.aboutContent)
  return Response.json(row ? parseRow(row as Record<string, unknown>) : null)
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const updates = buildUpdates(body)
    const updated = await upsert(updates)
    return Response.json(parseRow(updated as Record<string, unknown>))
  } catch (err) {
    console.error('[PATCH /api/about]', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const updates = buildUpdates(body)
    const updated = await upsert(updates)
    return Response.json(parseRow(updated as Record<string, unknown>))
  } catch (err) {
    console.error('[POST /api/about]', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
