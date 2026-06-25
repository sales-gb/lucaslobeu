import { NextRequest } from 'next/server'
import { getDb, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const [user] = await db.select().from(schema.users)
  const [homeSettings] = await db.select().from(schema.homeSettings)

  return Response.json({ user, homeSettings })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const db = await getDb()
  const userId = session.user?.id as string | undefined

  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const userFields = ['name', 'city', 'bio', 'phone', 'instagram', 'vimeo', 'behance', 'email', 'socialLinks'] as const
  const userUpdates: Record<string, unknown> = {}
  for (const field of userFields) {
    if (field in body) userUpdates[field] = body[field]
  }

  if (Object.keys(userUpdates).length > 0) {
    await db.update(schema.users).set(userUpdates).where(eq(schema.users.id, userId))
  }

  const [updatedUser] = await db.select().from(schema.users)
  const [homeSettings] = await db.select().from(schema.homeSettings)

  return Response.json({ user: updatedUser, homeSettings })
}
