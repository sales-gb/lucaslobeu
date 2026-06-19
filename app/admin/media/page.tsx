'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import type { Media } from '@/lib/db/schema'

type MediaWithUrl = Media & { url: string }

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function MediaThumb({ media, onCopy }: { media: MediaWithUrl; onCopy: (url: string) => void }) {
  return (
    <div
      className="adm-media-thumb"
      title="Clique para copiar URL"
      onClick={() => onCopy(media.url)}
      style={{
        aspectRatio: '1',
        background: 'var(--surface-2)',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={media.url}
        alt={media.alt || media.originalName}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  )
}

export default function MediaPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [media, setMedia] = useState<MediaWithUrl[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')

  const load = async () => {
    const res = await fetch('/api/media')
    if (res.ok) setMedia(await res.json())
  }

  useEffect(() => { load() }, [])

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(url)
      setTimeout(() => setCopied(''), 2000)
    })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    setError('')

    for (const file of files) {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/media', { method: 'POST', body: form })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Erro ao enviar arquivo.')
        break
      }
    }

    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir arquivo permanentemente?')) return
    const res = await fetch(`/api/media/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setMedia((prev) => prev.filter((m) => m.id !== id))
      router.refresh()
    }
  }

  return (
    <AdminShell breadcrumbs={[{ label: 'Mídia' }]}>
      <div className="adm-page">
        <div className="adm-page-head">
          <div>
            <p className="adm-mono adm-muted">Biblioteca</p>
            <h1 className="adm-h1">Mídia</h1>
            <p className="adm-sub">{media.length} arquivo{media.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="adm-page-head-actions">
            {copied && <span className="adm-mono adm-muted" style={{ fontSize: 11 }}>URL copiada!</span>}
            {error && <span className="adm-err">{error}</span>}
            <button className="adm-btn adm-btn--primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? 'Enviando...' : '+ Upload'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              style={{ display: 'none' }}
              onChange={handleUpload}
            />
          </div>
        </div>

        <div className="adm-media-grid">
          {media.map((item) => (
            <div key={item.id} className="adm-media-cell">
              <MediaThumb media={item} onCopy={handleCopy} />
              <div className="adm-media-info">
                <span className="adm-h6" style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.originalName}
                </span>
                <span className="adm-mono adm-muted" style={{ fontSize: 10 }}>{item.mimeType.split('/')[1].toUpperCase()} · {formatBytes(item.size)}</span>
                {item.width && item.height && (
                  <span className="adm-muted" style={{ fontSize: 10 }}>{item.width} × {item.height}</span>
                )}
                <span
                  className="adm-mono adm-muted"
                  style={{ fontSize: 9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}
                  title="Clique para copiar URL"
                  onClick={() => handleCopy(item.url)}
                >
                  {copied === item.url ? '✓ copiada' : item.url}
                </span>
              </div>
              <button className="adm-btn adm-btn--xs adm-btn--danger" onClick={() => handleDelete(item.id)}>
                Excluir
              </button>
            </div>
          ))}

          {media.length === 0 && !uploading && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0' }}>
              <p className="adm-muted">Nenhum arquivo na biblioteca.</p>
              <button className="adm-btn adm-btn--primary" style={{ marginTop: 16 }} onClick={() => fileRef.current?.click()}>
                Enviar primeira imagem
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
