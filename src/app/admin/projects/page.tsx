'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import { optimizeImageForUpload } from '@/lib/images/client-optimize'
import type { Project } from '@/lib/db/schema'

const CATEGORIES = ['Todos', 'Filme', 'Foto', 'Social']

// ─── Types ────────────────────────────────────────────────────
interface MediaItem { id: string; url: string; alt: string; filename: string; mimeType?: string }

interface ProjectsData {
  projectsHeroSub: string
  projectsManifestoText: string
  projectsManifestoImageUrl: string
}

type SectionId = 'hero' | 'manifesto'

const DEFAULTS: ProjectsData = {
  projectsHeroSub: 'Direção audiovisual, fotografia e social media.',
  projectsManifestoText: 'Cada projeto começa por uma conversa. A maior parte acontece antes da câmera ser acionada.',
  projectsManifestoImageUrl: '',
}

// ─── Section config ───────────────────────────────────────────
interface SectionConfig {
  id: SectionId
  icon: string
  name: string
  preview: (data: ProjectsData) => string
  badge: (data: ProjectsData) => string
}

const SECTIONS: SectionConfig[] = [
  {
    id: 'hero', icon: '◈', name: 'Hero da Página',
    preview: d => d.projectsHeroSub || 'Subtítulo não definido',
    badge: () => 'Texto',
  },
  {
    id: 'manifesto', icon: '✦', name: 'Manifesto',
    preview: d => d.projectsManifestoText ? d.projectsManifestoText.slice(0, 90) + '...' : 'Texto não definido',
    badge: d => d.projectsManifestoImageUrl ? 'Texto + imagem' : 'Apenas texto',
  },
]

function getSectionPayload(section: SectionId, data: ProjectsData): Partial<ProjectsData> {
  switch (section) {
    case 'hero': return { projectsHeroSub: data.projectsHeroSub }
    case 'manifesto': return { projectsManifestoText: data.projectsManifestoText, projectsManifestoImageUrl: data.projectsManifestoImageUrl }
  }
}

