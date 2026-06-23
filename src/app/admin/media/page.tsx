'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import type { Media } from '@/lib/db/schema'

type MediaWithUrl = Media & { url: string }

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function MediaCard({
  item,
  copied,
  onCopy,
  onDelete,
}: {
  item: MediaWithUrl
  copied: string
  onCopy: (url: string) => void
  onDelete: (id: string) => void
}) {
  const isCopied = copied === item.url
  const isVideo = item.mimeType?.startsWith('video/')

  return (
    <div className="adm-gallery-card">
      <div className="adm-gallery-thumb">
        {isVideo ? (
          <>
            <video
              src={item.url}
              preload="metadata"
              muted
              playsInline
              className="adm-gallery-video"
            />
            <div className="adm-gallery-play-badge">▶</div>
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt={item.alt || item.originalName} />
        )}

        <div className="adm-gallery-overlay">
          <button
            className={`adm-gallery-action${isCopied ? ' is-copied' : ''}`}
            onClick={() => onCopy(item.url)}
            title="Copiar URL"
          >
            {isCopied ? '✓ Copiada' : 'Copiar URL'}
          </button>
          <button
            className="adm-gallery-action adm-gallery-action--danger"
            onClick={() => onDelete(item.id)}
            title="Excluir"
          >
            Excluir
          </button>
        </div>
      </div>

      <div className="adm-gallery-meta">
        <span className="adm-gallery-name" title={item.originalName}>{item.originalName}</span>
        <div className="adm-gallery-sub">
          <span>{item.mimeType.split('/')[1]?.toUpperCase()}</span>
          <span>·</span>
          <span>{formatBytes(item.size)}</span>
          {item.width && item.height && (
            <>
              <span>·</span>
              <span>{item.width}×{item.height}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MediaPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [media, setMedia] = useState<MediaWithUrl[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')
  const [dragging, setDragging] = useState(false)

  const load = async () => {
    const res = await fetch('/api/media')
    if (res.ok) setMedia(await res.json())
  }

  useEffect(() => { load() }, [])

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url).then(() => {
      setCopied(url)
      setTimeout(() => setCopied(''), 2000)
    })
  }

  const uploadFiles = async (files: File[]) => {
    if (!files.length) return
    setUploading(true)
    setError('')
    setUploadProgress(0)

    for (let i = 0; i < files.length; i++) {
      const form = new FormData()
      form.append('file', files[i])
      const res = await fetch('/api/media', { method: 'POST', body: form })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Erro ao enviar arquivo.')
        break
      }
      setUploadProgress(Math.round(((i + 1) / files.length) * 100))
    }

    setUploading(false)
    setUploadProgress(0)
    if (fileRef.current) fileRef.current.value = ''
    load()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    uploadFiles(Array.from(e.target.files ?? []))
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
    uploadFiles(files)
  }, [])

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
        {/* Header */}
        <div className="adm-page-head">
          <div>
            <p className="adm-mono adm-muted">Biblioteca</p>
            <h1 className="adm-h1">Mídia</h1>
            <p className="adm-sub">{media.length} arquivo{media.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="adm-page-head-actions">
            {copied && (
              <span className="adm-status adm-status--saved">
                <span className="adm-status-dot" />URL copiada
              </span>
            )}
            {error && <span className="adm-err">{error}</span>}
            <button
              className="adm-btn adm-btn--primary"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? `Enviando… ${uploadProgress}%` : '+ Upload'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
              multiple
              hidden
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Drop zone */}
        <div
          className={`adm-gallery-dropzone${dragging ? ' is-dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <span className="adm-gallery-dropzone-icon">⊕</span>
          <span className="adm-gallery-dropzone-label">
            {dragging ? 'Solte para enviar' : 'Arraste arquivos ou clique para fazer upload'}
          </span>
        </div>

        {/* Upload progress bar */}
        {uploading && (
          <div className="adm-gallery-progress">
            <div className="adm-gallery-progress-bar" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}

        {/* Gallery grid */}
        {media.length === 0 && !uploading ? (
          <div className="adm-gallery-empty">
            <p className="adm-muted" style={{ fontSize: 14 }}>Nenhum arquivo na biblioteca ainda.</p>
            <button
              className="adm-btn adm-btn--primary"
              style={{ marginTop: 16 }}
              onClick={() => fileRef.current?.click()}
            >
              Enviar primeira imagem
            </button>
          </div>
        ) : (
          <div className="adm-gallery-grid">
            {media.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                copied={copied}
                onCopy={handleCopy}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  )
}
