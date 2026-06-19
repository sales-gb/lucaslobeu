import { NextRequest } from 'next/server'
import { getDb, schema } from '@/lib/db'
import { desc } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { storage, UPLOAD_LIMITS } from '@/lib/storage'
import sharp from 'sharp'
import { randomBytes } from 'crypto'

// Map the validated MIME type to a safe extension. Never trust the user's
// filename for the stored extension — it can be spoofed (e.g. a PNG named .svg).
const MIME_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
}

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const rows = await db
    .select()
    .from(schema.media)
    .orderBy(desc(schema.media.createdAt))

  return Response.json(rows)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!UPLOAD_LIMITS.allowedMimeTypes.includes(file.type as (typeof UPLOAD_LIMITS.allowedMimeTypes)[number])) {
    return Response.json({ error: 'Invalid file type. Allowed: JPEG, PNG, WebP, AVIF' }, { status: 400 })
  }

  if (file.size > UPLOAD_LIMITS.maxSizeBytes) {
    return Response.json({ error: 'File too large. Maximum 10MB' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // Re-decode with sharp. This both gives us real dimensions and confirms the
  // bytes are a genuine image whose format matches the declared MIME type —
  // protects against a malicious payload disguised behind an image MIME header.
  let width: number | undefined
  let height: number | undefined
  const declaredFormat = file.type.split('/')[1] === 'jpeg' ? 'jpeg' : file.type.split('/')[1]
  try {
    const meta = await sharp(buffer).metadata()
    width = meta.width
    height = meta.height
    if (!meta.format || meta.format !== declaredFormat) {
      return Response.json({ error: 'File contents do not match declared type' }, { status: 400 })
    }
  } catch {
    return Response.json({ error: 'Could not process image' }, { status: 400 })
  }

  const ext = MIME_EXT[file.type] ?? '.jpg'
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
}
