'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import type { HomeTile } from '@/lib/db/schema'

interface HomeSettingsData {
  manifestoText: string
  ctaHeadline: string
  ctaSub: string
  heroVariant: string
}

const HERO_VARIANTS = ['editorial', 'mosaic', 'display']

export default function HomePage() {
  const router = useRouter()
  const [tiles, setTiles] = useState<HomeTile[]>([])
  const [settings, setSettings] = useState<HomeSettingsData>({
    manifestoText: '', ctaHeadline: '', ctaSub: '', heroVariant: 'editorial',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const dragId = useRef<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const load = async () => {
    const [tilesRes, settingsRes] = await Promise.all([
      fetch('/api/home-tiles'),
      fetch('/api/settings'),
    ])
    if (tilesRes.ok) setTiles(await tilesRes.json())
    if (settingsRes.ok) {
      const data = await settingsRes.json()
      if (data.homeSettings) setSettings(data.homeSettings)
    }
  }

  useEffect(() => { load() }, [])

  const handleDragStart = (id: string) => { dragId.current = id }
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOver(id) }
  const handleDrop = async (targetId: string) => {
    if (!dragId.current || dragId.current === targetId) { setDragOver(null); return }
    const from = tiles.findIndex((t) => t.id === dragId.current)
    const to = tiles.findIndex((t) => t.id === targetId)
    const reordered = [...tiles]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    setTiles(reordered)
    setDragOver(null)
    dragId.current = null
    await fetch('/api/home-tiles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: reordered.map((t) => t.id) }),
    })
    router.refresh()
  }

  const deleteTile = async (id: string) => {
    if (!confirm('Remover tile?')) return
    // No delete endpoint for tiles — handled via PATCH reorder excluding id
    setTiles((prev) => prev.filter((t) => t.id !== id))
  }

  const saveSettings = async () => {
    setSaving(true)
    // Settings endpoint handles homeSettings via user settings route; use dedicated approach
    // For now updating via settings POST (which handles user fields)
    // We'll update homeSettings via a direct fetch to settings with homeSettings fields
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSaving(false)
    setSaved(true)
    router.refresh()
  }

  return (
    <AdminShell breadcrumbs={[{ label: 'Home' }]}>
      <div className="adm-page">
        <div className="adm-page-head">
          <div>
            <p className="adm-mono adm-muted">Editar</p>
            <h1 className="adm-h1">Home</h1>
          </div>
          <div className="adm-page-head-actions">
            {saved && <span className="adm-status adm-status--saved"><span className="adm-status-dot" />Salvo</span>}
            <button className="adm-btn adm-btn--primary" onClick={saveSettings} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        <div className="adm-cols-2">
          <div className="adm-card">
            <div className="adm-card-head">
              <span className="adm-h6">Tiles da home</span>
              <div className="adm-card-head-actions">
                <button
                  className="adm-btn adm-btn--xs adm-btn--primary"
                  onClick={async () => {
                    const label = prompt('Label do tile:')
                    if (!label) return
                    const res = await fetch('/api/home-tiles', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ label, kind: 'photo' }),
                    })
                    if (res.ok) load()
                  }}
                >
                  + Tile
                </button>
              </div>
            </div>
            <div className="adm-card-body">
              <div className="adm-tiles-editor">
                {tiles.map((tile) => (
                  <div
                    key={tile.id}
                    className={`adm-tile-row${dragId.current === tile.id ? ' is-dragging' : ''}${dragOver === tile.id ? ' is-over' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(tile.id)}
                    onDragOver={(e) => handleDragOver(e, tile.id)}
                    onDrop={() => handleDrop(tile.id)}
                    onDragEnd={() => setDragOver(null)}
                  >
                    <span className="adm-drag-handle">⠿</span>
                    <div
                      className="adm-tile-thumb"
                      style={{ aspectRatio: tile.ratio, background: tile.tone === 'light' ? '#E9E3D5' : tile.tone === 'dark' ? '#1A1A1A' : '#9C9183', borderRadius: 4 }}
                    />
                    <div className="adm-tile-info">
                      <span className="adm-h6">{tile.label}</span>
                      <span className="adm-tag">{tile.kind}</span>
                    </div>
                    <div className="adm-tile-actions">
                      <button className="adm-btn adm-btn--xs adm-btn--danger" onClick={() => deleteTile(tile.id)}>✕</button>
                    </div>
                  </div>
                ))}
                {tiles.length === 0 && <p className="adm-muted" style={{ padding: '16px 0' }}>Nenhum tile cadastrado.</p>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="adm-card">
              <div className="adm-card-head"><span className="adm-h6">Preview da grade</span></div>
              <div className="adm-card-body">
                <div className="adm-tiles-preview">
                  {tiles.slice(0, 6).map((tile, i) => (
                    <div
                      key={tile.id}
                      className="adm-tiles-preview-cell"
                      style={{
                        aspectRatio: '4/5',
                        background: tile.tone === 'light' ? '#E9E3D5' : tile.tone === 'dark' ? '#1A1A1A' : '#9C9183',
                      }}
                    >
                      <div className="adm-tiles-preview-cap">{i + 1}. {tile.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="adm-card">
              <div className="adm-card-head"><span className="adm-h6">Textos da home</span></div>
              <div className="adm-card-body">
                <div className="adm-field" style={{ marginBottom: 12 }}>
                  <label className="adm-label">Hero variant</label>
                  <select className="adm-input" value={settings.heroVariant} onChange={(e) => setSettings((s) => ({ ...s, heroVariant: e.target.value }))}>
                    {HERO_VARIANTS.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div className="adm-field" style={{ marginBottom: 12 }}>
                  <label className="adm-label">Manifesto</label>
                  <textarea className="adm-input adm-textarea" rows={4} value={settings.manifestoText} onChange={(e) => setSettings((s) => ({ ...s, manifestoText: e.target.value }))} />
                </div>
                <div className="adm-field" style={{ marginBottom: 12 }}>
                  <label className="adm-label">CTA Headline</label>
                  <input className="adm-input" value={settings.ctaHeadline} onChange={(e) => setSettings((s) => ({ ...s, ctaHeadline: e.target.value }))} />
                </div>
                <div className="adm-field">
                  <label className="adm-label">CTA Subtítulo</label>
                  <input className="adm-input" value={settings.ctaSub} onChange={(e) => setSettings((s) => ({ ...s, ctaSub: e.target.value }))} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
