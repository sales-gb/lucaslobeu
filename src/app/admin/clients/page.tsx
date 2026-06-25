'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import { MediaPicker } from '@/components/admin/MediaPicker'
import type { Client } from '@/lib/db/schema'

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [pickerFor, setPickerFor] = useState<string | null>(null)
  const dragId = useRef<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const load = async () => {
    const res = await fetch('/api/clients')
    if (res.ok) setClients(await res.json())
  }
  useEffect(() => { load() }, [])

  const addClient = async () => {
    const name = prompt('Nome do cliente/marca:')
    if (!name?.trim()) return
    await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    })
    load()
    router.refresh()
  }

  const updateLocal = (id: string, field: keyof Client, value: unknown) =>
    setClients(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))

  const save = async (id: string, patch: Partial<Client>) => {
    await fetch('/api/clients', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    })
    router.refresh()
  }

  const removeClient = async (id: string) => {
    if (!confirm('Remover cliente? Projetos atrelados perdem o vínculo (o nome é mantido).')) return
    await fetch(`/api/clients?id=${id}`, { method: 'DELETE' })
    setClients(prev => prev.filter(c => c.id !== id))
    router.refresh()
  }

  const handleDrop = async (targetId: string) => {
    if (!dragId.current || dragId.current === targetId) { setDragOver(null); return }
    const from = clients.findIndex(c => c.id === dragId.current)
    const to = clients.findIndex(c => c.id === targetId)
    const reordered = [...clients]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    setClients(reordered)
    setDragOver(null)
    dragId.current = null
    await fetch('/api/clients', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: reordered.map(c => c.id) }),
    })
    router.refresh()
  }

  return (
    <AdminShell breadcrumbs={[{ label: 'Clientes' }]}>
      <div className="adm-page">
        <div className="adm-page-head">
          <div>
            <p className="adm-mono adm-muted">Editar</p>
            <h1 className="adm-h1">Clientes</h1>
            <p className="adm-muted" style={{ fontSize: 13, marginTop: 6, maxWidth: 560 }}>
              Módulo global. Estes clientes aparecem na Home e na página Sobre, e ficam
              disponíveis para atrelar a projetos.
            </p>
          </div>
          <div className="adm-page-head-actions">
            <button className="adm-btn adm-btn--primary" onClick={addClient}>+ Novo cliente</button>
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-head"><span className="adm-h6">Lista de clientes</span></div>
          <div className="adm-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {clients.map(c => (
                <div
                  key={c.id}
                  className={`adm-client-row${dragOver === c.id ? ' is-over' : ''}`}
                  draggable
                  onDragStart={() => { dragId.current = c.id }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(c.id) }}
                  onDrop={() => handleDrop(c.id)}
                  onDragEnd={() => setDragOver(null)}
                >
                  <span className="adm-drag-handle">⠿</span>

                  {/* Imagem do trabalho */}
                  <button
                    type="button"
                    className="adm-media-picker-item"
                    style={{ width: 64, height: 64, padding: 0, borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}
                    onClick={() => setPickerFor(c.id)}
                    title={c.imageUrl ? 'Trocar imagem' : 'Selecionar imagem'}
                  >
                    {c.imageUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={c.imageUrl} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span className="adm-muted" style={{ fontSize: 18 }}>🖼</span>}
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 80px 1fr', gap: 8, flex: 1 }}>
                    <input
                      className="adm-input adm-input--inline"
                      placeholder="Nome"
                      value={c.name}
                      onChange={e => updateLocal(c.id, 'name', e.target.value)}
                      onBlur={() => save(c.id, { name: c.name })}
                    />
                    <input
                      className="adm-input adm-input--inline"
                      placeholder="Ano"
                      value={c.year}
                      onChange={e => updateLocal(c.id, 'year', e.target.value)}
                      onBlur={() => save(c.id, { year: c.year })}
                    />
                    <input
                      className="adm-input adm-input--inline"
                      placeholder="Categoria/setor"
                      value={c.category}
                      onChange={e => updateLocal(c.id, 'category', e.target.value)}
                      onBlur={() => save(c.id, { category: c.category })}
                    />
                  </div>

                  <input
                    className="adm-input adm-input--inline adm-input--url"
                    style={{ flex: 1, minWidth: 0 }}
                    placeholder="https://instagram.com/..."
                    value={c.instagramUrl}
                    onChange={e => updateLocal(c.id, 'instagramUrl', e.target.value)}
                    onBlur={() => save(c.id, { instagramUrl: c.instagramUrl })}
                  />

                  <button className="adm-btn adm-btn--xs adm-btn--danger" onClick={() => removeClient(c.id)}>✕</button>
                </div>
              ))}
              {clients.length === 0 && <p className="adm-muted">Nenhum cliente cadastrado. Clique em “Novo cliente”.</p>}
            </div>
          </div>
        </div>
      </div>

      <MediaPicker
        open={pickerFor !== null}
        onClose={() => setPickerFor(null)}
        onSelect={(url) => {
          if (pickerFor === null) return
          updateLocal(pickerFor, 'imageUrl', url)
          save(pickerFor, { imageUrl: url })
        }}
      />
    </AdminShell>
  )
}
