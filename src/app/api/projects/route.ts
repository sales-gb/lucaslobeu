import { NextRequest } from 'next/server'
import { getDb, schema } from '@/lib/db'
import { eq, asc, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const category = searchParams.get('category')
  const status = searchParams.get('status')
  const search = searchParams.get('q')

  const db = await getDb()
  let rows = await db
    .select()
    .from(schema.projects)
    .orderBy(asc(schema.projects.sortOrder), desc(schema.projects.createdAt))

  if (category) rows = rows.filter((r) => r.category === category)
  if (status) rows = rows.filter((r) => r.status === status)
  if (search) {
    const q = search.toLowerCase()
    rows = rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.client.toLowerCase().includes(q)
    )
  }

  return Response.json(rows)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { slug, title, client, year, category, role, summary } = body

  if (!slug || !title || !client || !year || !category || !role || !summary) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const validCategories = ['Filme', 'Foto', 'Social']
  if (!validCategories.includes(category)) {
    return Response.json({ error: 'Invalid category' }, { status: 400 })
  }

  const db = await getDb()
  const [existing] = await db
    .select({ id: schema.projects.id })
    .from(schema.projects)
    .where(eq(schema.projects.slug, slug))

  if (existing) {
    return Response.json({ error: 'Slug already exists' }, { status: 409 })
  }

  const [maxOrder] = await db
    .select({ sortOrder: schema.projects.sortOrder })
    .from(schema.projects)
    .orderBy(desc(schema.projects.sortOrder))
    .limit(1)

  const nextOrder = maxOrder ? maxOrder.sortOrder + 1 : 0

  const [project] = await db
    .insert(schema.projects)
    .values({
      slug,
      title,
      client,
      clientId: body.clientId ?? null,
      year,
      category,
      role,
      summary,
      body: body.body ?? '[]',
      credits: body.credits ?? '[]',
      coverTone: body.coverTone ?? 'mid',
      template: body.template ?? 'editorial',
      status: body.status ?? 'draft',
      sortOrder: nextOrder,
      metaTitle: body.metaTitle ?? null,
      metaDescription: body.metaDescription ?? null,
    })
    .returning()

  return Response.json(project, { status: 201 })
}
