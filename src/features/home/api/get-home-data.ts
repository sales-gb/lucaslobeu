import { getDb, schema } from "@/lib/db";
import { eq, asc, inArray } from "drizzle-orm";
import { getStorage } from "@/lib/storage";
import type { Project } from "@/lib/db/schema";
import type { ProjectWithUrls } from "@/features/projects/types";
import type {
  StatItem,
  TestimonialItem,
  FaqItem,
} from "@/features/home/types";
import { getClients } from "@/features/clients/api/get-clients";
import type { Client } from "@/features/clients/types";

/** Resolve as URLs públicas das capas (capa + imagem de hover), igual à página de Projetos. */
async function resolveCoverUrls(projects: Project[]): Promise<ProjectWithUrls[]> {
  const ids = [
    ...new Set(
      [
        ...projects.map((p) => p.coverImageId),
        ...projects.map((p) => p.coverHoverImageId),
      ].filter((id): id is string => !!id),
    ),
  ];
  if (ids.length === 0) return projects;
  try {
    const db = await getDb();
    const storage = await getStorage();
    const records = await db
      .select()
      .from(schema.media)
      .where(inArray(schema.media.id, ids));
    const map = new Map<string, string>();
    for (const r of records) map.set(r.id, storage.getUrl(r.path));
    return projects.map((p) => ({
      ...p,
      coverImageUrl: p.coverImageId ? map.get(p.coverImageId) : undefined,
      coverHoverImageUrl: p.coverHoverImageId
        ? map.get(p.coverHoverImageId)
        : undefined,
    }));
  } catch {
    return projects;
  }
}

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
  projects: ProjectWithUrls[];
  heroImages: string[];
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
  clients: Client[];
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
    const db = await getDb();
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

    const projectsWithUrls = await resolveCoverUrls(featuredProjects);
    const clients = await getClients();

    // Imagens dos projetos para o rastro de cursor na hero (capa + hover).
    const heroImages = projectsWithUrls
      .flatMap((p) => [p.coverImageUrl, p.coverHoverImageUrl])
      .filter((u): u is string => !!u);

    return {
      projects: projectsWithUrls,
      heroImages,
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
      clients,
      showcaseImageUrl: settings?.showcaseImageUrl ?? null,
      aboutPortraitUrl: settings?.aboutPortraitUrl ?? null,
      aboutFooterImageUrl: settings?.aboutFooterImageUrl ?? null,
    };
  } catch {
    return {
      projects: [],
      heroImages: [],
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
