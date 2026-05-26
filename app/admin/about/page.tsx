'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'

interface AboutData {
  intro: string
  body: string[]
  selectedClients: string[]
  recognition: [string, string][]
  portraitImageId: string | null
  contactBlurb: string
}

export default function AboutPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [data, setData] = useState<AboutData>({
    intro: '',
    body: [''],
    selectedClients: [],
    recognition: [],
    portraitImageId: null,
    contactBlurb: '',
  })
  const [newClient, setNewClient] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetch('/api/about').then((r) => r.json()).then((d) => {
      if (!d) return
      setData({
        intro: d.intro ?? '',
        body: tryParse(d.body, ['']),
        selectedClients: tryParse(d.selectedClients, []),
        recognition: tryParse(d.recognition, []),
        portraitImageId: d.portraitImageId ?? null,
        contactBlurb: d.contactBlurb ?? '',
      })
    })
  }, [])

  const tryParse = <T,>(val: string | T[], fallback: T[]): T[] => {
    if (Array.isArray(val)) return val
    try { return JSON.parse(val) } catch { return fallback }
  }

  const save = async () => {
    setSaving(true)
    await fetch('/api/about', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setSaving(false)
    setSaved(true)
    router.refresh()
  }

  const addParagraph = () => setData((d) => ({ ...d, body: [...d.body, ''] }))
  const removeParagraph = (i: number) => setData((d) => ({ ...d, body: d.body.filter((_, idx) => idx !== i) }))
  const updateParagraph = (i: number, val: string) => setData((d) => ({ ...d, body: d.body.map((p, idx) => idx === i ? val : p) }))

  const addClient = () => {
    const c = newClient.trim()
    if (!c) return
    setData((d) => ({ ...d, selectedClients: [...d.selectedClients, c] }))
    setNewClient('')
    setSaved(false)
  }

  const removeClient = (c: string) => setData((d) => ({ ...d, selectedClients: d.selectedClients.filter((x) => x !== c) }))

  const addRecognition = () => setData((d) => ({ ...d, recognition: [...d.recognition, ['2024', '']] }))
  const removeRecognition = (i: number) => setData((d) => ({ ...d, recognition: d.recognition.filter((_, idx) => idx !== i) }))
  const updateRecognition = (i: number, field: 0 | 1, val: string) => {
    setData((d) => {
      const r = d.recognition.map((row, idx) => idx === i ? ([field === 0 ? val : row[0], field === 1 ? val : row[1]] as [string, string]) : row)
      return { ...d, recognition: r }
    })
  }

  const handlePortraitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/media', { method: 'POST', body: form })
    setUploading(false)
    if (res.ok) {
      const media = await res.json()
      setData((d) => ({ ...d, portraitImageId: media.id }))
      setSaved(false)
    }
  }

  return (
    <AdminShell breadcrumbs={[{ label: 'Sobre' }]}>
      <div className="adm-page">
        <div className="adm-page-head">
          <div>
            <p className="adm-mono adm-muted">Editar</p>
            <h1 className="adm-h1">Sobre</h1>
          </div>
          <div className="adm-page-head-actions">
            {saved && <span className="adm-status adm-status--saved"><span className="adm-status-dot" />Salvo</span>}
            <button className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-head"><span className="adm-h6">Retrato</span></div>
          <div className="adm-card-body">
            <div className="adm-portrait-editor">
              <div>
                <div
                  className="adm-portrait-thumb"
                  style={{ aspectRatio: '4/5', background: 'var(--surface-2)', borderRadius: 6, marginBottom: 12 }}
                >
                  {data.portraitImageId && (
                    <span className="adm-mono adm-muted" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: 11 }}>
                      {data.portraitImageId}
                    </span>
                  )}
                </div>
                <div className="adm-portrait-actions">
                  <button className="adm-btn adm-btn--sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    {uploading ? 'Enviando...' : 'Upload retrato'}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePortraitUpload} />
                  {data.portraitImageId && (
                    <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => setData((d) => ({ ...d, portraitImageId: null }))}>
                      Remover
                    </button>
                  )}
                </div>
              </div>
              <div className="adm-field">
                <label className="adm-label">Intro</label>
                <textarea className="adm-input adm-textarea" rows={5} value={data.intro} onChange={(e) => { setData((d) => ({ ...d, intro: e.target.value })); setSaved(false) }} />
              </div>
            </div>
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-head">
            <span className="adm-h6">Parágrafos do corpo</span>
            <button className="adm-btn adm-btn--xs adm-btn--primary" onClick={addParagraph}>+ Parágrafo</button>
          </div>
          <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.body.map((para, i) => (
              <div key={i} className="adm-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label className="adm-label">Parágrafo {i + 1}</label>
                  <button className="adm-btn adm-btn--xs adm-btn--danger" onClick={() => removeParagraph(i)}>✕</button>
                </div>
                <textarea className="adm-input adm-textarea" rows={3} value={para} onChange={(e) => { updateParagraph(i, e.target.value); setSaved(false) }} />
              </div>
            ))}
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-head"><span className="adm-h6">Clientes selecionados</span></div>
          <div className="adm-card-body">
            <div className="adm-chips">
              {data.selectedClients.map((c) => (
                <span key={c} className="adm-chip">
                  {c}
                  <button className="adm-chip-x" onClick={() => { removeClient(c); setSaved(false) }}>✕</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="adm-input"
                placeholder="Nome do cliente"
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addClient() } }}
                style={{ maxWidth: 280 }}
              />
              <button className="adm-btn adm-btn--sm" onClick={addClient}>Adicionar</button>
            </div>
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-head">
            <span className="adm-h6">Reconhecimento</span>
            <button className="adm-btn adm-btn--xs adm-btn--primary" onClick={addRecognition}>+ Linha</button>
          </div>
          <div className="adm-card-body">
            {data.recognition.map((row, i) => (
              <div key={i} className="adm-recognition-row">
                <input className="adm-input adm-mono" placeholder="Ano" value={row[0]} onChange={(e) => { updateRecognition(i, 0, e.target.value); setSaved(false) }} />
                <input className="adm-input" placeholder="Premiação / reconhecimento" value={row[1]} onChange={(e) => { updateRecognition(i, 1, e.target.value); setSaved(false) }} />
                <button className="adm-btn adm-btn--xs adm-btn--danger" onClick={() => { removeRecognition(i); setSaved(false) }}>✕</button>
              </div>
            ))}
            {data.recognition.length === 0 && <p className="adm-muted">Nenhum reconhecimento cadastrado.</p>}
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-head"><span className="adm-h6">Texto de contato</span></div>
          <div className="adm-card-body">
            <div className="adm-field">
              <textarea className="adm-input adm-textarea" rows={3} value={data.contactBlurb} onChange={(e) => { setData((d) => ({ ...d, contactBlurb: e.target.value })); setSaved(false) }} />
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
