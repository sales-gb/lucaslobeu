'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import AdminShell from '@/components/admin/AdminShell'
import { optimizeImageForUpload } from '@/lib/images/client-optimize'
import type { Company, TrajectoryItem } from '@/features/about/types'

// ─── Types ────────────────────────────────────────────────────
interface MediaItem { id: string; url: string; alt: string; filename: string; mimeType?: string }

interface AboutData {
  intro: string
  body: string[]
  numbers: [string, string][]
  trajectory: TrajectoryItem[]
  companies: Company[]
  contactBlurb: string
  portraitImageUrl: string
}

type SectionId = 'intro' | 'body' | 'numbers' | 'trajectory' | 'companies' | 'cta'

// ─── Defaults ────────────────────────────────────────────────
const DEFAULTS: AboutData = {
  intro: 'Acredito que a fotografia e o cinema compartilham um segredo: a melhor imagem é sempre aquela que o espectador completa.',
  body: [],
  numbers: [
    ['72', 'Projetos'],
    ['08', 'Países'],
    ['3—4', 'Por trimestre'],
  ],
  trajectory: [
    { year: '2019', title: 'O primeiro estúdio', description: 'Um porão na Vila Madalena e a teimosia de não separar foto de filme.' },
    { year: '2021', title: 'Primeira capa', description: 'Direção e fotografia para a Pano nº 07.' },
    { year: '2023', title: 'Mudança para o Bom Retiro', description: 'Estúdio próprio e os primeiros contratos recorrentes de marca.' },
    { year: '2026', title: 'Hoje', description: 'Três a quatro projetos por trimestre.' },
  ],
  companies: [
    { name: 'Natura', year: '2024', imageUrl: '', instagramUrl: '' },
    { name: 'Itaú', year: '2023', imageUrl: '', instagramUrl: '' },
    { name: 'Havaianas', year: '2023', imageUrl: '', instagramUrl: '' },
    { name: 'Heineken', year: '2022', imageUrl: '', instagramUrl: '' },
  ],
  contactBlurb: 'O estúdio aceita três a quatro projetos por trimestre. Se o seu projeto faz sentido, vamos conversar.',
  portraitImageUrl: '',
}

