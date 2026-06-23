'use client'

import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const Logo = () => (
  <svg width="24" height="24" viewBox="0 0 200 200" fill="none">
    <path d="M 38 32 L 38 168 L 110 168" stroke="currentColor" strokeWidth="11" strokeLinecap="square"/>
    <path d="M 162 168 L 162 32 L 90 32" stroke="currentColor" strokeWidth="11" strokeLinecap="square"/>
    <circle cx="100" cy="100" r="6" fill="var(--accent)"/>
  </svg>
)

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(searchParams.get('error') === 'AccessDenied' ? 'Acesso negado. Email não autorizado.' : '')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Email ou senha incorretos.')
    } else {
      router.push('/admin/dashboard')
      router.refresh()
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl: '/admin/dashboard' })
  }

  return (
    <div className="adm-login">
      <div className="adm-login-card">
        <div className="adm-login-brand">
          <Logo />
          <div className="adm-login-brand-text">
            <span className="adm-h6">Lucas Lobeu</span>
            <span className="adm-mono adm-muted" style={{ fontSize: 10 }}>Estúdio CMS</span>
          </div>
        </div>

        <div>
          <h1 className="adm-h3">Entrar no painel</h1>
          <p className="adm-sub" style={{ marginTop: 6 }}>Acesso restrito ao administrador.</p>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          className="adm-btn adm-btn--block adm-btn--google"
          onClick={handleGoogle}
          disabled={googleLoading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: 'var(--surface-1)', border: '1px solid var(--border)',
            color: 'var(--fg)', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 500,
            padding: '11px 20px', borderRadius: 6, cursor: 'pointer', width: '100%',
            transition: 'background .2s ease',
          }}
        >
          <GoogleIcon />
          {googleLoading ? 'Redirecionando...' : 'Entrar com Google'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: '.5px', background: 'var(--border)' }} />
          <span className="adm-mono adm-muted" style={{ fontSize: 11 }}>ou</span>
          <div style={{ flex: 1, height: '.5px', background: 'var(--border)' }} />
        </div>

        <form className="adm-login-form" onSubmit={handleSubmit}>
          <div className="adm-field">
            <label className="adm-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="adm-input"
              placeholder="lucas@lucaslobeu.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              className="adm-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="adm-err">{error}</p>}

          <button
            type="submit"
            className="adm-btn adm-btn--primary adm-btn--block"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar com senha'}
          </button>
        </form>

        <div className="adm-login-foot">
          <span className="adm-muted">Acesso protegido por JWT</span>
          <span className="adm-mono adm-muted" style={{ fontSize: 10 }}>v0.2</span>
        </div>
      </div>

      <div className="adm-login-side">
        <div style={{ marginBottom: 'auto' }}>
          <span className="adm-mono adm-muted">Painel do estúdio</span>
        </div>
        <div className="adm-login-side-title">
          Painel<br />do<br />estúdio.
        </div>
        <div className="adm-login-side-meta">
          <div>
            <span className="adm-mono adm-muted">Versão</span>
            <div>0.2.0</div>
          </div>
          <div>
            <span className="adm-mono adm-muted">Status</span>
            <div>Ativo</div>
          </div>
          <div>
            <span className="adm-mono adm-muted">Ambiente</span>
            <div>Local</div>
          </div>
          <div>
            <span className="adm-mono adm-muted">Auth</span>
            <div>Google + JWT</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg)' }} />}>
      <LoginForm />
    </Suspense>
  )
}
