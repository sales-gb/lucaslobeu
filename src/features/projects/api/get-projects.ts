import { getDb, schema } from "@/lib/db";
import { eq, asc, inArray } from "drizzle-orm";
import type { Project } from "@/lib/db/schema";
import { storage } from "@/lib/storage";
import type { ProjectWithUrls } from "@/features/projects/types";
import { FALLBACK_PROJECTS } from "@/features/projects/data/fallbacks";

async function getProjects(): Promise<Project[]> {
  try {
    const db = getDb();
    return await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.status, "published"))
      .orderBy(asc(schema.projects.sortOrder));
  } catch {
    return [];
  }
}

async function resolveCoverUrls(
  projects: Project[],
): Promise<Map<string, string>> {
  const ids = [
    ...new Set(
      [
        ...projects.map((p) => p.coverImageId),
        ...projects.map(
          (p) =>
            (p as ProjectWithUrls & { coverHoverImageId?: string | null })
              .coverHoverImageId,
        ),
      ].filter((id): id is string => !!id),
    ),
  ];
  if (ids.length === 0) return new Map();
  try {
    const db = getDb();
    const records = await db
      .select()
      .from(schema.media)
      .where(inArray(schema.media.id, ids));
    const map = new Map<string, string>();
    for (const r of records) map.set(r.id, storage.getUrl(r.path));
    return map;
  } catch {
    return new Map();
  }
}

async function getSettings() {
  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(schema.homeSettings)
      .where(eq(schema.homeSettings.id, 1));
    return row ?? null;
  } catch {
    return null;
  }
}

export interface ProjectsPageData {
  projects: ProjectWithUrls[];
  heroSub: string;
  manifestoText: string;
  manifestoImageUrl: string;
}

export async function getProjectsPageData(): Promise<ProjectsPageData> {
  const [projects, settings] = await Promise.all([getProjects(), getSettings()]);
  const base = projects.length > 0 ? projects : FALLBACK_PROJECTS;

  const urlMap = await resolveCoverUrls(base);

  const display: ProjectWithUrls[] = base.map((p) => ({
    ...p,
    coverImageUrl: p.coverImageId ? urlMap.get(p.coverImageId) : undefined,
    coverHoverImageUrl: (
      p as ProjectWithUrls & { coverHoverImageId?: string | null }
    ).coverHoverImageId
      ? urlMap.get(
          (p as ProjectWithUrls & { coverHoverImageId?: string | null })
            .coverHoverImageId!,
        )
      : undefined,
  }));

  return {
    projects: display,
    heroSub: settings?.projectsHeroSub ?? "",
    manifestoText: settings?.projectsManifestoText ?? "",
    manifestoImageUrl: settings?.projectsManifestoImageUrl ?? "",
  };
}
