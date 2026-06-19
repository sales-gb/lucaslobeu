'use client'

import { useEffect, useState, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import AdminShell from '@/components/admin/AdminShell'
import type { Project, Media } from '@/lib/db/schema'

// ─── Types ───────────────────────────────────────────────────────

type ImageSlot = {
  imageId?: string
  imageUrl?: string
  ratio?: string
  caption?: string
}

type ContentBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'quote'; text: string; attribution?: string }
  | { kind: 'image'; imageId?: string; imageUrl?: string; ratio: string; caption?: string }
  | { kind: 'image-pair'; items: [ImageSlot, ImageSlot] }
  | { kind: 'image-trio'; items: [ImageSlot, ImageSlot, ImageSlot] }
  | { kind: 'image-grid'; items: ImageSlot[]; cols: number }

type MediaItem = Media & { url: string }

// ─── Constants ────────────────────────────────────────────────────

const BLOCK_LABELS: Record<string, string> = {
  paragraph: 'Parágrafo',
  quote: 'Citação',
  image: 'Imagem',
  'image-pair': 'Par de imagens',
  'image-trio': 'Trio de imagens',
  'image-grid': 'Grade',
}

const BLOCK_ICONS: Record<string, string> = {
  paragraph: 'T',
  quote: '"',
  image: '⬜',
  'image-pair': '▪▪',
  'image-trio': '▪▪▪',
  'image-grid': '⊞',
}

const RATIO_OPTIONS = [
  { value: '16/9', label: '16:9' },
  { value: '4/3', label: '4:3' },
  { value: '3/4', label: '3:4' },
  { value: '1/1', label: '1:1' },
  { value: '21/9', label: '21:9' },
]

const TEMPLATES = [
  { value: 'editorial', label: 'Editorial', sub: 'Texto e imagens intercalados' },
  { value: 'gallery', label: 'Galeria', sub: 'Grade de imagens predominante' },
  { value: 'longform', label: 'Longform', sub: 'Narrativa com texto extenso' },
]

const COVER_KINDS = [
  { value: 'tall', label: 'Vertical', ratio: '3/4' },
  { value: 'wide', label: 'Horizont.', ratio: '4/3' },
  { value: 'square', label: 'Quadrado', ratio: '1/1' },
]

// ─── MediaPicker ─────────────────────────────────────────────────

