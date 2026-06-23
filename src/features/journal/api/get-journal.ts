import { getDb, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import type { JournalEntry } from "@/lib/db/schema";
import { FALLBACK_ENTRIES } from "@/features/journal/data/fallbacks";

/** Lê todas as entradas do diário (mais recentes primeiro), com fallback. */
export async function getJournalEntries(): Promise<JournalEntry[]> {
  try {
    const db = getDb();
    const entries = await db
      .select()
      .from(schema.journal)
      .orderBy(desc(schema.journal.publishedAt));
    return entries.length > 0 ? entries : FALLBACK_ENTRIES;
  } catch {
    return FALLBACK_ENTRIES;
  }
}
