'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import AdminShell from '@/components/admin/AdminShell'
import type { StatItem, TestimonialItem, FaqItem, ClientItem } from '@/components/portfolio/HomeClient'

// ─── Types ────────────────────────────────────────────────────
interface MediaItem { id: string; url: string; alt: string; filename: string; mimeType?: string }
interface ProjectPreview { id: string; title: string; client: string; year: string; category: string; status: string; sortOrder: number }

interface HomeData {
  heroRoles: string
  heroDescription: string
  aboutStatement: string
  aboutFooterHeadline: string
  ctaHeadline: string
  ctaSub: string
  stats: StatItem[]
  testimonials: TestimonialItem[]
  faqItems: FaqItem[]
  clients: ClientItem[]
  showcaseImageUrl: string
  aboutPortraitUrl: string
  aboutFooterImageUrl: string
  homeFeaturedCount: number
}

type SectionId =
  | 'hero' | 'about' | 'stats' | 'showcase'
  | 'testimonials' | 'faq' | 'clients' | 'cta'

// ─── Defaults ────────────────────────────────────────────────
const DEFAULTS: HomeData = {
  heroRoles: 'Filmmaker · Photographer · Social',
  heroDescription: 'Diretor audiovisual e fotógrafo. Narrativas visuais que movem marcas, produtos e pessoas.',
  aboutStatement: 'DIRETOR AUDIOVISUAL E FOTÓGRAFO DE SÃO PAULO. CRIO IMAGENS CLARAS, IMPACTANTES E AUTÊNTICAS PARA MARCAS E FUNDADORES — TRABALHOS QUE PARECEM CERTOS, FUNCIONAM BEM E DURAM.',
  aboutFooterHeadline: 'O TRABALHO NÃO É SÓ BONITO — ELE PERFORMA. ISSO É O QUE ESTÁ POR TRÁS DE CADA IMAGEM.',
  ctaHeadline: 'Tem um projeto?',
  ctaSub: 'O estúdio aceita três a quatro projetos por trimestre.',
  stats: [
    { val: '72+', label: 'Projetos realizados', desc: 'Campanhas, editoriais e filmes para marcas em 8 países.' },
    { val: '8', label: 'Países atendidos', desc: 'Produção em campo, do Brasil para o mundo.' },
    { val: '3–4', label: 'Projetos por trimestre', desc: 'Capacidade selecionada para máxima qualidade.' },
    { val: '2019', label: 'Ano de fundação', desc: 'Seis anos construindo referências visuais.' },
  ],
  testimonials: [],
  faqItems: [],
  clients: [],
  showcaseImageUrl: '',
  aboutPortraitUrl: '',
  aboutFooterImageUrl: '',
  homeFeaturedCount: 5,
}

