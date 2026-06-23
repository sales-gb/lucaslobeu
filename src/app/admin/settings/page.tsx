'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'

// ─── Social platform catalogue ────────────────────────────────────

export type SocialPlatform =
  | 'instagram' | 'vimeo' | 'behance' | 'linkedin' | 'youtube'
  | 'tiktok' | 'twitter' | 'pinterest' | 'dribbble' | 'github'
  | 'soundcloud' | 'spotify' | 'medium' | 'substack' | 'twitch'

export interface SocialLink {
  platform: SocialPlatform
  url: string
  enabled: boolean
}

const PLATFORMS: { id: SocialPlatform; label: string; icon: string; placeholder: string }[] = [
  { id: 'instagram',  label: 'Instagram',   icon: '◉', placeholder: 'https://instagram.com/usuario' },
  { id: 'vimeo',      label: 'Vimeo',       icon: '▶', placeholder: 'https://vimeo.com/usuario' },
  { id: 'behance',    label: 'Behance',     icon: '⊞', placeholder: 'https://behance.net/usuario' },
  { id: 'linkedin',   label: 'LinkedIn',    icon: '▣', placeholder: 'https://linkedin.com/in/usuario' },
  { id: 'youtube',    label: 'YouTube',     icon: '▷', placeholder: 'https://youtube.com/@usuario' },
  { id: 'tiktok',     label: 'TikTok',      icon: '◈', placeholder: 'https://tiktok.com/@usuario' },
  { id: 'twitter',    label: 'X / Twitter', icon: '✕', placeholder: 'https://x.com/usuario' },
  { id: 'pinterest',  label: 'Pinterest',   icon: '⊕', placeholder: 'https://pinterest.com/usuario' },
  { id: 'dribbble',   label: 'Dribbble',    icon: '◎', placeholder: 'https://dribbble.com/usuario' },
  { id: 'github',     label: 'GitHub',      icon: '⊗', placeholder: 'https://github.com/usuario' },
  { id: 'soundcloud', label: 'SoundCloud',  icon: '♫', placeholder: 'https://soundcloud.com/usuario' },
  { id: 'spotify',    label: 'Spotify',     icon: '♪', placeholder: 'https://open.spotify.com/artist/...' },
  { id: 'medium',     label: 'Medium',      icon: 'M', placeholder: 'https://medium.com/@usuario' },
  { id: 'substack',   label: 'Substack',    icon: '✉', placeholder: 'https://usuario.substack.com' },
  { id: 'twitch',     label: 'Twitch',      icon: '◐', placeholder: 'https://twitch.tv/usuario' },
]

const PLATFORM_MAP = Object.fromEntries(PLATFORMS.map((p) => [p.id, p]))

// ─── Platform picker ──────────────────────────────────────────────

const PICKER_HEIGHT = 340
const PICKER_WIDTH  = 300
const PICKER_GAP    = 8

