import { NextRequest } from 'next/server'
import { getDb, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { getStorage } from '@/lib/storage'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const db = await getDb()

  const [record] = await db
    .select()
    .from(schema.media)
    .where(eq(schema.media.id, id))

  if (!record) return Response.json({ error: 'Not found' }, { status: 404 })

  try {
    const storage = await getStorage()
    await storage.delete(record.path)
  } catch {
    // Log but don't fail if file is already gone
  }

  await db.delete(schema.media).where(eq(schema.media.id, id))
  return Response.json({ success: true })
}
