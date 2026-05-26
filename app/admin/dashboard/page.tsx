'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminShell from '@/components/admin/AdminShell'

interface Stats {
  projects: number
  journal: number
  links: number
  tiles: number
}

const RECENT_ACTIVITY = [
  { type: 'Projeto', title: 'Campanha Inverno 24', cat: 'Foto', time: 'agora mesmo' },
  { type: 'Projeto', title: 'Direção Vídeo Institucional', cat: 'Filme', time: 'há 2 dias' },
  { type: 'Mídia', title: 'hero-001.jpg', cat: 'Upload', time: 'há 3 dias' },
  { type: 'Link', title: 'Instagram @lucaslobeu', cat: 'Social', time: 'há 1 semana' },
]

const SHORTCUTS = [
  { icon: '☰', label: 'Novo projeto', sub: 'Criar projeto', href: '/admin/projects' },
  { icon: '▢', label: 'Upload de mídia', sub: 'Biblioteca de imagens', href: '/admin/media' },
  { icon: '◯', label: 'Editar home', sub: 'Tiles e manifesto', href: '/admin/home' },
  { icon: '↗', label: 'Gerenciar links', sub: 'Página /links', href: '/admin/links' },
]

// Simple SVG sparkline
function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1)
  const w = 200
  const h = 40
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - (v / max) * h
    return `${x},${y}`
  })
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke="var(--fg)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />
    </svg>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ projects: 0, journal: 0, links: 0, tiles: 0 })

  useEffect(() => {
    const load = async () => {
      const [projects, journal, links, tiles] = await Promise.all([
        fetch('/api/projects').then((r) => r.json()),
        fetch('/api/journal').then((r) => r.json()),
        fetch('/api/links').then((r) => r.json()),
        fetch('/api/home-tiles').then((r) => r.json()),
      ])
      setStats({
        projects: Array.isArray(projects) ? projects.length : 0,
        journal: Array.isArray(journal) ? journal.length : 0,
        links: Array.isArray(links) ? links.length : 0,
        tiles: Array.isArray(tiles) ? tiles.length : 0,
      })
    }
    load()
  }, [])

  return (
    <AdminShell breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="adm-page">
        <div className="adm-page-head">
          <div>
            <p className="adm-mono adm-muted">Visão geral</p>
            <h1 className="adm-h1">Dashboard</h1>
          </div>
        </div>

        <div className="adm-stats">
          <div className="adm-stat-card">
            <span className="adm-mono adm-muted">Projetos</span>
            <div className="adm-stat-value">{stats.projects}</div>
            <Sparkline values={[2, 3, 2, 5, 4, 6, stats.projects]} />
          </div>
          <div className="adm-stat-card">
            <span className="adm-mono adm-muted">Diário</span>
            <div className="adm-stat-value">{stats.journal}</div>
            <Sparkline values={[0, 1, 1, 2, 2, 3, stats.journal]} />
          </div>
          <div className="adm-stat-card">
            <span className="adm-mono adm-muted">Links</span>
            <div className="adm-stat-value">{stats.links}</div>
            <Sparkline values={[1, 2, 3, 4, 5, 6, stats.links]} />
          </div>
          <div className="adm-stat-card">
            <span className="adm-mono adm-muted">Tiles na Home</span>
            <div className="adm-stat-value">{stats.tiles}</div>
            <Sparkline values={[0, 2, 3, 4, 5, 6, stats.tiles]} />
          </div>
        </div>

        <div className="adm-cols-2">
          <div className="adm-card">
            <div className="adm-card-head">
              <span className="adm-h6">Atividade recente</span>
            </div>
            <div className="adm-card-body">
              <div className="adm-recent-list">
                {RECENT_ACTIVITY.map((item, i) => (
                  <div key={i} className="adm-recent-row">
                    <span className="adm-tag">{item.type}</span>
                    <span className="adm-recent-title">{item.title}</span>
                    <span className="adm-tag">{item.cat}</span>
                    <span className="adm-muted" style={{ fontSize: 12 }}>{item.time}</span>
                    <span className="adm-recent-arrow">→</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="adm-card">
            <div className="adm-card-head">
              <span className="adm-h6">Atalhos</span>
            </div>
            <div className="adm-card-body">
              <div className="adm-shortcuts">
                {SHORTCUTS.map((s) => (
                  <Link key={s.href} href={s.href} className="adm-shortcut">
                    <span className="adm-shortcut-icon">{s.icon}</span>
                    <div>
                      <div className="adm-h6">{s.label}</div>
                      <div className="adm-muted" style={{ fontSize: 12 }}>{s.sub}</div>
                    </div>
                    <span className="adm-muted">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
