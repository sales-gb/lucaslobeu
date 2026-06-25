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
    const db = await getDb()
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
    const db = await getDb()
    const [user] = await db.select({ email: schema.users.email, city: schema.users.city, phone: schema.users.phone, bio: schema.users.bio }).from(schema.users)
    return user ?? null
  } catch {
    return null
  }
}

// Coluna de links em serif, hover accent-soft.
const FOOTER_BODY =
  'flex flex-col gap-2 font-serif text-[20px] font-normal [&_a:hover]:text-accent-soft'

export default async function Footer() {
  const year = new Date().getFullYear()
  const [socials, user] = await Promise.all([getSocialLinks(), getUserInfo()])

  return (
    <footer className="relative overflow-hidden bg-ink px-[var(--page-x)] pt-20 text-paper">
      <div className="relative z-[2] grid grid-cols-4 gap-12 border-b-[0.5px] border-paper/[0.12] pb-[60px] max-lg:grid-cols-2 max-lg:gap-8 max-sm:grid-cols-1">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <BrandMark />
            <span className="font-serif text-[18px] font-light uppercase tracking-[0.2em]">
              Lobeu
            </span>
          </div>
          {user?.bio && (
            <p className="max-w-[220px] font-sans text-[14px] leading-[1.55] text-paper/45">
              {user.bio}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <span className="small-cap text-paper/45">Contato</span>
          <div className={FOOTER_BODY}>
            {user?.email && <a href={`mailto:${user.email}`}>{user.email}</a>}
            {user?.phone && <a href={`tel:${user.phone.replace(/\D/g, '')}`}>{user.phone}</a>}
            {user?.city && <span className="text-[14px] text-paper/45">{user.city}</span>}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <span className="small-cap text-paper/45">Redes</span>
          <div className={FOOTER_BODY}>
            {socials.length > 0 ? (
              socials.map((s) => (
                <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer">
                  {PLATFORM_LABELS[s.platform] ?? s.platform}
                </a>
              ))
            ) : (
              <span className="text-[13px] text-paper/45">—</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <span className="small-cap text-paper/45">Navegar</span>
          <div className={FOOTER_BODY}>
            <Link href="/">Index</Link>
            <Link href="/projects">Projetos</Link>
            <Link href="/about">Sobre</Link>
            <Link href="/contact">Contato</Link>
            <Link href="/links">Links</Link>
          </div>
        </div>
      </div>

      <div className="pointer-events-none relative z-[1] flex items-center justify-center pt-10" aria-hidden="true">
        <span className="font-sans font-light text-[clamp(180px,28vw,460px)] leading-[0.82] tracking-[-0.04em] text-paper opacity-[0.92]">
          LOBEU
        </span>
      </div>

      <div className="relative z-[3] flex items-center justify-between border-t-[0.5px] border-paper/[0.12] py-8 text-paper/55">
        <span className="ll-mono small-cap" style={{ fontSize: 10 }}>
          © {year} Lucas Lobeu. Todos os direitos reservados.
        </span>
      </div>
    </footer>
  )
}
