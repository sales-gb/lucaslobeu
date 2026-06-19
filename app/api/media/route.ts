import { NextRequest } from 'next/server'
import { getDb, schema } from '@/lib/db'
import { desc } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { storage, UPLOAD_LIMITS } from '@/lib/storage'
import sharp from 'sharp'
import { randomBytes } from 'crypto'

const MIME_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'video/mp4': '.mp4',
}

export async function GET() {
  try {
    const session = await auth()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const db = getDb()
    const rows = await db
      .select()
      .from(schema.media)
      .orderBy(desc(schema.media.createdAt))

    const withUrls = rows.map((r) => ({ ...r, url: storage.getUrl(r.path) }))
    return Response.json(withUrls)
  } catch (err) {
    console.error('[GET /api/media] error:', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!UPLOAD_LIMITS.allowedMimeTypes.includes(file.type as (typeof UPLOAD_LIMITS.allowedMimeTypes)[number])) {
    return Response.json({ error: 'Tipo inválido. Permitido: JPEG, PNG, WebP, AVIF, MP4' }, { status: 400 })
  }

  const isVideo = file.type === 'video/mp4'
  const sizeLimit = isVideo ? UPLOAD_LIMITS.maxVideoSizeBytes : UPLOAD_LIMITS.maxSizeBytes
  if (file.size > sizeLimit) {
    return Response.json({ error: `Arquivo muito grande. Máximo ${isVideo ? '200MB' : '10MB'}` }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  let width: number | undefined
  let height: number | undefined

  if (!isVideo) {
    // Re-decode with sharp to get dimensions and verify the bytes match the MIME type.
    const declaredFormat = file.type.split('/')[1] === 'jpeg' ? 'jpeg' : file.type.split('/')[1]
    try {
      const meta = await sharp(buffer).metadata()
      width = meta.width
      height = meta.height
      if (!meta.format || meta.format !== declaredFormat) {
        return Response.json({ error: 'Conteúdo do arquivo não corresponde ao tipo declarado' }, { status: 400 })
      }
    } catch {
      return Response.json({ error: 'Não foi possível processar a imagem' }, { status: 400 })
    }
  }

  const ext = MIME_EXT[file.type] ?? '.bin'
  const filename = `${randomBytes(16).toString('hex')}${ext}`

  const storedPath = await storage.save(buffer, filename, file.type)

  const db = getDb()
  const [record] = await db
    .insert(schema.media)
    .values({
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      width: width ?? null,
      height: height ?? null,
      path: storedPath,
      alt: formData.get('alt') as string | null ?? '',
      projectId: formData.get('projectId') as string | null ?? null,
    })
    .returning()

  return Response.json(record, { status: 201 })
  } catch (err) {
    console.error('[POST /api/media] error:', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
