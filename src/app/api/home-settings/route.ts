import { NextRequest } from 'next/server'
import { getDb, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'

const JSON_FIELDS = ['stats', 'testimonials', 'faqItems', 'clients'] as const
const ALLOWED_FIELDS = [
  'heroRoles', 'heroDescription',
  'aboutStatement', 'aboutFooterHeadline',
  'manifestoText', 'ctaHeadline', 'ctaSub',
  'showcaseImageUrl', 'aboutPortraitUrl', 'aboutFooterImageUrl',
  'homeFeaturedCount',
  'projectsHeroSub', 'projectsManifestoText', 'projectsManifestoImageUrl',
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

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const [row] = await db.select().from(schema.homeSettings).where(eq(schema.homeSettings.id, 1))
  return Response.json(row ? parseRow(row as Record<string, unknown>) : null)
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const db = await getDb()

    const updates: Record<string, unknown> = {}
    for (const key of ALLOWED_FIELDS) {
      if (!(key in body)) continue
      const val = body[key]
      updates[key] = (JSON_FIELDS as readonly string[]).includes(key)
        ? JSON.stringify(val)
        : val
    }
    updates.updatedAt = new Date().toISOString()

    const [existing] = await db.select().from(schema.homeSettings).where(eq(schema.homeSettings.id, 1))
    if (existing) {
      await db.update(schema.homeSettings).set(updates as never).where(eq(schema.homeSettings.id, 1))
    } else {
      await db.insert(schema.homeSettings).values({ id: 1, ...updates } as never)
    }

    const [updated] = await db.select().from(schema.homeSettings).where(eq(schema.homeSettings.id, 1))
    return Response.json(parseRow(updated as Record<string, unknown>))
  } catch (err) {
    console.error('[PATCH /api/home-settings]', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