// ─── Media Picker ─────────────────────────────────────────────
function MediaPicker({
  open, onClose, onSelect,
}: { open: boolean; onClose: () => void; onSelect: (url: string) => void }) {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!open) return
    fetch('/api/media').then(r => r.ok ? r.json() : []).then(setMedia)
    setSelected(null)
  }, [open])

  const upload = async (file: File) => {
    // Cobre as duas etapas lentas: otimização no browser (canvas/WebP) + upload.
    // O placeholder de loading no grid fica visível durante todo o intervalo.
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', await optimizeImageForUpload(file))
      const res = await fetch('/api/media', { method: 'POST', body: fd })
      if (res.ok) {
        const item = await res.json()
        const url: string = item.url ?? `/uploads/${item.filename}`
        setMedia(prev => [{ id: item.id, url, alt: item.alt ?? '', filename: item.filename, mimeType: item.mimeType }, ...prev])
        setSelected(url) // já deixa o recém-enviado pronto pra "Usar imagem"
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`adm-media-picker-overlay${open ? ' is-open' : ''}`} onClick={onClose}>
      <div className="adm-media-picker" onClick={e => e.stopPropagation()}>
        <div className="adm-media-picker-head">
          <div>
            <div className="adm-h6">Biblioteca de mídia</div>
            <p className="adm-muted" style={{ fontSize: 12, marginTop: 2 }}>Selecione uma imagem ou faça upload</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <label className="adm-btn adm-btn--sm" style={{ cursor: 'pointer' }}>
              {uploading ? 'Enviando...' : '+ Upload'}
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }}
              />
            </label>
            {selected && (
              <button
                className="adm-btn adm-btn--primary adm-btn--sm"
                onClick={() => { onSelect(selected); onClose() }}
              >
                Usar imagem
              </button>
            )}
            <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={onClose}>✕</button>
          </div>
        </div>
        {media.length === 0 && !uploading ? (
          <div className="adm-media-picker-empty">
            <p className="adm-muted">Nenhuma imagem no acervo. Faça upload acima.</p>
          </div>
        ) : (
          <div className="adm-media-picker-grid">
            {uploading && (
              <div className="adm-media-picker-item is-loading" aria-busy="true" aria-label="Enviando imagem">
                <span className="adm-media-picker-spinner" aria-hidden />
                <span className="adm-media-picker-loading-label">Otimizando…</span>
              </div>
            )}
            {media.filter(m => !/\.mp4$/i.test(m.url)).map(m => (
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

// ─── Image field with picker ──────────────────────────────────
function ImageField({
  label, hint, value, onChange,
}: { label: string; hint?: string; value: string; onChange: (url: string) => void }) {
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

// ─── Array editors ────────────────────────────────────────────
function PairEditor({
  value, onChange, col1Label, col1Placeholder, col2Label, col2Placeholder, addLabel,
}: {
  value: [string, string][]
  onChange: (v: [string, string][]) => void
  col1Label: string
  col1Placeholder: string
  col2Label: string
  col2Placeholder: string
  addLabel: string
}) {
  const add = () => onChange([...value, ['', '']])
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const update = (i: number, col: 0 | 1, v: string) =>
    onChange(value.map((row, idx) => idx === i ? [col === 0 ? v : row[0], col === 1 ? v : row[1]] as [string, string] : row))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {value.map((row, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 8, alignItems: 'end' }}>
          <div className="adm-field">
            {i === 0 && <label className="adm-label">{col1Label}</label>}
            <input className="adm-input adm-mono" value={row[0]} onChange={e => update(i, 0, e.target.value)} placeholder={col1Placeholder} />
          </div>
          <div className="adm-field">
            {i === 0 && <label className="adm-label">{col2Label}</label>}
            <input className="adm-input" value={row[1]} onChange={e => update(i, 1, e.target.value)} placeholder={col2Placeholder} />
          </div>
          <button className="adm-btn adm-btn--xs adm-btn--danger" style={{ marginBottom: 1 }} onClick={() => remove(i)}>✕</button>
        </div>
      ))}
      <button className="adm-btn adm-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={add}>+ {addLabel}</button>
    </div>
  )
}

function BodyEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const add = () => onChange([...value, ''])
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const update = (i: number, v: string) => onChange(value.map((p, idx) => idx === i ? v : p))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {value.map((para, i) => (
        <div key={i} className="adm-field">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <label className="adm-label">Parágrafo {i + 1}</label>
            <button className="adm-btn adm-btn--xs adm-btn--danger" onClick={() => remove(i)}>✕</button>
          </div>
          <textarea className="adm-input adm-textarea" rows={3} value={para} onChange={e => update(i, e.target.value)} placeholder="Texto do parágrafo..." />
        </div>
      ))}
      <button className="adm-btn adm-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={add}>+ Adicionar parágrafo</button>
    </div>
  )
}

// Trajetória: ano + título + descrição.
function TrajectoryEditor({ value, onChange }: { value: TrajectoryItem[]; onChange: (v: TrajectoryItem[]) => void }) {
  const add = () => onChange([...value, { year: '', title: '', description: '' }])
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const update = (i: number, patch: Partial<TrajectoryItem>) =>
    onChange(value.map((row, idx) => idx === i ? { ...row, ...patch } : row))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {value.map((row, i) => (
        <div key={i} style={{ border: '0.5px solid var(--border)', borderRadius: 6, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 8, alignItems: 'end' }}>
            <div className="adm-field">
              <label className="adm-label">Ano</label>
              <input className="adm-input adm-mono" value={row.year} onChange={e => update(i, { year: e.target.value })} placeholder="2019" />
            </div>
            <div className="adm-field">
              <label className="adm-label">Título</label>
              <input className="adm-input" value={row.title} onChange={e => update(i, { title: e.target.value })} placeholder="O primeiro estúdio" />
            </div>
            <button className="adm-btn adm-btn--xs adm-btn--danger" style={{ marginBottom: 1 }} onClick={() => remove(i)}>✕</button>
          </div>
          <div className="adm-field">
            <label className="adm-label">Descrição</label>
            <textarea className="adm-input adm-textarea" rows={2} value={row.description ?? ''} onChange={e => update(i, { description: e.target.value })} placeholder="Uma frase sobre esse marco..." />
          </div>
        </div>
      ))}
      <button className="adm-btn adm-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={add}>+ Adicionar marco</button>
    </div>
  )
}

