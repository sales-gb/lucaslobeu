import { getDb, schema } from '@/lib/db';
import { eq, asc } from 'drizzle-orm';
import type { Link as LinkRow } from '@/lib/db/schema';
import type { Metadata } from 'next';
import { cn } from '@/lib/utils/cn';

export const metadata: Metadata = {
  title: 'Links — Lucas Lobeu',
  description: 'Links rápidos para os trabalhos e redes de Lucas Lobeu.',
};

async function getLinks(): Promise<LinkRow[]> {
  try {
    const db = getDb();
    return await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.enabled, true))
      .orderBy(asc(schema.links.sortOrder));
  } catch {
    return [];
  }
}

const FALLBACK_LINKS: LinkRow[] = [
  { id: '1', label: 'Portfólio', href: '/projects', kind: 'primary', enabled: true, sortOrder: 0, createdAt: '' },
  { id: '2', label: 'Instagram', href: 'https://instagram.com/lucaslobeu', kind: 'social', enabled: true, sortOrder: 1, createdAt: '' },
  { id: '3', label: 'Vimeo', href: 'https://vimeo.com/lucaslobeu', kind: 'social', enabled: true, sortOrder: 2, createdAt: '' },
  { id: '4', label: 'Behance', href: 'https://behance.net/lucaslobeu', kind: 'social', enabled: true, sortOrder: 3, createdAt: '' },
  { id: '5', label: 'Email', href: 'mailto:lucas@lobeu.studio', kind: 'contact', enabled: true, sortOrder: 4, createdAt: '' },
];

const BrandMarkLarge = () => (
  <svg width="56" height="56" viewBox="0 0 200 200" fill="none">
    <path d="M 38 32 L 38 168 L 110 168" stroke="currentColor" strokeWidth="11" strokeLinecap="square" />
    <path d="M 162 168 L 162 32 L 90 32" stroke="currentColor" strokeWidth="11" strokeLinecap="square" />
    <circle cx="100" cy="100" r="6" fill="var(--accent)" />
  </svg>
);

export default async function LinksPage() {
  const links = await getLinks();
  const display = links.length > 0 ? links : FALLBACK_LINKS;

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-ink px-6 pt-20 pb-10">
      <div className="z-[2] flex w-full max-w-[460px] flex-col items-center">
        <div className="mb-7 text-paper">
          <BrandMarkLarge />
        </div>

        <h1 className="text-center font-serif text-[56px] font-light leading-none tracking-[-0.015em]">
          Lucas Lobeu
        </h1>
        <p className="ll-mono small-cap muted mt-3 text-center">
          Diretor · Fotógrafo · SP
        </p>

        <div className="mt-12 flex w-full flex-col gap-3">
          {display.map((link, i) => (
            <a
              key={link.id}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group grid grid-cols-[32px_1fr_24px] items-center gap-[14px] rounded-[2px] border-[0.5px] border-paper bg-transparent px-6 py-[18px] transition-[background-color,color,padding] duration-[250ms] hover:bg-paper hover:pl-[30px] hover:pr-[18px] hover:text-ink"
            >
              <span className="ll-mono text-muted group-hover:text-ink/55" style={{ fontSize: 12 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className={cn('font-sans font-normal', link.kind === 'primary' ? 'text-[22px]' : 'text-[20px]')}>
                {link.label}
              </span>
              <span className="ll-mono text-right">↗</span>
            </a>
          ))}
        </div>

        <div className="mt-10 w-full border-t-[0.5px] border-rule pt-6 text-center">
          <span className="ll-mono small-cap muted" style={{ fontSize: 10 }}>
            © 2026 Lucas Lobeu · São Paulo, BR
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[-40px] z-0 text-center text-paper opacity-[0.05]" aria-hidden="true">
        <span className="font-sans text-[32vw] font-light leading-none tracking-[-0.04em]">LOBEU</span>
      </div>
    </div>
  );
}
