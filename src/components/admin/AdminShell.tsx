'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ReactNode, useState, useRef, useEffect } from 'react'

const Logo = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
    <path d="M 38 32 L 38 168 L 110 168" stroke="currentColor" strokeWidth="11" strokeLinecap="square"/>
    <path d="M 162 168 L 162 32 L 90 32" stroke="currentColor" strokeWidth="11" strokeLinecap="square"/>
    <circle cx="100" cy="100" r="6" fill="var(--accent)"/>
  </svg>
)

interface NavItem {
  href: string
  label: string
  icon: string
  badge?: string
  disabled?: boolean
  sub?: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '◐' },
  { href: '/admin/media', label: 'Mídia', icon: '▢' },
  { href: '/admin/home', label: 'Home', icon: '◯' },
  { href: '/admin/projects', label: 'Projetos', icon: '☰' },
  { href: '/admin/about', label: 'Sobre', icon: '¶' },
  { href: '/admin/settings', label: 'Configurações', icon: '⚙' },
]

const SECONDARY_ITEMS: NavItem[] = [
  { href: '/admin/links', label: 'Links', icon: '↗' },
]

interface AdminShellProps {
  children: ReactNode
  breadcrumbs?: { label: string; href?: string }[]
}

export default function AdminShell({ children, breadcrumbs }: AdminShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') return pathname === '/admin/dashboard'
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/admin/login')
  }

  // Close on outside click
  useEffect(() => {
    if (!userMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [userMenuOpen])

  return (
    <div className="ll-admin">
      <aside className="adm-sidebar">
        <div className="adm-sidebar-brand">
          <Logo />
          <div className="adm-sidebar-brand-text">
            <span>Lucas Lobeu</span>
            <span className="adm-mono adm-muted" style={{ fontSize: 10 }}>Estúdio</span>
          </div>
        </div>

        <nav className="adm-sidebar-nav">
          <div className="adm-sidebar-group">
            <span className="adm-mono adm-sidebar-group-label">Principal</span>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.disabled ? '#' : item.href}
                className={`adm-sidebar-item${isActive(item.href) ? ' is-active' : ''}${item.disabled ? ' is-disabled' : ''}`}
              >
                <span className="adm-sidebar-icon">{item.icon}</span>
                <span className="adm-sidebar-label">
                  <span>{item.label}</span>
                  {item.sub && <span className="adm-muted adm-sidebar-sub">{item.sub}</span>}
                </span>
                {item.badge && <span className="adm-sidebar-badge">{item.badge}</span>}
              </Link>
            ))}
          </div>

          <div className="adm-sidebar-group">
            <span className="adm-mono adm-sidebar-group-label">Extras</span>
            {SECONDARY_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`adm-sidebar-item${isActive(item.href) ? ' is-active' : ''}`}
              >
                <span className="adm-sidebar-icon">{item.icon}</span>
                <span className="adm-sidebar-label"><span>{item.label}</span></span>
              </Link>
            ))}
          </div>
        </nav>

        {/* ── User menu ── */}
        <div className="adm-sidebar-foot" ref={menuRef}>
          {userMenuOpen && (
            <div className="adm-user-menu">
              <Link
                href="/"
                target="_blank"
                className="adm-user-menu-item"
                onClick={() => setUserMenuOpen(false)}
              >
                <span>↗</span> Ver site
              </Link>
              <Link
                href="/admin/settings"
                className="adm-user-menu-item"
                onClick={() => setUserMenuOpen(false)}
              >
                <span>⚙</span> Configurações
              </Link>
              <div className="adm-user-menu-sep" />
              <button className="adm-user-menu-item adm-user-menu-item--danger" onClick={handleSignOut}>
                <span>→</span> Sair
              </button>
            </div>
          )}

          <button
            className={`adm-sidebar-user-btn${userMenuOpen ? ' is-open' : ''}`}
            onClick={() => setUserMenuOpen((v) => !v)}
          >
            <div className="adm-sidebar-avatar">
              <Logo size={14} />
            </div>
            <div className="adm-sidebar-label">
              <span style={{ fontWeight: 500, fontSize: 13 }}>Lucas Lobeu</span>
              <span className="adm-muted" style={{ fontSize: 10 }}>Admin</span>
            </div>
            <span className="adm-user-chevron">{userMenuOpen ? '▲' : '▼'}</span>
          </button>
        </div>
      </aside>

      <div className="adm-admin-main ll-admin-main">
        <header className="adm-topbar">
          <nav className="adm-breadcrumbs">
            <Link href="/admin/dashboard" className="adm-breadcrumb">Admin</Link>
            {breadcrumbs?.map((crumb, i) => (
              <span key={i} style={{ display: 'contents' }}>
                <span className="adm-breadcrumb-sep">/</span>
                {crumb.href ? (
                  <Link href={crumb.href} className={`adm-breadcrumb${i === (breadcrumbs.length - 1) ? ' is-current' : ''}`}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="adm-breadcrumb is-current">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
          <div className="adm-topbar-actions">
            <Link href="/" target="_blank" className="adm-btn adm-btn--ghost adm-btn--sm">
              Ver site ↗
            </Link>
          </div>
        </header>

        <main className="ll-admin-content">
          {children}
        </main>
      </div>
    </div>
  )
}
