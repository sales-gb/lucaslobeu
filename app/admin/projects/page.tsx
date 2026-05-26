'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import type { Project } from '@/lib/db/schema'

const CATEGORIES = ['Todos', 'Filme', 'Foto', 'Social']

function CategoryBadge({ cat }: { cat: string }) {
  const cls = cat === 'Social' ? 'adm-tag--social' : cat === 'Filme' ? 'adm-tag--primary' : ''
  return <span className={`adm-tag ${cls}`}>{cat}</span>
}

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
      <button
        className="adm-btn adm-btn--xs adm-btn--ghost adm-action-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-label="Ações"
      >
        ···
      </button>
      {open && (
        <div className="adm-action-dropdown">
          <Link
            href={`/projects/${project.slug}`}
            target="_blank"
            className="adm-action-item"
            onClick={() => setOpen(false)}
          >
            <span className="adm-action-icon">↗</span>
            Visualizar projeto
          </Link>
          <Link
            href={`/admin/projects/${project.id}`}
            className="adm-action-item"
            onClick={() => setOpen(false)}
          >
            <span className="adm-action-icon">✎</span>
            Editar projeto
          </Link>
          <div className="adm-action-sep" />
          <button
            className="adm-action-item adm-action-item--danger"
            onClick={() => { setOpen(false); onDelete() }}
          >
            <span className="adm-action-icon">✕</span>
            Excluir projeto
          </button>
        </div>
      )}
    </div>
  )
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const dragId = useRef<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const load = async () => {
    const res = await fetch('/api/projects')
    if (res.ok) setProjects(await res.json())
  }

  useEffect(() => { load() }, [])

  const filtered = projects.filter((p) => {
    const matchCat = activeCategory === 'Todos' || p.category === activeCategory
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const counts: Record<string, number> = { Todos: projects.length }
  for (const cat of ['Filme', 'Foto', 'Social']) {
    counts[cat] = projects.filter((p) => p.category === cat).length
  }

  const handleDragStart = (id: string) => { dragId.current = id }
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOver(id) }
  const handleDrop = async (targetId: string) => {
    if (!dragId.current || dragId.current === targetId) { setDragOver(null); return }
    const from = projects.findIndex((p) => p.id === dragId.current)
    const to = projects.findIndex((p) => p.id === targetId)
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
    load()
  }

  return (
    <AdminShell breadcrumbs={[{ label: 'Projetos' }]}>
      <div className="adm-page">
        <div className="adm-page-head">
          <div>
            <p className="adm-mono adm-muted">Gerenciar</p>
            <h1 className="adm-h1">Projetos</h1>
          </div>
          <div className="adm-page-head-actions">
            <Link href="/admin/projects/new" className="adm-btn adm-btn--primary">
              + Novo projeto
            </Link>
          </div>
        </div>

        <div className="adm-toolbar">
          <div className="adm-tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`adm-tab${activeCategory === cat ? ' is-active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
                <span className="adm-tab-count">{counts[cat] ?? 0}</span>
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
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

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
              onDragOver={(e) => handleDragOver(e, project.id)}
              onDrop={() => handleDrop(project.id)}
              onDragEnd={() => setDragOver(null)}
            >
              <span className="adm-drag-handle">⠿</span>
              <span className="adm-mono adm-muted adm-table-cell--num">{String(i + 1).padStart(2, '0')}</span>
              <div className="adm-thumb" style={{ background: 'var(--surface-2)' }} />
              <div>
                <Link href={`/admin/projects/${project.id}`} className="adm-table-title">
                  {project.title}
                </Link>
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
    </AdminShell>
  )
}