// ─── Section config ───────────────────────────────────────────
interface SectionConfig {
  id: SectionId
  icon: string
  name: string
  preview: (data: AboutData) => string
  badge: (data: AboutData) => string
}

const SECTIONS_TOP: SectionConfig[] = [
  {
    id: 'intro', icon: '◎', name: 'Retrato + Intro',
    preview: d => d.intro ? d.intro.slice(0, 90) + (d.intro.length > 90 ? '...' : '') : 'Sem texto definido',
    badge: d => d.portraitImageUrl ? 'Imagem + texto' : 'Texto',
  },
  {
    id: 'body', icon: '¶', name: 'Corpo',
    preview: d => d.body.length > 0 ? d.body[0].slice(0, 80) + '...' : 'Usando texto padrão',
    badge: d => d.body.length > 0 ? `${d.body.length} parágrafos` : 'Padrão',
  },
  {
    id: 'trajectory', icon: '⟲', name: 'Trajetória',
    preview: d => d.trajectory.length > 0 ? d.trajectory.map(t => `${t.year} — ${t.title}`).slice(0, 2).join(' · ') : 'Usando padrão',
    badge: d => d.trajectory.length > 0 ? `${d.trajectory.length} marcos` : 'Padrão',
  },
  {
    id: 'cta', icon: '→', name: 'CTA Final',
    preview: d => d.contactBlurb || 'O estúdio aceita três a quatro projetos por trimestre...',
    badge: () => 'Texto',
  },
]

const SECTIONS_LIST: SectionConfig[] = [
  {
    id: 'numbers', icon: '▦', name: 'Números',
    preview: d => d.numbers.length > 0 ? d.numbers.map(([v, l]) => `${v} ${l}`).join(' · ') : 'Usando padrão',
    badge: d => d.numbers.length > 0 ? `${d.numbers.length} itens` : 'Padrão',
  },
  {
    id: 'companies', icon: '◈', name: 'Empresas',
    preview: () => 'Módulo global de clientes',
    badge: () => 'Global',
  },
]

