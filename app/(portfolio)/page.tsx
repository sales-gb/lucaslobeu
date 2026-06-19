import { getDb, schema } from '@/lib/db'
import { eq, asc, desc } from 'drizzle-orm'
import HomeClient from '@/components/portfolio/HomeClient'

function parseJson<T>(val: unknown, fallback: T): T {
  if (Array.isArray(val)) return val as T
  if (typeof val === 'string' && val.trim()) {
    try { return JSON.parse(val) } catch { /* fall through */ }
  }
  return fallback
}

async function getData() {
  try {
    const db = getDb()
    const [settings] = await db
      .select()
      .from(schema.homeSettings)
      .where(eq(schema.homeSettings.id, 1))
      .limit(1)

    const featuredProjects = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.status, 'published'))
      .orderBy(asc(schema.projects.sortOrder))
      .limit(settings?.homeFeaturedCount ?? 5)

    const journalEntries = await db
      .select()
      .from(schema.journal)
      .orderBy(desc(schema.journal.publishedAt))
      .limit(3)

    return { settings, featuredProjects, journalEntries }
  } catch {
    return { settings: null, featuredProjects: [], journalEntries: [] }
  }
}

export default async function HomePage() {
  const { settings, featuredProjects, journalEntries } = await getData()

  return (
    <HomeClient
      projects={featuredProjects}
      journalEntries={journalEntries}
      heroRoles={settings?.heroRoles}
      heroDescription={settings?.heroDescription}
      aboutStatement={settings?.aboutStatement}
      aboutFooterHeadline={settings?.aboutFooterHeadline}
      manifestoText={settings?.manifestoText}
      ctaHeadline={settings?.ctaHeadline}
      ctaSub={settings?.ctaSub}
      stats={parseJson(settings?.stats, [])}
      testimonials={parseJson(settings?.testimonials, [])}
      faqItems={parseJson(settings?.faqItems, [])}
      clients={parseJson(settings?.clients, [])}
      showcaseImageUrl={settings?.showcaseImageUrl}
      aboutPortraitUrl={settings?.aboutPortraitUrl}
      aboutFooterImageUrl={settings?.aboutFooterImageUrl}
    />
  )
}
