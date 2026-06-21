'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminShell from '@/components/admin/AdminShell'
import type { Project, Media } from '@/lib/db/schema'

type MediaWithUrl = Media & { url: string }

// ─── helpers ─────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 2) return 'agora mesmo'
  if (m < 60) return `há ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `há ${d}d`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

// ─── Sub-components ───────────────────────────────────────────────

function StatCard({ label, value, sub, href }: { label: string; value: number | string; sub?: string; href: string }) {
  return (
    <Link href={href} className="adm-dash-stat">
      <span className="adm-dash-stat-label">{label}</span>
      <span className="adm-dash-stat-value">{value}</span>
      {sub && <span className="adm-dash-stat-sub">{sub}</span>}
    </Link>
  )
}

function NavCard({
  icon, label, sub, href, count,
}: { icon: string; label: string; sub: string; href: string; count?: number }) {
  return (
    <Link href={href} className="adm-dash-nav">
      <span className="adm-dash-nav-icon">{icon}</span>
      <div className="adm-dash-nav-text">
        <span className="adm-dash-nav-label">{label}</span>
        <span className="adm-dash-nav-sub">{sub}</span>
      </div>
      {count !== undefined && (
        <span className="adm-dash-nav-count">{count}</span>
      )}
      <span className="adm-dash-nav-arrow">→</span>
    </Link>
  )
}

// ─── Main ─────────────────────────────────────────────────────────

interface Stats {
  published: number
  drafts: number
  media: number
  links: number
  totalProjects: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ published: 0, drafts: 0, media: 0, links: 0, totalProjects: 0 })
  const [projects, setProjects] = useState<Project[]>([])
  const [recentMedia, setRecentMedia] = useState<MediaWithUrl[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [projRes, mediaRes, linksRes] = await Promise.allSettled([
        fetch('/api/projects').then(r => r.ok ? r.json() : []),
        fetch('/api/media').then(r => r.ok ? r.json() : []),
        fetch('/api/links').then(r => r.ok ? r.json() : []),
      ])

      const projs: Project[] = projRes.status === 'fulfilled' ? (Array.isArray(projRes.value) ? projRes.value : []) : []
      const media: MediaWithUrl[] = mediaRes.status === 'fulfilled' ? (Array.isArray(mediaRes.value) ? mediaRes.value : []) : []
      const links = linksRes.status === 'fulfilled' ? (Array.isArray(linksRes.value) ? linksRes.value : []) : []

      const published = projs.filter(p => p.status === 'published').length
      const drafts = projs.filter(p => p.status === 'draft').length

      setStats({ published, drafts, media: media.length, links: links.length, totalProjects: projs.length })
      setProjects(projs.slice(0, 8))
      setRecentMedia(media.filter(m => !m.mimeType?.startsWith('video/')).slice(0, 8))
      setLoading(false)
    }
    load()
  }, [])

  const CAT_COLORS: Record<string, string> = {
    Filme: '#6366f1',
    Foto: '#f59e0b',
    Social: '#10b981',
  }

  return (
    <AdminShell breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="adm-page">

        {/* ── Greeting ── */}
        <div className="adm-dash-greeting">
          <div>
            <p className="adm-mono adm-muted">{greeting()},</p>
            <h1 className="adm-h1">Lucas</h1>
          </div>
          <Link href="/admin/projects/new" className="adm-btn adm-btn--primary">
            + Novo projeto
          </Link>
        </div>

        {/* ── Stats ── */}
        <div className="adm-dash-stats">
          <StatCard label="Publicados" value={stats.published} sub="projetos live" href="/admin/projects" />
          <StatCard label="Rascunhos" value={stats.drafts} sub="aguardando" href="/admin/projects" />
          <StatCard label="Mídias" value={stats.media} sub="na biblioteca" href="/admin/media" />
          <StatCard label="Links" value={stats.links} sub="na página /links" href="/admin/links" />
          <StatCard label="Total" value={stats.totalProjects} sub="projetos criados" href="/admin/projects" />
        </div>

        {/* ── Main 2-col ── */}
        <div className="adm-dash-body">

          {/* Left: recent projects */}
          <div className="adm-card">
            <div className="adm-card-head">
              <span className="adm-h6">Projetos recentes</span>
              <Link href="/admin/projects" className="adm-mono adm-muted" style={{ fontSize: 11, letterSpacing: '.06em' }}>
                Ver todos →
              </Link>
            </div>
            <div className="adm-card-body" style={{ padding: 0 }}>
              {loading ? (
                <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                  <span className="adm-mono adm-muted" style={{ fontSize: 12 }}>Carregando…</span>
                </div>
              ) : projects.length === 0 ? (
                <div className="adm-dash-empty">
                  <p className="adm-muted">Nenhum projeto ainda.</p>
                  <Link href="/admin/projects/new" className="adm-btn adm-btn--primary" style={{ marginTop: 12 }}>
                    Criar primeiro projeto
                  </Link>
                </div>
              ) : (
                <div className="adm-dash-proj-list">
                  {projects.map(p => (
                    <Link key={p.id} href={`/admin/projects/${p.id}`} className="adm-dash-proj-row">
                      <span
                        className="adm-dash-proj-dot"
                        style={{ background: CAT_COLORS[p.category] ?? 'var(--fg-muted)' }}
                      />
                      <span className="adm-dash-proj-title">{p.title}</span>
                      <span className="adm-dash-proj-cat">{p.category}</span>
                      <span className="adm-dash-proj-year">{p.year}</span>
                      <span className={`adm-dash-proj-status${p.status === 'published' ? ' is-live' : ''}`}>
                        {p.status === 'published' ? 'Live' : 'Draft'}
                      </span>
                      <span className="adm-dash-proj-arrow">→</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: navigation */}
          <div className="adm-card">
            <div className="adm-card-head">
              <span className="adm-h6">Seções do CMS</span>
            </div>
            <div className="adm-card-body" style={{ padding: '8px 12px' }}>
              <NavCard icon="⊞" label="Projetos" sub="Criar e gerenciar cases" href="/admin/projects" count={stats.totalProjects} />
              <NavCard icon="⬜" label="Mídia" sub="Biblioteca de arquivos" href="/admin/media" count={stats.media} />
              <NavCard icon="◎" label="Home" sub="Tiles, manifesto e hero" href="/admin/home" />
              <NavCard icon="◉" label="Sobre" sub="Retrato, bio e trajetória" href="/admin/about" />
              <NavCard icon="↗" label="Links" sub="Página /links" href="/admin/links" count={stats.links} />
              <NavCard icon="⚙" label="Configurações" sub="Domínio, SEO e meta" href="/admin/settings" />
            </div>
          </div>
        </div>

        {/* ── Recent media strip ── */}
        {recentMedia.length > 0 && (
          <div className="adm-card">
            <div className="adm-card-head">
              <span className="adm-h6">Mídias recentes</span>
              <Link href="/admin/media" className="adm-mono adm-muted" style={{ fontSize: 11, letterSpacing: '.06em' }}>
                Ver todas →
              </Link>
            </div>
            <div className="adm-card-body">
              <div className="adm-dash-media-strip">
                {recentMedia.map(m => (
                  <div key={m.id} className="adm-dash-media-thumb" title={m.originalName}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt={m.alt || m.originalName} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminShell>
  )
}
