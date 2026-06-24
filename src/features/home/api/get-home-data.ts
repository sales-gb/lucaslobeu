import { getDb, schema } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import type { Project } from "@/lib/db/schema";
import type {
  StatItem,
  TestimonialItem,
  FaqItem,
  ClientItem,
} from "@/features/home/types";

function parseJson<T>(val: unknown, fallback: T): T {
  if (Array.isArray(val)) return val as T;
  if (typeof val === "string" && val.trim()) {
    try {
      return JSON.parse(val);
    } catch {
      /* fall through */
    }
  }
  return fallback;
}

export interface HomeData {
  projects: Project[];
  heroRoles: string | null;
  heroDescription: string | null;
  aboutStatement: string | null;
  aboutFooterHeadline: string | null;
  manifestoText: string | null;
  ctaHeadline: string | null;
  ctaSub: string | null;
  stats: StatItem[];
  testimonials: TestimonialItem[];
  faqItems: FaqItem[];
  clients: ClientItem[];
  showcaseImageUrl: string | null;
  aboutPortraitUrl: string | null;
  aboutFooterImageUrl: string | null;
}

/**
 * Server-side data layer da home. Lê home_settings + projetos em destaque e
 * devolve o objeto pronto para o <HomeView>.
 */
export async function getHomeData(): Promise<HomeData> {
  try {
    const db = getDb();
    const [settings] = await db
      .select()
      .from(schema.homeSettings)
      .where(eq(schema.homeSettings.id, 1))
      .limit(1);

    const featuredProjects = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.status, "published"))
      .orderBy(asc(schema.projects.sortOrder))
      .limit(settings?.homeFeaturedCount ?? 5);

    return {
      projects: featuredProjects,
      heroRoles: settings?.heroRoles ?? null,
      heroDescription: settings?.heroDescription ?? null,
      aboutStatement: settings?.aboutStatement ?? null,
      aboutFooterHeadline: settings?.aboutFooterHeadline ?? null,
      manifestoText: settings?.manifestoText ?? null,
      ctaHeadline: settings?.ctaHeadline ?? null,
      ctaSub: settings?.ctaSub ?? null,
      stats: parseJson(settings?.stats, [] as StatItem[]),
      testimonials: parseJson(settings?.testimonials, [] as TestimonialItem[]),
      faqItems: parseJson(settings?.faqItems, [] as FaqItem[]),
      clients: parseJson(settings?.clients, [] as ClientItem[]),
      showcaseImageUrl: settings?.showcaseImageUrl ?? null,
      aboutPortraitUrl: settings?.aboutPortraitUrl ?? null,
      aboutFooterImageUrl: settings?.aboutFooterImageUrl ?? null,
    };
  } catch {
    return {
      projects: [],
      heroRoles: null,
      heroDescription: null,
      aboutStatement: null,
      aboutFooterHeadline: null,
      manifestoText: null,
      ctaHeadline: null,
      ctaSub: null,
      stats: [],
      testimonials: [],
      faqItems: [],
      clients: [],
      showcaseImageUrl: null,
      aboutPortraitUrl: null,
      aboutFooterImageUrl: null,
    };
  }
}