// ─── Media Picker ─────────────────────────────────────────────
function MediaPicker({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (url: string) => void }) {
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
    const fd = new FormData()
    fd.append('file', await optimizeImageForUpload(file))
    const res = await fetch('/api/media', { method: 'POST', body: fd })
    if (res.ok) {
      const item = await res.json()
      setMedia(prev => [{ id: item.id, url: item.url ?? `/uploads/${item.filename}`, alt: item.alt ?? '', filename: item.filename, mimeType: item.mimeType }, ...prev])
    }
    setUploading(false)
  }

  const images = media.filter(m => !/\.mp4$/i.test(m.url))

  return (
    <div className={`adm-media-picker-overlay${open ? ' is-open' : ''}`} onClick={onClose}>
      <div className="adm-media-picker" onClick={e => e.stopPropagation()}>
        <div className="adm-media-picker-head">
          <div>
            <div className="adm-h6">Biblioteca de mídia</div>
            <p className="adm-muted" style={{ fontSize: 12, marginTop: 2 }}>Selecione uma imagem</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <label className="adm-btn adm-btn--sm" style={{ cursor: 'pointer' }}>
              {uploading ? 'Enviando...' : '+ Upload'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />
            </label>
            {selected && (
              <button className="adm-btn adm-btn--primary adm-btn--sm" onClick={() => { onSelect(selected); onClose() }}>
                Usar imagem
              </button>
            )}
            <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={onClose}>✕</button>
          </div>
        </div>
        {images.length === 0 ? (
          <div className="adm-media-picker-empty">
            <p className="adm-muted">Nenhuma imagem no acervo. Faça upload acima.</p>
          </div>
        ) : (
          <div className="adm-media-picker-grid">
            {images.map(m => (
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

// ─── Image field ───────────────────────────────────────────────
function ImageField({ label, hint, value, onChange }: { label: string; hint?: string; value: string; onChange: (url: string) => void }) {
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <>
      <div className="adm-field">
        <label className="adm-label">{label}</label>
        {hint && <p className="adm-muted" style={{ fontSize: 11, marginBottom: 6 }}>{hint}</p>}
        {value ? (
          <div className="adm-upload-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt={label} />
            <button className="adm-upload-preview-remove" onClick={() => onChange('')}>✕</button>
          </div>
        ) : (
          <div className="adm-upload-zone" onClick={() => setPickerOpen(true)}>
            <span style={{ fontSize: 22 }}>🖼</span>
            <span className="adm-muted" style={{ fontSize: 12 }}>Clique para selecionar da biblioteca</span>
          </div>
        )}
        {value && (
          <button className="adm-btn adm-btn--sm" style={{ marginTop: 8, alignSelf: 'flex-start' }} onClick={() => setPickerOpen(true)}>
            Trocar imagem
          </button>
        )}
      </div>
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={onChange} />
    </>
  )
}

// ─── Drawer content ───────────────────────────────────────────
function DrawerContent({ section, data, onChange }: { section: SectionId | null; data: ProjectsData; onChange: (patch: Partial<ProjectsData>) => void }) {
  if (!section) return null

  switch (section) {
    case 'hero': return (
      <div className="adm-field">
        <label className="adm-label">Subtítulo (lede da página)</label>
        <p className="adm-muted" style={{ fontSize: 11, marginBottom: 6 }}>Exibido abaixo do título &quot;Projetos&quot; no hero escuro.</p>
        <textarea
          className="adm-input adm-textarea"
          rows={3}
          value={data.projectsHeroSub}
          onChange={e => onChange({ projectsHeroSub: e.target.value })}
          placeholder="Direção audiovisual, fotografia e social media."
        />
      </div>
    )
    case 'manifesto': return (
      <>
        <div className="adm-field">
          <label className="adm-label">Texto do manifesto</label>
          <p className="adm-muted" style={{ fontSize: 11, marginBottom: 6 }}>Exibido com animação de scroll, palavra por palavra, ao final da página.</p>
          <textarea
            className="adm-input adm-textarea"
            rows={6}
            value={data.projectsManifestoText}
            onChange={e => onChange({ projectsManifestoText: e.target.value })}
            placeholder="Cada projeto começa por uma conversa..."
          />
        </div>
        <ImageField
          label="Imagem ao lado do manifesto"
          hint="Aparece à esquerda do texto (proporção 3:4 recomendada)."
          value={data.projectsManifestoImageUrl}
          onChange={url => onChange({ projectsManifestoImageUrl: url })}
        />
      </>
    )
    default: return null
  }
}

// ─── Category badge ───────────────────────────────────────────
function CategoryBadge({ cat }: { cat: string }) {
  const cls = cat === 'Social' ? 'adm-tag--social' : cat === 'Filme' ? 'adm-tag--primary' : ''
  return <span className={`adm-tag ${cls}`}>{cat}</span>
}

// ─── Action menu ──────────────────────────────────────────────
function ActionMenu({ project, onDelete }: { project: Project; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} className="adm-action-menu">
      <button className="adm-btn adm-btn--xs adm-btn--ghost adm-action-trigger" onClick={() => setOpen(o => !o)} aria-label="Ações">
        ···
      </button>
      {open && (
        <div className="adm-action-dropdown">
          <Link href={`/projects/${project.slug}`} target="_blank" className="adm-action-item" onClick={() => setOpen(false)}>
            <span className="adm-action-icon">↗</span>Visualizar projeto
          </Link>
          <Link href={`/admin/projects/${project.id}`} className="adm-action-item" onClick={() => setOpen(false)}>
            <span className="adm-action-icon">✎</span>Editar projeto
          </Link>
          <div className="adm-action-sep" />
          <button className="adm-action-item adm-action-item--danger" onClick={() => { setOpen(false); onDelete() }}>
            <span className="adm-action-icon">✕</span>Excluir projeto
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────
export default function ProjectsAdminPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [data, setData] = useState<ProjectsData>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<SectionId | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const dragId = useRef<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const loadProjects = async () => {
    const res = await fetch('/api/projects')
    if (res.ok) setProjects(await res.json())
  }

  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then(r => r.ok ? r.json() : []),
      fetch('/api/home-settings').then(r => r.ok ? r.json() : null),
    ]).then(([ps, settings]) => {
      setProjects(Array.isArray(ps) ? ps : [])
      if (settings) {
        setData({
          projectsHeroSub: settings.projectsHeroSub ?? DEFAULTS.projectsHeroSub,
          projectsManifestoText: settings.projectsManifestoText ?? DEFAULTS.projectsManifestoText,
          projectsManifestoImageUrl: settings.projectsManifestoImageUrl ?? DEFAULTS.projectsManifestoImageUrl,
        })
      }
      setLoading(false)
    })
  }, [])

  const closeDrawer = useCallback(() => setActiveSection(null), [])
  const handleChange = useCallback((patch: Partial<ProjectsData>) => {
    setData(prev => ({ ...prev, ...patch }))
  }, [])

  const save = async () => {
    if (!activeSection) return
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/home-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getSectionPayload(activeSection, data)),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        setSaveError(err?.error ?? `Erro ${res.status}`)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      setSaveError('Erro de rede.')
    }
    setSaving(false)
  }

  const filtered = projects.filter(p => {
    const matchCat = activeCategory === 'Todos' || p.category === activeCategory
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const counts: Record<string, number> = { Todos: projects.length }
  for (const cat of ['Filme', 'Foto', 'Social']) {
    counts[cat] = projects.filter(p => p.category === cat).length
  }

  const handleDragStart = (id: string) => { dragId.current = id }
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOver(id) }
  const handleDrop = async (targetId: string) => {
    if (!dragId.current || dragId.current === targetId) { setDragOver(null); return }
    const from = projects.findIndex(p => p.id === dragId.current)
    const to = projects.findIndex(p => p.id === targetId)
    const reordered = [...projects]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    setProjects(reordered)
    setDragOver(null)
    dragId.current = null
    await Promise.all(reordered.map((p, i) =>
      fetch(`/api/projects/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: i }),
      })
    ))
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir projeto permanentemente?')) return
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    loadProjects()
  }

  const activeSectionConfig = SECTIONS.find(s => s.id === activeSection)
  const isDrawerOpen = activeSection !== null

  if (loading) {
    return (
      <AdminShell breadcrumbs={[{ label: 'Projetos' }]}>
        <div className="adm-page">
          <p className="adm-muted" style={{ padding: '60px 0', textAlign: 'center' }}>Carregando...</p>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell breadcrumbs={[{ label: 'Projetos' }]}>
      <div className="adm-page">

        {/* Header */}
        <div className="adm-page-head">
          <div>
            <p className="adm-mono adm-muted">CMS</p>
            <h1 className="adm-h1">Projetos</h1>
            <p className="adm-sub">Gerencie os projetos e o conteúdo da página de projetos.</p>
          </div>
          <div className="adm-page-head-actions">
            <Link href="/projects" target="_blank" className="adm-btn">Ver página →</Link>
            <Link href="/admin/projects/new" className="adm-btn adm-btn--primary">+ Novo projeto</Link>
          </div>
        </div>

        {/* Section cards */}
        <div className="adm-proj-top">
          {SECTIONS.map(section => (
            <button
              key={section.id}
              className="adm-section-card"
              onClick={() => setActiveSection(section.id)}
            >
              <div className="adm-section-card-head">
                <div className="adm-section-card-icon">{section.icon}</div>
                <span className="adm-section-card-badge">{section.badge(data)}</span>
              </div>
              <div className="adm-section-card-name">{section.name}</div>
              <div className="adm-section-card-preview">{section.preview(data)}</div>
              <div className="adm-section-card-foot">
                <span className="adm-section-card-foot-label">Clique para editar</span>
                <span style={{ fontSize: 13, color: 'var(--fg-muted)' }}>→</span>
              </div>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 20px' }} />

        {/* Toolbar */}
        <div className="adm-toolbar">
          <div className="adm-tabs">
            {CATEGORIES.map(cat => (
              <button key={cat} className={`adm-tab${activeCategory === cat ? ' is-active' : ''}`} onClick={() => setActiveCategory(cat)}>
                {cat}<span className="adm-tab-count">{counts[cat] ?? 0}</span>
              </button>
            ))}
          </div>
          <div className="adm-toolbar-grow" />
          <div className="adm-search adm-search--inline">
            <span className="adm-search-icon">⌕</span>
            <input
              className="adm-search-input"
              placeholder="Buscar projetos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="adm-table">
          <div className="adm-table-head">
            <span />
            <span className="adm-mono adm-muted">#</span>
            <span className="adm-mono adm-muted">Capa</span>
            <span className="adm-mono adm-muted">Projeto</span>
            <span className="adm-mono adm-muted adm-table-cell--cat">Categoria</span>
            <span className="adm-mono adm-muted adm-table-cell--year">Ano</span>
            <span className="adm-mono adm-muted adm-table-cell--status">Status</span>
            <span className="adm-mono adm-muted">Ações</span>
          </div>

          {filtered.map((project, i) => (
            <div
              key={project.id}
              className={`adm-table-row${dragId.current === project.id ? ' is-dragging' : ''}${dragOver === project.id ? ' is-over' : ''}`}
              draggable
              onDragStart={() => handleDragStart(project.id)}
              onDragOver={e => handleDragOver(e, project.id)}
              onDrop={() => handleDrop(project.id)}
              onDragEnd={() => setDragOver(null)}
            >
              <span className="adm-drag-handle">⠿</span>
              <span className="adm-mono adm-muted adm-table-cell--num">{String(i + 1).padStart(2, '0')}</span>
              <div className="adm-thumb" style={{ background: 'var(--surface-2)' }} />
              <div>
                <Link href={`/admin/projects/${project.id}`} className="adm-table-title">{project.title}</Link>
                <div className="adm-muted" style={{ fontSize: 12 }}>{project.client}</div>
              </div>
              <span className="adm-table-cell--cat"><CategoryBadge cat={project.category} /></span>
              <span className="adm-mono adm-muted adm-table-cell--year">{project.year}</span>
              <span className="adm-table-cell--status">
                <span className={`adm-status${project.status === 'published' ? ' adm-status--live' : ' adm-status--saved'}`}>
                  <span className="adm-status-dot" style={{ background: project.status === 'published' ? 'var(--success)' : 'var(--fg-subtle)' }} />
                  {project.status === 'published' ? 'Publicado' : 'Rascunho'}
                </span>
              </span>
              <div className="adm-table-cell--actions">
                <ActionMenu project={project} onDelete={() => handleDelete(project.id)} />
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <p className="adm-muted">Nenhum projeto encontrado.</p>
            </div>
          )}
        </div>

      </div>

      {/* Backdrop */}
      <div className={`adm-drawer-backdrop${isDrawerOpen ? ' is-open' : ''}`} onClick={closeDrawer} />

      {/* Drawer */}
      <div className={`adm-drawer${isDrawerOpen ? ' is-open' : ''}`}>
        <div className="adm-drawer-head">
          <span className="adm-drawer-head-icon">{activeSectionConfig?.icon}</span>
          <span className="adm-drawer-head-title">{activeSectionConfig?.name ?? 'Seção'}</span>
          {saved && (
            <span className="adm-status adm-status--saved">
              <span className="adm-status-dot" />Salvo
            </span>
          )}
          <button className="adm-btn adm-btn--ghost adm-btn--xs" onClick={closeDrawer}>✕</button>
        </div>
        <div className="adm-drawer-body">
          <DrawerContent section={activeSection} data={data} onChange={handleChange} />
        </div>
        <div className="adm-drawer-foot">
          {saveError && <span style={{ fontSize: 12, color: 'var(--danger)', flex: 1 }}>{saveError}</span>}
          <button className="adm-btn" onClick={closeDrawer}>Fechar</button>
          <button className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar seção'}
          </button>
        </div>
      </div>
    </AdminShell>
  )
}