// ─── Drawer content ───────────────────────────────────────────
function DrawerContent({
  section, data, onChange,
}: { section: SectionId | null; data: AboutData; onChange: (patch: Partial<AboutData>) => void }) {
  if (!section) return null

  switch (section) {
    case 'intro': return (
      <>
        <ImageField
          label="Foto de perfil (portrait)"
          hint="Proporção 3:4 recomendada. Aparece ao lado do texto intro."
          value={data.portraitImageUrl}
          onChange={url => onChange({ portraitImageUrl: url })}
        />
        <div className="adm-field">
          <label className="adm-label">Texto de intro</label>
          <p className="adm-muted" style={{ fontSize: 11, marginBottom: 6 }}>Frase de abertura, revelada palavra a palavra no scroll.</p>
          <textarea className="adm-input adm-textarea" rows={4} value={data.intro} onChange={e => onChange({ intro: e.target.value })} placeholder="Acredito que a fotografia e o cinema..." />
        </div>
      </>
    )

    case 'body': return (
      <>
        <p className="adm-muted" style={{ fontSize: 12, marginBottom: 8 }}>
          Parágrafos do corpo exibidos abaixo do texto de intro. Quando vazio, nada é exibido.
        </p>
        <BodyEditor value={data.body} onChange={v => onChange({ body: v })} />
      </>
    )

    case 'numbers': return (
      <>
        <p className="adm-muted" style={{ fontSize: 12, marginBottom: 8 }}>
          Números em destaque ao final da seção intro. Quando vazio, usa os valores padrão.
        </p>
        <PairEditor
          value={data.numbers}
          onChange={v => onChange({ numbers: v })}
          col1Label="Valor"
          col1Placeholder="72"
          col2Label="Label"
          col2Placeholder="Projetos"
          addLabel="Adicionar número"
        />
      </>
    )

    case 'trajectory': return (
      <>
        <p className="adm-muted" style={{ fontSize: 12, marginBottom: 8 }}>
          Linha do tempo da seção Trajetória — ano, título e uma descrição curta. Quando vazio, usa os marcos padrão.
        </p>
        <TrajectoryEditor value={data.trajectory} onChange={v => onChange({ trajectory: v })} />
      </>
    )

    case 'companies': return (
      <div className="adm-field">
        <p className="adm-muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
          As marcas da seção Empresas agora vêm do módulo global de clientes, compartilhado com a Home.
          No hover, a imagem do trabalho surge ao lado do nome; o clique abre o Instagram.
        </p>
        <Link href="/admin/clients" className="adm-btn adm-btn--sm" style={{ alignSelf: 'flex-start', marginTop: 10, textDecoration: 'none' }}>
          Gerenciar clientes →
        </Link>
      </div>
    )

    case 'cta': return (
      <>
        <div className="adm-field">
          <label className="adm-label">Texto de contato</label>
          <p className="adm-muted" style={{ fontSize: 11, marginBottom: 6 }}>Exibido na seção final antes do link de contato.</p>
          <textarea className="adm-input adm-textarea" rows={4} value={data.contactBlurb} onChange={e => onChange({ contactBlurb: e.target.value })} placeholder="O estúdio aceita três a quatro projetos por trimestre..." />
        </div>
      </>
    )

    default: return null
  }
}

function getSectionPayload(section: SectionId, data: AboutData): Partial<AboutData> {
  switch (section) {
    case 'intro': return { intro: data.intro, portraitImageUrl: data.portraitImageUrl }
    case 'body': return { body: data.body }
    case 'numbers': return { numbers: data.numbers }
    case 'trajectory': return { trajectory: data.trajectory }
    case 'companies': return { companies: data.companies }
    case 'cta': return { contactBlurb: data.contactBlurb }
  }
}

// Normaliza os dados vindos da API para o shape do editor (tolerante a formatos antigos).
function fromApi(d: Record<string, unknown>): AboutData {
  const rawTraj = Array.isArray(d.trajectory) ? d.trajectory : []
  const trajectory: TrajectoryItem[] = rawTraj.map((row): TrajectoryItem => {
    if (Array.isArray(row)) return { year: String(row[0] ?? ''), title: String(row[1] ?? ''), description: '' }
    const r = (row ?? {}) as Record<string, unknown>
    return { year: String(r.year ?? ''), title: String(r.title ?? ''), description: r.description ? String(r.description) : '' }
  })

  const rawComp = Array.isArray(d.companies) ? d.companies : []
  let companies: Company[] = rawComp.map((row) => {
    const r = (row ?? {}) as Record<string, unknown>
    return { name: String(r.name ?? ''), imageUrl: r.imageUrl ? String(r.imageUrl) : '', instagramUrl: r.instagramUrl ? String(r.instagramUrl) : '' }
  })
  // Migra a lista antiga de clientes (string[]) quando ainda não há empresas.
  if (companies.length === 0 && Array.isArray(d.selectedClients)) {
    companies = (d.selectedClients as unknown[]).map(name => ({ name: String(name), imageUrl: '', instagramUrl: '' }))
  }

  return {
    intro: typeof d.intro === 'string' ? d.intro : DEFAULTS.intro,
    body: Array.isArray(d.body) ? d.body as string[] : DEFAULTS.body,
    numbers: Array.isArray(d.numbers) && d.numbers.length > 0 ? d.numbers as [string, string][] : DEFAULTS.numbers,
    trajectory: trajectory.length > 0 ? trajectory : DEFAULTS.trajectory,
    companies: companies.length > 0 ? companies : DEFAULTS.companies,
    contactBlurb: typeof d.contactBlurb === 'string' ? d.contactBlurb : DEFAULTS.contactBlurb,
    portraitImageUrl: typeof d.portraitImageUrl === 'string' ? d.portraitImageUrl : '',
  }
}

