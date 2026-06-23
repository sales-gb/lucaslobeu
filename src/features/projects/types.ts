import type { Project } from "@/lib/db/schema";

export type ProjectWithUrls = Project & {
  coverImageUrl?: string;
  coverHoverImageUrl?: string;
};
