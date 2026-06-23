'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import type { Link as LinkRow } from '@/lib/db/schema'

export default function LinksPage() {
  const router = useRouter()
  const [links, setLinks] = useState<LinkRow[]>([])
  const [saving, setSaving] = useState(false)
  const dragId = useRef<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const load = async () => {
    const res = await fetch('/api/links')
    if (res.ok) setLinks(await res.json())
  }

  useEffect(() => { load() }, [])

  const addLink = async () => {
    const label = prompt('Label do link:')
    if (!label) return
    const href = prompt('URL:')
    if (!href) return
    await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, href }),
    })
    load()
  }

  const updateLink = (id: string, field: keyof LinkRow, value: unknown) => {
    setLinks((prev) => prev.map((l) => l.id === id ? { ...l, [field]: value } : l))
  }

  const saveLink = async (link: LinkRow) => {
    setSaving(true)
    await fetch('/api/links', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: link.id, label: link.label, href: link.href, kind: link.kind, enabled: link.enabled }),
    })
    setSaving(false)
    router.refresh()
  }

  const deleteLink = async (id: string) => {
    if (!confirm('Remover link?')) return
    await fetch(`/api/links?id=${id}`, { method: 'DELETE' })
    setLinks((prev) => prev.filter((l) => l.id !== id))
    router.refresh()
  }

  const handleDragStart = (id: string) => { dragId.current = id }
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOver(id) }
  const handleDrop = async (targetId: string) => {
    if (!dragId.current || dragId.current === targetId) { setDragOver(null); return }
    const from = links.findIndex((l) => l.id === dragId.current)
    const to = links.findIndex((l) => l.id === targetId)
    const reordered = [...links]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    setLinks(reordered)
    setDragOver(null)
    dragId.current = null
    await fetch('/api/links', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: reordered.map((l) => l.id) }),
    })
    router.refresh()
  }

  const enabledLinks = links.filter((l) => l.enabled)

  return (
    <AdminShell breadcrumbs={[{ label: 'Links' }]}>
      <div className="adm-page">
        <div className="adm-page-head">
          <div>
            <p className="adm-mono adm-muted">Editar</p>
            <h1 className="adm-h1">Links</h1>
          </div>
          <div className="adm-page-head-actions">
            <button className="adm-btn adm-btn--primary" onClick={addLink}>+ Novo link</button>
          </div>
        </div>

        <div className="adm-cols-2">
          <div className="adm-card">
            <div className="adm-card-head"><span className="adm-h6">Lista de links</span></div>
            <div className="adm-card-body">
              <div className="adm-links-editor">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className={`adm-link-row${dragId.current === link.id ? ' is-dragging' : ''}${dragOver === link.id ? ' is-over' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(link.id)}
                    onDragOver={(e) => handleDragOver(e, link.id)}
                    onDrop={() => handleDrop(link.id)}
                    onDragEnd={() => setDragOver(null)}
                  >
                    <span className="adm-drag-handle">⠿</span>
                    <span className="adm-tag">{link.kind}</span>
                    <input
                      className="adm-input adm-input--inline"
                      value={link.label}
                      onChange={(e) => updateLink(link.id, 'label', e.target.value)}
                      onBlur={() => saveLink(link)}
                    />
                    <input
                      className="adm-input adm-input--inline adm-input--url"
                      value={link.href}
                      onChange={(e) => updateLink(link.id, 'href', e.target.value)}
                      onBlur={() => saveLink(link)}
                    />
                    <select
                      className="adm-input adm-input--inline"
                      value={link.kind}
                      onChange={(e) => { updateLink(link.id, 'kind', e.target.value); saveLink({ ...link, kind: e.target.value }) }}
                    >
                      <option value="primary">primary</option>
                      <option value="social">social</option>
                      <option value="contact">contact</option>
                    </select>
                    <label className="adm-toggle" title="Ativo">
                      <input
                        type="checkbox"
                        checked={link.enabled}
                        onChange={(e) => { updateLink(link.id, 'enabled', e.target.checked); saveLink({ ...link, enabled: e.target.checked }) }}
                      />
                      <span className="adm-toggle-track"><span className="adm-toggle-thumb" /></span>
                    </label>
                    <button className="adm-btn adm-btn--xs adm-btn--danger" onClick={() => deleteLink(link.id)}>✕</button>
                  </div>
                ))}
                {links.length === 0 && <p className="adm-muted">Nenhum link cadastrado.</p>}
              </div>
            </div>
          </div>

          <div className="adm-card">
            <div className="adm-card-head"><span className="adm-h6">Preview /links</span></div>
            <div className="adm-card-body">
              <div className="adm-links-preview">
                <div className="adm-links-preview-card">
                  <div className="adm-links-preview-name">Lucas Lobeu</div>
                  <p className="adm-mono adm-muted" style={{ textAlign: 'center', marginBottom: 20, fontSize: 11 }}>
                    Diretor & Fotógrafo
                  </p>
                  {enabledLinks.map((link) => (
                    <div key={link.id} className="adm-links-preview-link">
                      <span>↗</span>
                      <span>{link.label}</span>
                      <span />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
