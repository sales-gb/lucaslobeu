'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'

interface UserData {
  name: string
  city: string
  bio: string
  email: string
  phone: string
  instagram: string
  vimeo: string
  behance: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData>({
    name: '', city: '', bio: '', email: '',
    phone: '', instagram: '', vimeo: '', behance: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((d) => {
      if (d.user) setUser(d.user)
    })
  }, [])

  const update = (field: keyof UserData, value: string) => {
    setUser((u) => ({ ...u, [field]: value }))
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    })
    setSaving(false)
    setSaved(true)
    router.refresh()
  }

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

        <div className="adm-card">
          <div className="adm-card-head"><span className="adm-h6">Identidade</span></div>
          <div className="adm-card-body">
            <div className="adm-form-grid">
              <div className="adm-field adm-field--span2">
                <label className="adm-label">Nome</label>
                <input className="adm-input" value={user.name} onChange={(e) => update('name', e.target.value)} />
              </div>
              <div className="adm-field">
                <label className="adm-label">Cidade</label>
                <input className="adm-input" value={user.city} onChange={(e) => update('city', e.target.value)} />
              </div>
              <div className="adm-field adm-field--span3">
                <label className="adm-label">Bio</label>
                <textarea className="adm-input adm-textarea" rows={3} value={user.bio} onChange={(e) => update('bio', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-head"><span className="adm-h6">Contato</span></div>
          <div className="adm-card-body">
            <div className="adm-form-grid">
              <div className="adm-field adm-field--span2">
                <label className="adm-label">Email de contato</label>
                <input className="adm-input" type="email" value={user.email} onChange={(e) => update('email', e.target.value)} />
              </div>
              <div className="adm-field">
                <label className="adm-label">Telefone</label>
                <input className="adm-input" value={user.phone} onChange={(e) => update('phone', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-head"><span className="adm-h6">Redes sociais</span></div>
          <div className="adm-card-body">
            <div className="adm-form-grid">
              <div className="adm-field">
                <label className="adm-label">Instagram</label>
                <input className="adm-input" value={user.instagram} onChange={(e) => update('instagram', e.target.value)} />
              </div>
              <div className="adm-field">
                <label className="adm-label">Vimeo</label>
                <input className="adm-input" value={user.vimeo} onChange={(e) => update('vimeo', e.target.value)} />
              </div>
              <div className="adm-field">
                <label className="adm-label">Behance</label>
                <input className="adm-input" value={user.behance} onChange={(e) => update('behance', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

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