// ─── Main page ────────────────────────────────────────────────
export default function AdminAboutPage() {
  const [data, setData] = useState<AboutData>(DEFAULTS)
  const [activeSection, setActiveSection] = useState<SectionId | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/about').then(r => r.ok ? r.json() : null).then(d => {
      if (d) setData(fromApi(d))
      setLoading(false)
    })
  }, [])

  const closeDrawer = useCallback(() => setActiveSection(null), [])
  const handleChange = useCallback((patch: Partial<AboutData>) => {
    setData(prev => ({ ...prev, ...patch }))
  }, [])

  const save = async () => {
    if (!activeSection) return
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/about', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getSectionPayload(activeSection, data)),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        setSaveError(err?.error ?? `Erro ${res.status}`)
      } else {
        const updated = await res.json()
        if (updated) setData(fromApi(updated))
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      setSaveError('Erro de rede. Verifique sua conexão.')
    }
    setSaving(false)
  }

  const allSections = [...SECTIONS_TOP, ...SECTIONS_LIST]
  const activeSectionConfig = allSections.find(s => s.id === activeSection)
  const isDrawerOpen = activeSection !== null

  if (loading) {
    return (
      <AdminShell breadcrumbs={[{ label: 'Sobre' }]}>
        <div className="adm-page">
          <p className="adm-muted" style={{ padding: '60px 0', textAlign: 'center' }}>Carregando...</p>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell breadcrumbs={[{ label: 'Sobre' }]}>
      <div className="adm-page">

        {/* Header */}
        <div className="adm-page-head">
          <div>
            <p className="adm-mono adm-muted">CMS</p>
            <h1 className="adm-h1">Sobre</h1>
            <p className="adm-sub">Gerencie o conteúdo exibido na página sobre do site.</p>
          </div>
          <div className="adm-page-head-actions">
            <Link href="/about" target="_blank" className="adm-btn">Ver página →</Link>
          </div>
        </div>

        {/* Top 4 section cards */}
        <div className="adm-home-top">
          {SECTIONS_TOP.map(section => (
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

        {/* Bottom: sections list */}
        <div className="adm-home-body">
          <div className="adm-home-panel" style={{ flex: 1 }}>
            <div className="adm-home-panel-hd">
              <h3 className="adm-home-panel-title">Demais seções</h3>
            </div>

            <div className="adm-home-sect-list">
              {SECTIONS_LIST.map(section => (
                <button
                  key={section.id}
                  className="adm-home-sect-item"
                  onClick={() => setActiveSection(section.id)}
                >
                  <span className="adm-home-sect-icon">{section.icon}</span>
                  <span className="adm-home-sect-name">{section.name}</span>
                  <span className="adm-home-sect-badge">{section.badge(data)}</span>
                  <span style={{ fontSize: 13, color: 'var(--fg-muted)', marginLeft: 'auto' }}>→</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Backdrop */}
      <div
        className={`adm-drawer-backdrop${isDrawerOpen ? ' is-open' : ''}`}
        onClick={closeDrawer}
      />

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
          {saveError && (
            <span style={{ fontSize: 12, color: 'var(--danger)', flex: 1 }}>{saveError}</span>
          )}
          <button className="adm-btn" onClick={closeDrawer}>Fechar</button>
          <button className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar seção'}
          </button>
        </div>
      </div>

    </AdminShell>
  )
}
