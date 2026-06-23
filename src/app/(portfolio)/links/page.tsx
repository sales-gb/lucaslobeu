import { getDb, schema } from '@/lib/db';
import { eq, asc } from 'drizzle-orm';
import type { Link as LinkRow } from '@/lib/db/schema';
import type { Metadata } from 'next';
import NextLink from 'next/link';

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
    <div className="ll-links-page">
      <div className="ll-links-card">
        <div className="ll-links-brand">
          <BrandMarkLarge />
        </div>

        <h1 className="ll-links-title">Lucas Lobeu</h1>
        <p className="ll-links-sub ll-mono small-cap muted">
          Diretor · Fotógrafo · SP
        </p>

        <div className="ll-links-list">
          {display.map((link, i) => (
            <a
              key={link.id}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className={`ll-links-link ll-links-link--${link.kind}`}
            >
              <span className="ll-links-num ll-mono" style={{ fontSize: 12 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="ll-links-label">{link.label}</span>
              <span className="ll-links-arrow ll-mono">↗</span>
            </a>
          ))}
        </div>

        <div className="ll-links-foot">
          <span className="ll-mono small-cap muted" style={{ fontSize: 10 }}>
            © 2026 Lucas Lobeu · São Paulo, BR
          </span>
        </div>
      </div>

      <div className="ll-links-watermark" aria-hidden="true">
        <span>LOBEU</span>
      </div>
    </div>
  );
}
