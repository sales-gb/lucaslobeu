'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import type { Project } from '@/lib/db/schema'

type ContentBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'quote'; text: string; source: string }
  | { kind: 'image'; tone: string; ratio: string; caption?: string }
  | { kind: 'image-pair'; tones: string[]; ratio: string }
  | { kind: 'image-trio'; tones: string[] }
  | { kind: 'image-grid'; tones: string[]; cols: number }

const BLOCK_ICONS: Record<string, string> = {
  paragraph: 'T',
  quote: '"',
  image: '⬜',
  'image-pair': '⬜⬜',
  'image-trio': '⬜⬜⬜',
  'image-grid': '⊞',
}

const TEMPLATES = [
  { value: 'editorial', label: 'Editorial', sub: 'Texto e imagens intercalados' },
  { value: 'gallery', label: 'Galeria', sub: 'Grade de imagens predominante' },
  { value: 'longform', label: 'Longform', sub: 'Narrativa com texto extenso' },
]

const TONES = ['light', 'mid', 'dark']

export default function ProjectEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const isNew = id === 'new'

  const [project, setProject] = useState<Partial<Project>>({
    title: '', slug: '', client: '', year: '', category: 'Filme',
    role: '', summary: '', body: '[]', coverTone: 'mid',
    template: 'editorial', status: 'draft', metaTitle: '', metaDescription: '',
  })
  const [blocks, setBlocks] = useState<ContentBlock[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isNew) return
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProject(data)
        try { setBlocks(JSON.parse(data.body ?? '[]')) } catch { setBlocks([]) }
      })
  }, [id, isNew])

  const update = (field: string, value: unknown) => {
    setProject((p) => ({ ...p, [field]: value }))
    setSaved(false)
  }

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleTitleChange = (val: string) => {
    update('title', val)
    if (isNew) update('slug', autoSlug(val))
  }

  const addBlock = (kind: ContentBlock['kind']) => {
    const defaults: Record<string, ContentBlock> = {
      paragraph: { kind: 'paragraph', text: '' },
      quote: { kind: 'quote', text: '', source: '' },
      image: { kind: 'image', tone: 'mid', ratio: '16/9' },
      'image-pair': { kind: 'image-pair', tones: ['mid', 'mid'], ratio: '4/5' },
      'image-trio': { kind: 'image-trio', tones: ['mid', 'mid', 'mid'] },
      'image-grid': { kind: 'image-grid', tones: ['mid', 'mid', 'mid', 'mid'], cols: 2 },
    }
    setBlocks((b) => [...b, defaults[kind]])
    setSaved(false)
  }

  const removeBlock = (i: number) => {
    setBlocks((b) => b.filter((_, idx) => idx !== i))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    const payload = { ...project, body: JSON.stringify(blocks) }

    const url = isNew ? '/api/projects' : `/api/projects/${id}`
    const method = isNew ? 'POST' : 'PATCH'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setSaving(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erro ao salvar.')
    } else {
      setSaved(true)
      if (isNew) {
        const data = await res.json()
        router.replace(`/admin/projects/${data.id}`)
      }
      router.refresh()
    }
  }

  const handleDelete = async () => {
    if (!confirm('Excluir projeto permanentemente?')) return
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    router.push('/admin/projects')
  }

  return (
    <AdminShell breadcrumbs={[{ label: 'Projetos', href: '/admin/projects' }, { label: isNew ? 'Novo' : project.title || '...' }]}>
      <div className="adm-page">
        <div className="adm-page-head">
          <div>
            <p className="adm-mono adm-muted">{isNew ? 'Criar' : 'Editar'}</p>
            <input
              className="adm-input adm-input--lg"
              placeholder="Título do projeto"
              value={project.title ?? ''}
              onChange={(e) => handleTitleChange(e.target.value)}
              style={{ width: '100%', maxWidth: 600 }}
            />
          </div>
          <div className="adm-page-head-actions">
            {saved && <span className="adm-status adm-status--saved"><span className="adm-status-dot" />Salvo</span>}
            {error && <span className="adm-err">{error}</span>}
            <button className="adm-btn adm-btn--ghost" onClick={() => router.push('/admin/projects')}>Cancelar</button>
            <button className="adm-btn adm-btn--primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        <div className="adm-editor-layout">
          <div className="adm-editor-main">
            <div className="adm-card">
              <div className="adm-card-head"><span className="adm-h6">Metadados</span></div>
              <div className="adm-card-body">
                <div className="adm-form-grid">
                  <div className="adm-field adm-field--span2">
                    <label className="adm-label">Slug</label>
                    <div className="adm-input-prefix">
                      <span className="adm-mono adm-muted">/projects/</span>
                      <input className="adm-input adm-input--url" value={project.slug ?? ''} onChange={(e) => update('slug', e.target.value)} />
                    </div>
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Status</label>
                    <select className="adm-input" value={project.status ?? 'draft'} onChange={(e) => update('status', e.target.value)}>
                      <option value="draft">Rascunho</option>
                      <option value="published">Publicado</option>
                    </select>
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Cliente</label>
                    <input className="adm-input" value={project.client ?? ''} onChange={(e) => update('client', e.target.value)} />
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Ano</label>
                    <input className="adm-input adm-input--year" value={project.year ?? ''} onChange={(e) => update('year', e.target.value)} />
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Categoria</label>
                    <select className="adm-input" value={project.category ?? 'Filme'} onChange={(e) => update('category', e.target.value)}>
                      <option>Filme</option>
                      <option>Foto</option>
                      <option>Social</option>
                    </select>
                  </div>
                  <div className="adm-field adm-field--span3">
                    <label className="adm-label">Papel / Role</label>
                    <input className="adm-input" value={project.role ?? ''} onChange={(e) => update('role', e.target.value)} />
                  </div>
                  <div className="adm-field adm-field--span3">
                    <label className="adm-label">Resumo</label>
                    <textarea className="adm-input adm-textarea" rows={3} value={project.summary ?? ''} onChange={(e) => update('summary', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="adm-card">
              <div className="adm-card-head">
                <span className="adm-h6">Blocos de conteúdo</span>
              </div>
              <div className="adm-card-body">
                <div className="adm-blocks">
                  {blocks.map((block, i) => (
                    <div key={i} className="adm-block">
                      <span className="adm-block-handle">⠿</span>
                      <span className="adm-block-icon">{BLOCK_ICONS[block.kind] ?? '?'}</span>
                      <div className="adm-block-body">
                        <span className="adm-mono adm-muted adm-block-kind">{block.kind}</span>
                        {'text' in block && (
                          <p className="adm-block-text">{block.text || <em className="adm-muted">Sem texto</em>}</p>
                        )}
                      </div>
                      <div className="adm-block-actions">
                        <button className="adm-btn adm-btn--xs adm-btn--danger" onClick={() => removeBlock(i)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {(['paragraph', 'quote', 'image', 'image-pair', 'image-trio', 'image-grid'] as const).map((k) => (
                    <button key={k} className="adm-btn adm-btn--xs" onClick={() => addBlock(k)}>
                      + {k}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="adm-card">
              <div className="adm-card-head"><span className="adm-h6">SEO</span></div>
              <div className="adm-card-body">
                <div className="adm-form-grid">
                  <div className="adm-field adm-field--span3">
                    <label className="adm-label">Meta título</label>
                    <input className="adm-input" value={project.metaTitle ?? ''} onChange={(e) => update('metaTitle', e.target.value)} />
                  </div>
                  <div className="adm-field adm-field--span3">
                    <label className="adm-label">Meta descrição</label>
                    <textarea className="adm-input adm-textarea" rows={2} value={project.metaDescription ?? ''} onChange={(e) => update('metaDescription', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {!isNew && (
              <div className="adm-card adm-card--danger">
                <div className="adm-card-head">
                  <span className="adm-h6" style={{ color: 'var(--danger)' }}>Zona de perigo</span>
                </div>
                <div className="adm-card-body" style={{ display: 'flex', gap: 12 }}>
                  <button
                    className="adm-btn adm-btn--ghost"
                    onClick={() => update('status', project.status === 'published' ? 'draft' : 'published')}
                  >
                    {project.status === 'published' ? 'Despublicar' : 'Publicar'}
                  </button>
                  <button className="adm-btn adm-btn--danger" onClick={handleDelete}>
                    Excluir projeto
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="adm-editor-side">
            <div className="adm-card">
              <div className="adm-card-head"><span className="adm-h6">Capa</span></div>
              <div className="adm-card-body">
                <div
                  className="adm-cover-preview"
                  style={{
                    aspectRatio: '4/5',
                    background: project.coverTone === 'light' ? '#E9E3D5' : project.coverTone === 'dark' ? '#1A1A1A' : '#9C9183',
                    borderRadius: 6,
                    marginBottom: 16,
                  }}
                />
                <p className="adm-label" style={{ marginBottom: 8 }}>Tom da capa</p>
                <div className="adm-tone-picker">
                  {TONES.map((tone) => (
                    <button
                      key={tone}
                      className={`adm-tone${project.coverTone === tone ? ' is-active' : ''}`}
                      onClick={() => update('coverTone', tone)}
                    >
                      <div className={`adm-tone-sw adm-tone-sw--${tone}`} />
                      {tone}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="adm-card">
              <div className="adm-card-head"><span className="adm-h6">Template</span></div>
              <div className="adm-card-body">
                <div className="adm-template-picker">
                  {TEMPLATES.map((t) => (
                    <label key={t.value} className="adm-template-card">
                      <input
                        type="radio"
                        name="template"
                        value={t.value}
                        checked={project.template === t.value}
                        onChange={() => update('template', t.value)}
                      />
                      <div>
                        <div className="adm-h6">{t.label}</div>
                        <div className="adm-muted" style={{ fontSize: 11, marginTop: 2 }}>{t.sub}</div>
                      </div>
                    </label>
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
