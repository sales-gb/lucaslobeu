'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import type { Media } from '@/lib/db/schema'

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function MediaThumb({ media }: { media: Media }) {
  return (
    <div
      className="adm-media-thumb"
      style={{ aspectRatio: '1', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <span className="adm-mono adm-muted" style={{ fontSize: 9, padding: 4, textAlign: 'center', wordBreak: 'break-all' }}>
        {media.mimeType.split('/')[1].toUpperCase()}
      </span>
    </div>
  )
}

export default function MediaPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [media, setMedia] = useState<Media[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    const res = await fetch('/api/media')
    if (res.ok) setMedia(await res.json())
  }

  useEffect(() => { load() }, [])

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
              <MediaThumb media={item} />
              <div className="adm-media-info">
                <span className="adm-h6" style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.originalName}
                </span>
                <span className="adm-mono adm-muted">{item.mimeType.split('/')[1].toUpperCase()}</span>
                <span className="adm-muted" style={{ fontSize: 11 }}>{formatBytes(item.size)}</span>
                {item.width && item.height && (
                  <span className="adm-muted" style={{ fontSize: 10 }}>{item.width} × {item.height}</span>
                )}
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
