'use client'

import { useEffect, useState } from 'react'
import { optimizeImageForUpload } from '@/lib/images/client-optimize'

export interface MediaItem {
  id: string
  url: string
  alt: string
  filename: string
  mimeType?: string
}

/**
 * Seletor de mídia reutilizável. Lista o acervo (/api/media), permite upload
 * (otimizado no browser antes de subir) e devolve a URL escolhida via onSelect.
 *
 * Durante o upload mostra um tile de loading no grid (cobre otimização + envio)
 * e já deixa o recém-enviado selecionado, pronto para "Usar imagem".
 */
export function MediaPicker({
  open, onClose, onSelect,
}: { open: boolean; onClose: () => void; onSelect: (url: string) => void }) {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!open) return
    fetch('/api/media').then(r => r.ok ? r.json() : []).then(setMedia)
    setSelected(null)
  }, [open])

  const upload = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', await optimizeImageForUpload(file))
      const res = await fetch('/api/media', { method: 'POST', body: fd })
      if (res.ok) {
        const item = await res.json()
        const url: string = item.url ?? `/uploads/${item.filename}`
        setMedia(prev => [{ id: item.id, url, alt: item.alt ?? '', filename: item.filename, mimeType: item.mimeType }, ...prev])
        setSelected(url)
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`adm-media-picker-overlay${open ? ' is-open' : ''}`} onClick={onClose}>
      <div className="adm-media-picker" onClick={e => e.stopPropagation()}>
        <div className="adm-media-picker-head">
          <div>
            <div className="adm-h6">Biblioteca de mídia</div>
            <p className="adm-muted" style={{ fontSize: 12, marginTop: 2 }}>Selecione uma imagem ou faça upload</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <label className="adm-btn adm-btn--sm" style={{ cursor: 'pointer' }}>
              {uploading ? 'Enviando...' : '+ Upload'}
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }}
              />
            </label>
            {selected && (
              <button
                className="adm-btn adm-btn--primary adm-btn--sm"
                onClick={() => { onSelect(selected); onClose() }}
              >
                Usar imagem
              </button>
            )}
            <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={onClose}>✕</button>
          </div>
        </div>
        {media.length === 0 && !uploading ? (
          <div className="adm-media-picker-empty">
            <p className="adm-muted">Nenhuma imagem no acervo. Faça upload acima.</p>
          </div>
        ) : (
          <div className="adm-media-picker-grid">
            {uploading && (
              <div className="adm-media-picker-item is-loading" aria-busy="true" aria-label="Enviando imagem">
                <span className="adm-media-picker-spinner" aria-hidden />
                <span className="adm-media-picker-loading-label">Otimizando…</span>
              </div>
            )}
            {media.filter(m => !/\.mp4$/i.test(m.url)).map(m => (
              <button
                key={m.id}
                className={`adm-media-picker-item${selected === m.url ? ' is-selected' : ''}`}
                onClick={() => setSelected(prev => prev === m.url ? null : m.url)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.alt || m.filename} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MediaPicker
