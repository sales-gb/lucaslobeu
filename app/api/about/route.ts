import { NextRequest } from 'next/server'
import { getDb, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const [about] = await db.select().from(schema.aboutContent)
  return Response.json(about ?? null)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const db = getDb()

  const allowedFields = [
    'intro', 'body', 'selectedClients', 'recognition',
    'trajectory', 'contactBlurb', 'portraitImageId', 'numbers',
  ] as const

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() }
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = Array.isArray(body[field]) ? JSON.stringify(body[field]) : body[field]
    }
  }

  const [existing] = await db.select({ id: schema.aboutContent.id }).from(schema.aboutContent)

  if (existing) {
    await db.update(schema.aboutContent).set(updates).where(eq(schema.aboutContent.id, 1))
  } else {
    await db.insert(schema.aboutContent).values({ id: 1, ...updates })
  }

  const [updated] = await db.select().from(schema.aboutContent)
  return Response.json(updated)
}