function MediaPicker({
  onSelect,
  onClose,
}: {
  onSelect: (item: MediaItem) => void
  onClose: () => void
}) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetch('/api/media')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: MediaItem[]) =>
        setItems(Array.isArray(data) ? data.filter((m) => m.mimeType !== 'video/mp4') : [])
      )
      .catch(() => {})
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/media', { method: 'POST', body: fd })
    const record = await res.json()
    if (res.ok && record.path) {
      const withUrl: MediaItem = { ...record, url: `/uploads/${record.path}` }
      setItems((prev) => [withUrl, ...prev])
    }
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div className="adm-media-picker-overlay is-open" onClick={onClose}>
      <div className="adm-media-picker" onClick={(e) => e.stopPropagation()}>
        <div className="adm-media-picker-head">
          <span className="adm-h6">Selecionar imagem</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <label className="adm-btn adm-btn--sm" style={{ cursor: 'pointer' }}>
              {uploading ? 'Enviando…' : '+ Upload'}
              <input type="file" accept="image/*" onChange={handleUpload} hidden />
            </label>
            <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={onClose}>✕</button>
          </div>
        </div>
        {items.length === 0 && !uploading && (
          <div className="adm-media-picker-empty">
            <p className="adm-muted">Nenhuma imagem na biblioteca. Faça upload acima.</p>
          </div>
        )}
        <div className="adm-media-picker-grid">
          {items.map((item) => (
            <button
              key={item.id}
              className="adm-media-picker-item"
              onClick={() => onSelect(item)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.alt ?? ''} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── ImageThumb ───────────────────────────────────────────────────

function ImageThumb({
  imageUrl,
  onPick,
  size = 72,
}: {
  imageUrl?: string
  onPick: () => void
  size?: number
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="adm-img-thumb"
      style={{ width: size, height: size }}
      title="Selecionar imagem"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          style={{ objectFit: 'cover' }}
          sizes={`${size}px`}
        />
      ) : (
        <span className="adm-img-thumb-empty">+</span>
      )}
    </button>
  )
}

// ─── BlockEditor ──────────────────────────────────────────────────

function BlockEditor({
  block,
  onChange,
  onPickImage,
}: {
  block: ContentBlock
  onChange: (updated: ContentBlock) => void
  onPickImage: (cb: (id: string, url: string) => void) => void
}) {
  if (block.kind === 'paragraph') {
    return (
      <textarea
        className="adm-input adm-textarea adm-block-textarea"
        value={block.text}
        placeholder="Texto do parágrafo…"
        rows={3}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
      />
    )
  }

  if (block.kind === 'quote') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <textarea
          className="adm-input adm-textarea adm-block-textarea"
          value={block.text}
          placeholder="Texto da citação…"
          rows={2}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
        />
        <input
          className="adm-input"
          value={block.attribution ?? ''}
          placeholder="Fonte / autor…"
          onChange={(e) => onChange({ ...block, attribution: e.target.value })}
        />
      </div>
    )
  }

  if (block.kind === 'image') {
    return (
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <ImageThumb
          imageUrl={block.imageUrl}
          onPick={() =>
            onPickImage((imgId, url) => onChange({ ...block, imageId: imgId, imageUrl: url }))
          }
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 100 }}>
          <select
            className="adm-input"
            value={block.ratio}
            onChange={(e) => onChange({ ...block, ratio: e.target.value })}
          >
            {RATIO_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <input
            className="adm-input"
            value={block.caption ?? ''}
            placeholder="Legenda (opcional)…"
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
          />
        </div>
      </div>
    )
  }

  if (block.kind === 'image-pair') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {block.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <ImageThumb
                imageUrl={item.imageUrl}
                onPick={() =>
                  onPickImage((imgId, url) => {
                    const items = [...block.items] as typeof block.items
                    items[i] = { ...items[i], imageId: imgId, imageUrl: url }
                    onChange({ ...block, items })
                  })
                }
              />
              <input
                className="adm-input adm-input--inline"
                value={item.caption ?? ''}
                placeholder="Legenda…"
                style={{ width: 72 }}
                onChange={(e) => {
                  const items = [...block.items] as typeof block.items
                  items[i] = { ...items[i], caption: e.target.value }
                  onChange({ ...block, items })
                }}
              />
            </div>
          ))}
        </div>
        <select
          className="adm-input"
          style={{ maxWidth: 120 }}
          value={block.items[0]?.ratio ?? '3/4'}
          onChange={(e) => {
            const items = block.items.map((it) => ({ ...it, ratio: e.target.value })) as typeof block.items
            onChange({ ...block, items })
          }}
        >
          {RATIO_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>
    )
  }

  if (block.kind === 'image-trio') {
    return (
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {block.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <ImageThumb
              imageUrl={item.imageUrl}
              size={60}
              onPick={() =>
                onPickImage((imgId, url) => {
                  const items = [...block.items] as typeof block.items
                  items[i] = { ...items[i], imageId: imgId, imageUrl: url }
                  onChange({ ...block, items })
                })
              }
            />
            <input
              className="adm-input adm-input--inline"
              value={item.caption ?? ''}
              placeholder="Legenda…"
              style={{ width: 60 }}
              onChange={(e) => {
                const items = [...block.items] as typeof block.items
                items[i] = { ...items[i], caption: e.target.value }
                onChange({ ...block, items })
              }}
            />
          </div>
        ))}
      </div>
    )
  }

  if (block.kind === 'image-grid') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {block.items.map((item, i) => (
            <ImageThumb
              key={i}
              imageUrl={item.imageUrl}
              size={56}
              onPick={() =>
                onPickImage((imgId, url) => {
                  const items = [...block.items]
                  items[i] = { ...items[i], imageId: imgId, imageUrl: url }
                  onChange({ ...block, items })
                })
              }
            />
          ))}
          <button
            type="button"
            className="adm-btn adm-btn--xs"
            onClick={() =>
              onChange({ ...block, items: [...block.items, { ratio: '1/1' }] })
            }
          >
            + Imagem
          </button>
          {block.items.length > 1 && (
            <button
              type="button"
              className="adm-btn adm-btn--xs adm-btn--ghost"
              onClick={() => onChange({ ...block, items: block.items.slice(0, -1) })}
            >
              − Imagem
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className="adm-label">Colunas:</span>
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              className={`adm-btn adm-btn--xs${block.cols === n ? ' adm-btn--primary' : ''}`}
              onClick={() => onChange({ ...block, cols: n })}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return null
}

// ─── Main page ────────────────────────────────────────────────────

export default function ProjectEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const isNew = id === 'new'
  const dragIdx = useRef<number | null>(null)

  const [project, setProject] = useState<Partial<Project>>({
    title: '',
    slug: '',
    client: '',
    year: '',
    category: 'Filme',
    role: '',
    summary: '',
    body: '[]',
    coverTone: 'mid',
    coverKind: 'tall',
    template: 'editorial',
    status: 'draft',
    metaTitle: '',
    metaDescription: '',
    coverImageId: undefined,
  })
  const [blocks, setBlocks] = useState<ContentBlock[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [dragOverBlock, setDragOverBlock] = useState<number | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState<string>('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerCb = useRef<((id: string, url: string) => void) | null>(null)

  const openPicker = (cb: (id: string, url: string) => void) => {
    pickerCb.current = cb
    setPickerOpen(true)
  }

  const handlePickerSelect = (item: MediaItem) => {
    pickerCb.current?.(item.id, item.url)
    pickerCb.current = null
    setPickerOpen(false)
    setSaved(false)
  }

  useEffect(() => {
    if (isNew) return
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data: Project) => {
        setProject(data)
        try {
          setBlocks(JSON.parse(data.body ?? '[]'))
        } catch {
          setBlocks([])
        }
        if (data.coverImageId) {
          fetch('/api/media')
            .then((r) => (r.ok ? r.json() : []))
            .then((media: MediaItem[]) => {
              if (!Array.isArray(media)) return
              const found = media.find((m) => m.id === data.coverImageId)
              if (found) setCoverImageUrl(found.url)
            })
            .catch(() => {})
        }
      })
  }, [id, isNew])

  const update = (field: string, value: unknown) => {
    setProject((p) => ({ ...p, [field]: value }))
    setSaved(false)
  }

  const autoSlug = (title: string) =>
    title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

  const handleTitleChange = (val: string) => {
    update('title', val)
    if (isNew) update('slug', autoSlug(val))
  }

  const addBlock = (kind: ContentBlock['kind']) => {
    const defaults: Record<string, ContentBlock> = {
      paragraph: { kind: 'paragraph', text: '' },
      quote: { kind: 'quote', text: '', attribution: '' },
      image: { kind: 'image', ratio: '16/9' },
      'image-pair': { kind: 'image-pair', items: [{ ratio: '3/4' }, { ratio: '3/4' }] },
      'image-trio': { kind: 'image-trio', items: [{ ratio: '1/1' }, { ratio: '1/1' }, { ratio: '1/1' }] },
      'image-grid': { kind: 'image-grid', items: [{ ratio: '1/1' }, { ratio: '1/1' }, { ratio: '1/1' }, { ratio: '1/1' }], cols: 2 },
    }
    setBlocks((b) => [...b, defaults[kind]])
    setSaved(false)
  }

  const removeBlock = (i: number) => {
    setBlocks((b) => b.filter((_, idx) => idx !== i))
    setSaved(false)
  }

  const updateBlock = (i: number, updated: ContentBlock) => {
    setBlocks((b) => {
      const next = [...b]
      next[i] = updated
      return next
    })
    setSaved(false)
  }

  const handleDragStart = (i: number) => { dragIdx.current = i }
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault()
    setDragOverBlock(i)
  }
  const handleDrop = (e: React.DragEvent, i: number) => {
    e.preventDefault()
    const from = dragIdx.current
    if (from !== null && from !== i) {
      setBlocks((b) => {
        const next = [...b]
        const [moved] = next.splice(from, 1)
        next.splice(i, 0, moved)
        return next
      })
      setSaved(false)
    }
    dragIdx.current = null
    setDragOverBlock(null)
  }
  const handleDragEnd = () => {
    dragIdx.current = null
    setDragOverBlock(null)
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

  const coverAspect = COVER_KINDS.find((k) => k.value === project.coverKind)?.ratio ?? '3/4'

  return (
    <>
      {pickerOpen && (
        <MediaPicker onSelect={handlePickerSelect} onClose={() => setPickerOpen(false)} />
      )}

      <AdminShell
        breadcrumbs={[
          { label: 'Projetos', href: '/admin/projects' },
          { label: isNew ? 'Novo projeto' : project.title || '…' },
        ]}
      >
        <div className="adm-page">
          {/* ── Header ── */}
          <div className="adm-page-head">
            <div>
              <p className="adm-mono adm-muted">{isNew ? 'Criar' : 'Editar'}</p>
              <input
                className="adm-input adm-input--lg"
                placeholder="Título do projeto"
                value={project.title ?? ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                style={{ width: '100%', maxWidth: 580 }}
              />
            </div>
            <div className="adm-page-head-actions">
              {saved && (
                <span className="adm-status adm-status--saved">
                  <span className="adm-status-dot" />Salvo
                </span>
              )}
              {error && <span className="adm-err">{error}</span>}
              <button className="adm-btn adm-btn--ghost" onClick={() => router.push('/admin/projects')}>
                Cancelar
              </button>
              <button className="adm-btn adm-btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>

          {/* ── Editor layout ── */}
          <div className="adm-editor-layout">
            {/* ── Main column ── */}
            <div className="adm-editor-main">
              {/* Metadata */}
              <div className="adm-card">
                <div className="adm-card-head"><span className="adm-h6">Metadados</span></div>
                <div className="adm-card-body">
                  <div className="adm-form-grid">
                    <div className="adm-field adm-field--span2">
                      <label className="adm-label">Slug</label>
                      <div className="adm-input-prefix">
                        <span className="adm-mono adm-muted">/projects/</span>
                        <input
                          className="adm-input adm-input--url"
                          value={project.slug ?? ''}
                          onChange={(e) => update('slug', e.target.value)}
                        />
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

              {/* Content blocks */}
              <div className="adm-card">
                <div className="adm-card-head">
                  <span className="adm-h6">Conteúdo</span>
                  <span className="adm-mono adm-muted" style={{ fontSize: 11 }}>
                    {blocks.length} bloco{blocks.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="adm-card-body">
                  <div className="adm-blocks">
                    {blocks.length === 0 && (
                      <div className="adm-blocks-empty">
                        <span style={{ fontSize: 28, opacity: .35 }}>⬚</span>
                        <p className="adm-muted" style={{ fontSize: 13 }}>
                          Nenhum bloco ainda. Adicione parágrafos, citações ou imagens abaixo.
                        </p>
                      </div>
                    )}
                    {blocks.map((block, i) => (
                      <div
                        key={i}
                        className={`adm-block adm-block--editable${dragOverBlock === i ? ' is-over' : ''}`}
                        draggable
                        onDragStart={() => handleDragStart(i)}
                        onDragOver={(e) => handleDragOver(e, i)}
                        onDrop={(e) => handleDrop(e, i)}
                        onDragEnd={handleDragEnd}
                      >
                        <span className="adm-block-handle" title="Arrastar para reordenar">⠿</span>
                        <span className="adm-block-icon">{BLOCK_ICONS[block.kind] ?? '?'}</span>
                        <div className="adm-block-body">
                          <span className="adm-mono adm-muted adm-block-kind">
                            {BLOCK_LABELS[block.kind]}
                          </span>
                          <BlockEditor
                            block={block}
                            onChange={(updated) => updateBlock(i, updated)}
                            onPickImage={openPicker}
                          />
                        </div>
                        <div className="adm-block-actions">
                          <button
                            type="button"
                            className="adm-btn adm-btn--xs adm-btn--ghost"
                            onClick={() => removeBlock(i)}
                            title="Remover bloco"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="adm-blocks-add-bar">
                    <span className="adm-mono adm-muted" style={{ fontSize: 10, letterSpacing: '.1em' }}>
                      ADICIONAR
                    </span>
                    {(['paragraph', 'quote', 'image', 'image-pair', 'image-trio', 'image-grid'] as const).map((k) => (
                      <button
                        key={k}
                        type="button"
                        className="adm-btn adm-btn--xs"
                        onClick={() => addBlock(k)}
                      >
                        {BLOCK_ICONS[k]} {BLOCK_LABELS[k]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SEO */}
              <div className="adm-card">
                <div className="adm-card-head"><span className="adm-h6">SEO</span></div>
                <div className="adm-card-body">
                  <div className="adm-form-grid">
                    <div className="adm-field adm-field--span3">
                      <label className="adm-label">Meta título</label>
                      <input
                        className="adm-input"
                        value={project.metaTitle ?? ''}
                        placeholder={project.title ?? ''}
                        onChange={(e) => update('metaTitle', e.target.value)}
                      />
                    </div>
                    <div className="adm-field adm-field--span3">
                      <label className="adm-label">Meta descrição</label>
                      <textarea
                        className="adm-input adm-textarea"
                        rows={2}
                        value={project.metaDescription ?? ''}
                        placeholder={project.summary ?? ''}
                        onChange={(e) => update('metaDescription', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger zone */}
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

            {/* ── Sidebar ── */}
            <div className="adm-editor-side">
              {/* Cover */}
              <div className="adm-card">
                <div className="adm-card-head"><span className="adm-h6">Capa</span></div>
                <div className="adm-card-body">
                  <button
                    type="button"
                    className="adm-cover-picker"
                    style={{ aspectRatio: coverAspect }}
                    onClick={() =>
                      openPicker((imgId, url) => {
                        update('coverImageId', imgId)
                        setCoverImageUrl(url)
                      })
                    }
                  >
                    {coverImageUrl ? (
                      <Image
                        src={coverImageUrl}
                        alt="Capa"
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="360px"
                      />
                    ) : (
                      <div className="adm-cover-picker-empty">
                        <span style={{ fontSize: 28 }}>⊕</span>
                        <span className="adm-mono adm-muted" style={{ fontSize: 10 }}>
                          Selecionar capa
                        </span>
                      </div>
                    )}
                  </button>
                  {coverImageUrl && (
                    <button
                      type="button"
                      className="adm-btn adm-btn--xs adm-btn--ghost"
                      style={{ marginTop: 8, width: '100%' }}
                      onClick={() => {
                        update('coverImageId', null)
                        setCoverImageUrl('')
                      }}
                    >
                      Remover capa
                    </button>
                  )}

                  <p className="adm-label" style={{ marginTop: 16, marginBottom: 8 }}>Formato</p>
                  <div className="adm-cover-kind-picker">
                    {COVER_KINDS.map((k) => (
                      <button
                        key={k.value}
                        type="button"
                        className={`adm-cover-kind-btn${project.coverKind === k.value ? ' is-active' : ''}`}
                        onClick={() => update('coverKind', k.value)}
                      >
                        <div className="adm-cover-kind-preview" style={{ aspectRatio: k.ratio }} />
                        <span>{k.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Template */}
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
    </>
  )
}