// ─── Media Picker ─────────────────────────────────────────────
function MediaPicker({
  open, onClose, onSelect, acceptVideo = false,
}: { open: boolean; onClose: () => void; onSelect: (url: string) => void; acceptVideo?: boolean }) {
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
    fd.append('file', file)
    const res = await fetch('/api/media', { method: 'POST', body: fd })
    if (res.ok) {
      const item = await res.json()
      setMedia(prev => [{ id: item.id, url: item.url ?? `/uploads/${item.filename}`, alt: item.alt ?? '', filename: item.filename, mimeType: item.mimeType }, ...prev])
    }
    setUploading(false)
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
                accept={acceptVideo ? 'image/*,video/mp4' : 'image/*'}
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
        {media.length === 0 ? (
          <div className="adm-media-picker-empty">
            <p className="adm-muted">Nenhuma imagem no acervo. Faça upload acima.</p>
          </div>
        ) : (
          <div className="adm-media-picker-grid">
            {media.map(m => {
              const isVid = m.mimeType === 'video/mp4' || /\.mp4$/i.test(m.url)
              return (
                <button
                  key={m.id}
                  className={`adm-media-picker-item${selected === m.url ? ' is-selected' : ''}`}
                  onClick={() => setSelected(prev => prev === m.url ? null : m.url)}
                >
                  {isVid ? (
                    <div className="adm-media-picker-video">
                      <span className="adm-media-picker-video-icon">▶</span>
                      <span className="adm-media-picker-video-name">{m.filename}</span>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt={m.alt || m.filename} />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Image / video field with picker ─────────────────────────
function ImageField({
  label, hint, value, onChange, acceptVideo = false,
}: { label: string; hint?: string; value: string; onChange: (url: string) => void; acceptVideo?: boolean }) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const isVideo = value ? /\.mp4$/i.test(value) : false

  return (
    <>
      <div className="adm-field">
        <label className="adm-label">{label}</label>
        {hint && <p className="adm-muted" style={{ fontSize: 11, marginBottom: 6 }}>{hint}</p>}
        {value ? (
          <div className="adm-upload-preview">
            {isVideo ? (
              <video src={value} muted style={{ width: '100%', maxHeight: 180, display: 'block', objectFit: 'cover' }} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt={label} />
            )}
            <button className="adm-upload-preview-remove" onClick={() => onChange('')}>✕</button>
          </div>
        ) : (
          <div className="adm-upload-zone" onClick={() => setPickerOpen(true)}>
            <span style={{ fontSize: 22 }}>{acceptVideo ? '🎬' : '🖼'}</span>
            <span className="adm-muted" style={{ fontSize: 12 }}>
              Clique para selecionar {acceptVideo ? 'imagem ou vídeo' : 'da biblioteca'}
            </span>
          </div>
        )}
        {value && (
          <button className="adm-btn adm-btn--sm" style={{ marginTop: 8, alignSelf: 'flex-start' }} onClick={() => setPickerOpen(true)}>
            Trocar {isVideo ? 'vídeo' : 'imagem'}
          </button>
        )}
      </div>
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={onChange} acceptVideo={acceptVideo} />
    </>
  )
}

// ─── Array editors ────────────────────────────────────────────
function StatsEditor({ value, onChange }: { value: StatItem[]; onChange: (v: StatItem[]) => void }) {
  const add = () => onChange([...value, { val: '', label: '', desc: '' }])
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const update = (i: number, key: keyof StatItem, v: string) =>
    onChange(value.map((item, idx) => idx === i ? { ...item, [key]: v } : item))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {value.map((item, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '72px 1fr auto', gap: 8, alignItems: 'end' }}>
          <div className="adm-field">
            {i === 0 && <label className="adm-label">Valor</label>}
            <input className="adm-input" value={item.val} onChange={e => update(i, 'val', e.target.value)} placeholder="72+" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div className="adm-field">
              {i === 0 && <label className="adm-label">Label</label>}
              <input className="adm-input" value={item.label} onChange={e => update(i, 'label', e.target.value)} placeholder="Projetos realizados" />
            </div>
            <div className="adm-field">
              {i === 0 && <label className="adm-label">Descrição</label>}
              <input className="adm-input" value={item.desc} onChange={e => update(i, 'desc', e.target.value)} placeholder="Breve texto..." />
            </div>
          </div>
          <button className="adm-btn adm-btn--xs adm-btn--danger" style={{ marginBottom: 1 }} onClick={() => remove(i)}>✕</button>
        </div>
      ))}
      <button className="adm-btn adm-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={add}>+ Adicionar</button>
    </div>
  )
}

function TestimonialsEditor({ value, onChange }: { value: TestimonialItem[]; onChange: (v: TestimonialItem[]) => void }) {
  const add = () => onChange([...value, { quote: '', name: '', role: '', company: '' }])
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const update = (i: number, key: keyof TestimonialItem, v: string) =>
    onChange(value.map((item, idx) => idx === i ? { ...item, [key]: v } : item))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {value.map((item, i) => (
        <div key={i} style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="adm-mono adm-muted">{String(i + 1).padStart(2, '0')}</span>
            <button className="adm-btn adm-btn--xs adm-btn--danger" onClick={() => remove(i)}>✕</button>
          </div>
          <div className="adm-field">
            <label className="adm-label">Depoimento</label>
            <textarea className="adm-input adm-textarea" rows={3} value={item.quote} onChange={e => update(i, 'quote', e.target.value)} placeholder="O que o cliente disse..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div className="adm-field"><label className="adm-label">Nome</label><input className="adm-input" value={item.name} onChange={e => update(i, 'name', e.target.value)} placeholder="Ana Silva" /></div>
            <div className="adm-field"><label className="adm-label">Cargo</label><input className="adm-input" value={item.role} onChange={e => update(i, 'role', e.target.value)} placeholder="Head de Marketing" /></div>
            <div className="adm-field"><label className="adm-label">Empresa</label><input className="adm-input" value={item.company} onChange={e => update(i, 'company', e.target.value)} placeholder="Empresa Ltda." /></div>
          </div>
        </div>
      ))}
      <button className="adm-btn adm-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={add}>+ Adicionar depoimento</button>
    </div>
  )
}

function FaqEditor({ value, onChange }: { value: FaqItem[]; onChange: (v: FaqItem[]) => void }) {
  const add = () => onChange([...value, { q: '', a: '' }])
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const update = (i: number, key: keyof FaqItem, v: string) =>
    onChange(value.map((item, idx) => idx === i ? { ...item, [key]: v } : item))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {value.map((item, i) => (
        <div key={i} style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="adm-mono adm-muted">{String(i + 1).padStart(2, '0')}</span>
            <button className="adm-btn adm-btn--xs adm-btn--danger" onClick={() => remove(i)}>✕</button>
          </div>
          <div className="adm-field"><label className="adm-label">Pergunta</label><input className="adm-input" value={item.q} onChange={e => update(i, 'q', e.target.value)} placeholder="Como funciona..." /></div>
          <div className="adm-field"><label className="adm-label">Resposta</label><textarea className="adm-input adm-textarea" rows={3} value={item.a} onChange={e => update(i, 'a', e.target.value)} placeholder="Resposta completa..." /></div>
        </div>
      ))}
      <button className="adm-btn adm-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={add}>+ Adicionar pergunta</button>
    </div>
  )
}

function ClientsEditor({ value, onChange }: { value: ClientItem[]; onChange: (v: ClientItem[]) => void }) {
  const add = () => onChange([...value, { name: '', category: '' }])
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const update = (i: number, key: keyof ClientItem, v: string) =>
    onChange(value.map((item, idx) => idx === i ? { ...item, [key]: v } : item))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {value.map((item, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 160px auto', gap: 8, alignItems: 'end' }}>
          <div className="adm-field">
            {i === 0 && <label className="adm-label">Cliente</label>}
            <input className="adm-input" value={item.name} onChange={e => update(i, 'name', e.target.value)} placeholder="Nome do cliente" />
          </div>
          <div className="adm-field">
            {i === 0 && <label className="adm-label">Ano</label>}
            <input className="adm-input" value={item.category} onChange={e => update(i, 'category', e.target.value)} placeholder="2025/" />
          </div>
          <button className="adm-btn adm-btn--xs adm-btn--danger" style={{ marginBottom: 1 }} onClick={() => remove(i)}>✕</button>
        </div>
      ))}
      <button className="adm-btn adm-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={add}>+ Adicionar cliente</button>
    </div>
  )
}

// ─── Section config ───────────────────────────────────────────
interface SectionConfig {
  id: SectionId
  icon: string
  name: string
  preview: (data: HomeData) => string
  badge: (data: HomeData) => string
}

const SECTIONS_TOP: SectionConfig[] = [
  {
    id: 'hero', icon: '✦', name: 'Hero',
    preview: d => `${d.heroRoles} — ${d.heroDescription}`,
    badge: () => 'Texto',
  },
  {
    id: 'about', icon: '◎', name: 'Sobre',
    preview: d => d.aboutStatement.slice(0, 90) + '...',
    badge: () => 'Texto + imagens',
  },
  {
    id: 'showcase', icon: '▶', name: 'Showcase',
    preview: d => d.showcaseImageUrl
      ? (/\.mp4$/i.test(d.showcaseImageUrl) ? 'Vídeo MP4 definido' : 'Imagem personalizada definida')
      : 'Nenhuma mídia definida',
    badge: d => d.showcaseImageUrl ? (/\.mp4$/i.test(d.showcaseImageUrl) ? 'Vídeo' : 'Imagem') : 'Mídia',
  },
  {
    id: 'cta', icon: '→', name: 'CTA Final',
    preview: d => `"${d.ctaHeadline}" — ${d.ctaSub}`,
    badge: () => 'Texto',
  },
]

const SECTIONS_LIST: SectionConfig[] = [
  {
    id: 'stats', icon: '▦', name: 'Estatísticas',
    preview: d => d.stats.length > 0 ? d.stats.map(s => `${s.val} ${s.label}`).join(' · ') : 'Usando padrão',
    badge: d => d.stats.length > 0 ? `${d.stats.length} itens` : 'Padrão',
  },
  {
    id: 'testimonials', icon: '❝', name: 'Depoimentos',
    preview: d => d.testimonials.length > 0 ? d.testimonials.map(t => t.name).join(', ') : 'Usando padrão',
    badge: d => d.testimonials.length > 0 ? `${d.testimonials.length} itens` : 'Padrão',
  },
  {
    id: 'faq', icon: '?', name: 'FAQ',
    preview: d => d.faqItems.length > 0 ? d.faqItems.slice(0, 2).map(f => f.q).join(' · ') : 'Usando padrão',
    badge: d => d.faqItems.length > 0 ? `${d.faqItems.length} itens` : 'Padrão',
  },
  {
    id: 'clients', icon: '◈', name: 'Clientes',
    preview: d => d.clients.length > 0 ? d.clients.map(c => c.name).join(', ') : 'Usando padrão',
    badge: d => d.clients.length > 0 ? `${d.clients.length} itens` : 'Padrão',
  },
]

// ─── Drawer content ───────────────────────────────────────────
function DrawerContent({
  section, data, onChange,
}: { section: SectionId | null; data: HomeData; onChange: (patch: Partial<HomeData>) => void }) {
  if (!section) return null

  switch (section) {
    case 'hero': return (
      <>
        <div className="adm-field">
          <label className="adm-label">Roles (linha acima do nome)</label>
          <input className="adm-input" value={data.heroRoles} onChange={e => onChange({ heroRoles: e.target.value })} placeholder="Filmmaker · Photographer · Social" />
        </div>
        <div className="adm-field">
          <label className="adm-label">Descrição (abaixo do nome)</label>
          <textarea className="adm-input adm-textarea" rows={3} value={data.heroDescription} onChange={e => onChange({ heroDescription: e.target.value })} />
        </div>
      </>
    )

    case 'about': return (
      <>
        <div className="adm-field">
          <label className="adm-label">Declaração principal</label>
          <p className="adm-muted" style={{ fontSize: 11, marginBottom: 6 }}>Texto com efeito de scroll reveal palavra a palavra.</p>
          <textarea className="adm-input adm-textarea" rows={5} value={data.aboutStatement} onChange={e => onChange({ aboutStatement: e.target.value })} />
        </div>
        <div className="adm-field">
          <label className="adm-label">Headline do rodapé</label>
          <textarea className="adm-input adm-textarea" rows={2} value={data.aboutFooterHeadline} onChange={e => onChange({ aboutFooterHeadline: e.target.value })} />
        </div>
        <ImageField
          label="Foto de perfil (portrait)"
          hint="Aparece ao lado do texto na seção Sobre."
          value={data.aboutPortraitUrl}
          onChange={url => onChange({ aboutPortraitUrl: url })}
        />
        <ImageField
          label="Imagem do rodapé da seção Sobre"
          hint="Aparece à esquerda da headline de rodapé."
          value={data.aboutFooterImageUrl}
          onChange={url => onChange({ aboutFooterImageUrl: url })}
        />
      </>
    )

    case 'stats': return (
      <>
        <p className="adm-muted" style={{ fontSize: 12 }}>
          Quando vazio, os valores padrão são exibidos na home. Adicione itens para personalizar.
        </p>
        <StatsEditor value={data.stats} onChange={v => onChange({ stats: v })} />
      </>
    )

    case 'showcase': return (
      <>
        <p className="adm-muted" style={{ fontSize: 12 }}>
          Mídia exibida no fundo da seção Showcase com efeito de scale ao scroll. Aceita imagem ou vídeo MP4.
        </p>
        <ImageField
          label="Mídia do Showcase"
          hint="Proporção 16:9 recomendada. Vídeos MP4 aceitam até 200MB."
          value={data.showcaseImageUrl}
          onChange={url => onChange({ showcaseImageUrl: url })}
          acceptVideo
        />
      </>
    )

    case 'testimonials': return (
      <>
        <p className="adm-muted" style={{ fontSize: 12 }}>Quando vazio, depoimentos padrão são exibidos.</p>
        <TestimonialsEditor value={data.testimonials} onChange={v => onChange({ testimonials: v })} />
      </>
    )

    case 'faq': return (
      <FaqEditor value={data.faqItems} onChange={v => onChange({ faqItems: v })} />
    )

    case 'clients': return (
      <>
        <p className="adm-muted" style={{ fontSize: 12 }}>Quando vazio, clientes padrão são exibidos.</p>
        <ClientsEditor value={data.clients} onChange={v => onChange({ clients: v })} />
      </>
    )

    case 'cta': return (
      <>
        <div className="adm-field">
          <label className="adm-label">Headline</label>
          <input className="adm-input" value={data.ctaHeadline} onChange={e => onChange({ ctaHeadline: e.target.value })} placeholder="Tem um projeto?" />
        </div>
        <div className="adm-field">
          <label className="adm-label">Subtítulo</label>
          <textarea className="adm-input adm-textarea" rows={2} value={data.ctaSub} onChange={e => onChange({ ctaSub: e.target.value })} />
        </div>
      </>
    )

    default: return null
  }
}

function getSectionPayload(section: SectionId, data: HomeData): Partial<HomeData> {
  switch (section) {
    case 'hero': return { heroRoles: data.heroRoles, heroDescription: data.heroDescription }
    case 'about': return { aboutStatement: data.aboutStatement, aboutFooterHeadline: data.aboutFooterHeadline, aboutPortraitUrl: data.aboutPortraitUrl, aboutFooterImageUrl: data.aboutFooterImageUrl }
    case 'stats': return { stats: data.stats }
    case 'showcase': return { showcaseImageUrl: data.showcaseImageUrl }
    case 'testimonials': return { testimonials: data.testimonials }
    case 'faq': return { faqItems: data.faqItems }
    case 'clients': return { clients: data.clients }
    case 'cta': return { ctaHeadline: data.ctaHeadline, ctaSub: data.ctaSub }
  }
}

// ─── Main page ────────────────────────────────────────────────
export default function AdminHomePage() {
  const [data, setData] = useState<HomeData>(DEFAULTS)
  const [projects, setProjects] = useState<ProjectPreview[]>([])
  const [activeSection, setActiveSection] = useState<SectionId | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/home-settings').then(r => r.ok ? r.json() : null),
      fetch('/api/projects').then(r => r.ok ? r.json() : []),
    ]).then(([d, ps]) => {
      if (d) {
        setData(prev => ({
          ...prev,
          ...d,
          stats: Array.isArray(d.stats) && d.stats.length > 0 ? d.stats : prev.stats,
          homeFeaturedCount: typeof d.homeFeaturedCount === 'number' ? d.homeFeaturedCount : prev.homeFeaturedCount,
        }))
      }
      setProjects(Array.isArray(ps) ? ps : [])
      setLoading(false)
    })
  }, [])

  const closeDrawer = useCallback(() => setActiveSection(null), [])
  const handleChange = useCallback((patch: Partial<HomeData>) => {
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
        const updated = await res.json()
        if (updated) {
          setData(prev => ({
            ...prev,
            ...updated,
            stats: Array.isArray(updated.stats) && updated.stats.length > 0 ? updated.stats : prev.stats,
            homeFeaturedCount: typeof updated.homeFeaturedCount === 'number' ? updated.homeFeaturedCount : prev.homeFeaturedCount,
          }))
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      setSaveError('Erro de rede. Verifique sua conexão.')
    }
    setSaving(false)
  }

  const saveCount = async (count: number) => {
    setData(prev => ({ ...prev, homeFeaturedCount: count }))
    await fetch('/api/home-settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ homeFeaturedCount: count }),
    })
  }

  const allSections = [...SECTIONS_TOP, ...SECTIONS_LIST]
  const activeSectionConfig = allSections.find(s => s.id === activeSection)
  const isDrawerOpen = activeSection !== null

  if (loading) {
    return (
      <AdminShell breadcrumbs={[{ label: 'Home' }]}>
        <div className="adm-page">
          <p className="adm-muted" style={{ padding: '60px 0', textAlign: 'center' }}>Carregando...</p>
        </div>
      </AdminShell>
    )
  }

  const featuredProjects = projects.filter(p => p.status === 'published')
  const draftProjects = projects.filter(p => p.status === 'draft')

  return (
    <AdminShell breadcrumbs={[{ label: 'Home' }]}>
      <div className="adm-page">

        {/* Header */}
        <div className="adm-page-head">
          <div>
            <p className="adm-mono adm-muted">CMS</p>
            <h1 className="adm-h1">Home</h1>
            <p className="adm-sub">Gerencie o conteúdo exibido na página inicial do site.</p>
          </div>
          <div className="adm-page-head-actions">
            <Link href="/" target="_blank" className="adm-btn">Ver site →</Link>
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

        {/* Two-panel body */}
        <div className="adm-home-body">

          {/* Left: Projects */}
          <div className="adm-home-panel">
            <div className="adm-home-panel-hd">
              <h3 className="adm-home-panel-title">Projetos em destaque</h3>
              <div className="adm-home-count-ctrl">
                <span>Exibindo</span>
                <select
                  value={data.homeFeaturedCount}
                  onChange={e => saveCount(Number(e.target.value))}
                  className="adm-home-count-select"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <span>na home</span>
              </div>
            </div>

            <div className="adm-home-proj-list">
              {featuredProjects.length === 0 && (
                <p className="adm-muted" style={{ fontSize: 12, padding: '12px 0' }}>
                  Nenhum projeto publicado ainda.
                </p>
              )}
              {featuredProjects.map((p, i) => (
                <div
                  key={p.id}
                  className={`adm-home-proj-item${i >= data.homeFeaturedCount ? ' is-inactive' : ''}`}
                >
                  <span className="adm-home-proj-num">{String(i + 1).padStart(2, '0')}</span>
                  <div className="adm-home-proj-info">
                    <span className="adm-home-proj-title">{p.title}</span>
                    <span className="adm-home-proj-meta">{p.client} · {p.year}</span>
                  </div>
                  <span className="adm-home-proj-cat">{p.category}</span>
                  {i >= data.homeFeaturedCount && (
                    <span className="adm-home-proj-hidden">oculto</span>
                  )}
                </div>
              ))}
              {draftProjects.length > 0 && featuredProjects.length > 0 && (
                <p className="adm-muted" style={{ fontSize: 11, marginTop: 8 }}>
                  {draftProjects.length} rascunho{draftProjects.length > 1 ? 's' : ''} não exibido{draftProjects.length > 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: 16 }}>
              <Link href="/admin/projects" className="adm-btn adm-btn--sm">
                Gerenciar projetos →
              </Link>
            </div>
          </div>

          <div className="adm-home-divider" />

          {/* Right: Sections */}
          <div className="adm-home-panel">
            <div className="adm-home-panel-hd">
              <h3 className="adm-home-panel-title">Conteúdo da home</h3>
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
                  <span className="adm-home-sect-arrow">→</span>
                </button>
              ))}
            </div>

            <div className="adm-home-sect-divider" />

            <div className="adm-home-sect-list">
              <Link href="/admin/projects" className="adm-home-sect-item" style={{ textDecoration: 'none' }}>
                <span className="adm-home-sect-icon">□</span>
                <span className="adm-home-sect-name">Projetos</span>
                <span className="adm-home-sect-badge">Auto</span>
                <span className="adm-home-sect-arrow">↗</span>
              </Link>
              <Link href="/admin/dashboard" className="adm-home-sect-item" style={{ textDecoration: 'none' }}>
                <span className="adm-home-sect-icon">✏</span>
                <span className="adm-home-sect-name">Journal</span>
                <span className="adm-home-sect-badge">Auto</span>
                <span className="adm-home-sect-arrow">↗</span>
              </Link>
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
