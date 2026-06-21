import Link from 'next/link'
import { getDb, schema } from '@/lib/db'
import type { SocialLink } from '@/app/admin/settings/page'

const BrandMark = () => (
  <svg width="22" height="22" viewBox="0 0 200 200" fill="none">
    <path d="M 38 32 L 38 168 L 110 168" stroke="currentColor" strokeWidth="11" strokeLinecap="square" />
    <path d="M 162 168 L 162 32 L 90 32" stroke="currentColor" strokeWidth="11" strokeLinecap="square" />
    <circle cx="100" cy="100" r="6" fill="var(--accent)" />
  </svg>
)

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  vimeo: 'Vimeo',
  behance: 'Behance',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  twitter: 'X / Twitter',
  pinterest: 'Pinterest',
  dribbble: 'Dribbble',
  github: 'GitHub',
}

async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const db = getDb()
    const [user] = await db.select().from(schema.users)
    if (!user?.socialLinks) return []
    const parsed = JSON.parse(user.socialLinks) as SocialLink[]
    return Array.isArray(parsed) ? parsed.filter((l) => l.enabled && l.url) : []
  } catch {
    return []
  }
}

async function getUserInfo() {
  try {
    const db = getDb()
    const [user] = await db.select({ email: schema.users.email, city: schema.users.city, phone: schema.users.phone, bio: schema.users.bio }).from(schema.users)
    return user ?? null
  } catch {
    return null
  }
}

export default async function Footer() {
  const year = new Date().getFullYear()
  const [socials, user] = await Promise.all([getSocialLinks(), getUserInfo()])

  return (
    <footer className="ll-footer">
      <div className="ll-footer-grid">
        <div className="ll-footer-col">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BrandMark />
            <span style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 18, letterSpacing: '.2em', textTransform: 'uppercase' }}>
              Lobeu
            </span>
          </div>
          {user?.bio && (
            <p className="muted" style={{ fontFamily: 'var(--sans)', fontSize: 14, lineHeight: 1.55, maxWidth: 220 }}>
              {user.bio}
            </p>
          )}
        </div>

        <div className="ll-footer-col">
          <span className="small-cap muted">Contato</span>
          <div className="ll-footer-body">
            {user?.email && <a href={`mailto:${user.email}`}>{user.email}</a>}
            {user?.phone && <a href={`tel:${user.phone.replace(/\D/g, '')}`}>{user.phone}</a>}
            {user?.city && <span className="muted" style={{ fontSize: 14 }}>{user.city}</span>}
          </div>
        </div>

        <div className="ll-footer-col">
          <span className="small-cap muted">Redes</span>
          <div className="ll-footer-body">
            {socials.length > 0 ? (
              socials.map((s) => (
                <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer">
                  {PLATFORM_LABELS[s.platform] ?? s.platform}
                </a>
              ))
            ) : (
              <span className="muted" style={{ fontSize: 13 }}>—</span>
            )}
          </div>
        </div>

        <div className="ll-footer-col">
          <span className="small-cap muted">Navegar</span>
          <div className="ll-footer-body">
            <Link href="/">Index</Link>
            <Link href="/projects">Projetos</Link>
            <Link href="/about">Sobre</Link>
            <Link href="/contact">Contato</Link>
            <Link href="/links">Links</Link>
          </div>
        </div>
      </div>

      <div className="ll-footer-watermark" aria-hidden="true">
        <span>LOBEU</span>
      </div>

      <div className="ll-footer-base">
        <span className="ll-mono small-cap" style={{ fontSize: 10 }}>
          © {year} Lucas Lobeu. Todos os direitos reservados.
        </span>
        <Link href="/admin/login" className="ll-mono small-cap" style={{ fontSize: 10, opacity: 0.55 }}>
          Acesso reservado
        </Link>
      </div>
    </footer>
  )
}
