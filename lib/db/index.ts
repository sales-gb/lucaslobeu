import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

// For local dev: SQLite file. In production: Cloudflare D1 binding.
// The D1 adapter from @opennextjs/cloudflare injects a compatible
// driver at runtime; this module is only used in Next.js server context.

const dbPath = process.env.DB_PATH ?? path.join(process.cwd(), 'local.db');

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (_db) return _db;
  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  _db = drizzle(sqlite, { schema });
  return _db;
}

export { schema };
export type Db = ReturnType<typeof getDb>;
