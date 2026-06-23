import { getDb, schema } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import type { Project } from "@/lib/db/schema";
import { storage } from "@/lib/storage";

export async function getProject(slug: string): Promise<Project | null> {
  try {
    const db = getDb();
    const [project] = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.slug, slug))
      .limit(1);
    return project ?? null;
  } catch {
    return null;
  }
}

async function getCoverImageUrl(
  coverImageId: string | null,
): Promise<string | undefined> {
  if (!coverImageId) return undefined;
  try {
    const db = getDb();
    const [record] = await db
      .select()
      .from(schema.media)
      .where(eq(schema.media.id, coverImageId))
      .limit(1);
    return record ? storage.getUrl(record.path) : undefined;
  } catch {
    return undefined;
  }
}

async function getSiblings(
  slug: string,
): Promise<{ prev: Project | null; next: Project | null }> {
  try {
    const db = getDb();
    const all = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.status, "published"))
      .orderBy(asc(schema.projects.sortOrder));
    const idx = all.findIndex((p) => p.slug === slug);
    return {
      prev: idx > 0 ? all[idx - 1] : null,
      next: idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null,
    };
  } catch {
    return { prev: null, next: null };
  }
}

/** Slugs publicados — para generateStaticParams. */
export async function getPublishedProjectSlugs(): Promise<{ slug: string }[]> {
  try {
    const db = getDb();
    const projects = await db
      .select({ slug: schema.projects.slug })
      .from(schema.projects)
      .where(eq(schema.projects.status, "published"));
    return projects.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export interface ProjectDetailData {
  project: Project;
  prev: Project | null;
  next: Project | null;
  coverImageUrl?: string;
  nextCoverImageUrl?: string;
}

/** Bundle completo para a página de detalhe; null se o projeto não existe. */
export async function getProjectDetail(
  slug: string,
): Promise<ProjectDetailData | null> {
  const project = await getProject(slug);
  if (!project) return null;

  const [{ prev, next }, coverImageUrl] = await Promise.all([
    getSiblings(slug),
    getCoverImageUrl(project.coverImageId),
  ]);

  const nextCoverImageUrl = next
    ? await getCoverImageUrl(next.coverImageId)
    : undefined;

  return { project, prev, next, coverImageUrl, nextCoverImageUrl };
}