function PlatformPicker({
  anchorRef,
  available,
  onPick,
  onClose,
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>
  available: typeof PLATFORMS
  onPick: (id: SocialPlatform) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  // Calculate smart position: open upward if not enough space below
  const rect = anchorRef.current?.getBoundingClientRect()
  const spaceBelow = rect ? window.innerHeight - rect.bottom : 0
  const openUp     = spaceBelow < PICKER_HEIGHT + PICKER_GAP * 2

  const style: React.CSSProperties = {
    position: 'fixed',
    zIndex: 200,
    left: rect ? Math.min(rect.left, window.innerWidth - PICKER_WIDTH - 8) : 0,
    ...(openUp
      ? { bottom: rect ? window.innerHeight - rect.top + PICKER_GAP : 0 }
      : { top:    rect ? rect.bottom + PICKER_GAP : 0 }),
  }

  useEffect(() => {
    let handler: ((e: MouseEvent) => void) | null = null
    const timer = setTimeout(() => {
      handler = (e: MouseEvent) => {
        if (!ref.current?.contains(e.target as Node)) onClose()
      }
      document.addEventListener('click', handler)
    }, 0)
    return () => {
      clearTimeout(timer)
      if (handler) document.removeEventListener('click', handler)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      className="adm-social-picker"
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      <p className="adm-mono adm-muted" style={{ fontSize: 10, letterSpacing: '.1em', marginBottom: 10, textTransform: 'uppercase' }}>
        Escolher rede
      </p>
      <div className="adm-social-picker-grid">
        {available.map((p) => (
          <button
            key={p.id}
            type="button"
            className="adm-social-picker-item"
            onClick={() => { onPick(p.id); onClose() }}
          >
            <span className="adm-social-picker-icon">{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Toggle switch ────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="adm-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className="adm-toggle-track">
        <div className="adm-toggle-thumb" />
      </div>
    </label>
  )
}

// ─── Types ────────────────────────────────────────────────────────

interface UserData {
  name: string
  city: string
  bio: string
  email: string
  phone: string
}

// ─── Page ─────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData>({ name: '', city: '', bio: '', email: '', phone: '' })
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const addBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((d) => {
      if (d.user) {
        const { name, city, bio, email, phone } = d.user
        setUser({ name: name ?? '', city: city ?? '', bio: bio ?? '', email: email ?? '', phone: phone ?? '' })
        try {
          const parsed = JSON.parse(d.user.socialLinks ?? '[]') as SocialLink[]
          setSocialLinks(Array.isArray(parsed) ? parsed : [])
        } catch {
          setSocialLinks([])
        }
      }
    })
  }, [])

  const updateUser = (field: keyof UserData, value: string) => {
    setUser((u) => ({ ...u, [field]: value }))
    setSaved(false)
  }

  const updateLink = (platform: SocialPlatform, patch: Partial<SocialLink>) => {
    setSocialLinks((prev) => prev.map((l) => (l.platform === platform ? { ...l, ...patch } : l)))
    setSaved(false)
  }

  const addLink = (platform: SocialPlatform) => {
    if (!platform) return
    setSocialLinks((prev) => [...prev, { platform, url: '', enabled: true }])
    setSaved(false)
  }

  const removeLink = (platform: SocialPlatform) => {
    setSocialLinks((prev) => prev.filter((l) => l.platform !== platform))
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, socialLinks: JSON.stringify(socialLinks) }),
    })
    setSaving(false)
    setSaved(true)
    router.refresh()
  }

  const addedIds = new Set(socialLinks.map((l) => l.platform))
  const available = PLATFORMS.filter((p) => !addedIds.has(p.id))

  return (
    <AdminShell breadcrumbs={[{ label: 'Configurações' }]}>
      <div className="adm-page">
        <div className="adm-page-head">
          <div>
            <p className="adm-mono adm-muted">Sistema</p>
            <h1 className="adm-h1">Configurações</h1>
          </div>
          <div className="adm-page-head-actions">
            {saved && <span className="adm-status adm-status--saved"><span className="adm-status-dot" />Salvo</span>}
            <button className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        {/* Identidade */}
        <div className="adm-card">
          <div className="adm-card-head"><span className="adm-h6">Identidade</span></div>
          <div className="adm-card-body">
            <div className="adm-form-grid">
              <div className="adm-field adm-field--span2">
                <label className="adm-label">Nome</label>
                <input className="adm-input" value={user.name} onChange={(e) => updateUser('name', e.target.value)} />
              </div>
              <div className="adm-field">
                <label className="adm-label">Cidade</label>
                <input className="adm-input" value={user.city} onChange={(e) => updateUser('city', e.target.value)} />
              </div>
              <div className="adm-field adm-field--span3">
                <label className="adm-label">Bio</label>
                <textarea className="adm-input adm-textarea" rows={3} value={user.bio} onChange={(e) => updateUser('bio', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Contato */}
        <div className="adm-card">
          <div className="adm-card-head"><span className="adm-h6">Contato</span></div>
          <div className="adm-card-body">
            <div className="adm-form-grid">
              <div className="adm-field adm-field--span2">
                <label className="adm-label">Email de contato</label>
                <input className="adm-input" type="email" value={user.email} onChange={(e) => updateUser('email', e.target.value)} />
              </div>
              <div className="adm-field">
                <label className="adm-label">Telefone</label>
                <input className="adm-input" value={user.phone} onChange={(e) => updateUser('phone', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Redes sociais */}
        <div className="adm-card">
          <div className="adm-card-head">
            <span className="adm-h6">Redes sociais</span>
            <span className="adm-mono adm-muted" style={{ fontSize: 11 }}>
              {socialLinks.filter(l => l.enabled).length} de {socialLinks.length} ativa{socialLinks.filter(l => l.enabled).length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="adm-card-body" style={{ padding: 0 }}>

            {/* Added links */}
            {socialLinks.length === 0 ? (
              <div className="adm-social-empty">
                <p className="adm-muted" style={{ fontSize: 13 }}>Nenhuma rede adicionada ainda.</p>
              </div>
            ) : (
              <div className="adm-social-list">
                {socialLinks.map((link) => {
                  const meta = PLATFORM_MAP[link.platform]
                  if (!meta) return null
                  return (
                    <div key={link.platform} className={`adm-social-row${link.enabled ? ' is-enabled' : ''}`}>
                      <span className="adm-social-icon">{meta.icon}</span>
                      <span className="adm-social-label">{meta.label}</span>
                      <input
                        className="adm-input adm-social-input"
                        type="url"
                        placeholder={meta.placeholder}
                        value={link.url}
                        onChange={(e) => updateLink(link.platform, { url: e.target.value })}
                      />
                      <Toggle
                        checked={link.enabled}
                        onChange={(v) => updateLink(link.platform, { enabled: v })}
                      />
                      {link.url ? (
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="adm-social-preview" title="Abrir">
                          ↗
                        </a>
                      ) : (
                        <span />
                      )}
                      <button
                        type="button"
                        className="adm-social-remove"
                        onClick={() => removeLink(link.platform)}
                        title="Remover"
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Add button + picker */}
            <div className="adm-social-footer">
              <div style={{ position: 'relative' }}>
                <button
                  ref={addBtnRef}
                  type="button"
                  className="adm-btn adm-btn--sm"
                  disabled={available.length === 0}
                  onClick={() => setPickerOpen((v) => !v)}
                >
                  {available.length === 0 ? 'Todas adicionadas' : '+ Adicionar rede'}
                </button>
                {pickerOpen && available.length > 0 && (
                  <PlatformPicker
                    anchorRef={addBtnRef}
                    available={available}
                    onPick={addLink}
                    onClose={() => setPickerOpen(false)}
                  />
                )}
              </div>
              <span className="adm-muted" style={{ fontSize: 11 }}>
                Redes ativas aparecem no rodapé e em /links
              </span>
            </div>
          </div>
        </div>

        {/* Conta */}
        <div className="adm-card">
          <div className="adm-card-head"><span className="adm-h6">Conta</span></div>
          <div className="adm-card-body">
            <div className="adm-form-grid">
              <div className="adm-field adm-field--span2">
                <label className="adm-label">Email de login</label>
                <input className="adm-input" type="email" value={user.email} disabled style={{ opacity: 0.6 }} />
                <span className="adm-muted" style={{ fontSize: 11, marginTop: 2 }}>Alterar o email de login requer reautenticação</span>
              </div>
              <div className="adm-field">
                <label className="adm-label">Nova senha</label>
                <input
                  className="adm-input"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
