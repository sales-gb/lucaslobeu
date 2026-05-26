import { beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './lib/db/schema';
import bcrypt from 'bcryptjs';
import path from 'path';

const TEST_DB = path.join(process.cwd(), 'test.db');

// Override DB path for tests
process.env.DB_PATH = TEST_DB;
process.env.NEXTAUTH_SECRET = 'test-secret-lobeu';
process.env.UPLOADS_DIR = path.join(process.cwd(), 'test-uploads');

let db: ReturnType<typeof drizzle>;

beforeAll(async () => {
  const sqlite = new Database(TEST_DB);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: './lib/db/migrations' });

  // Seed test user
  const hash = await bcrypt.hash('test1234', 10);
  db.insert(schema.users).values({
    id: 'test-user',
    email: 'test@lobeu.com',
    passwordHash: hash,
    name: 'Test User',
    city: 'SP, BR',
    bio: 'Test bio',
  }).onConflictDoNothing().run();

  // Make db available globally for tests
  (globalThis as any).__testDb = db;
});

afterAll(() => {
  // Clean up test DB
  const fs = require('fs');
  try { fs.unlinkSync(TEST_DB); } catch {}
  try { fs.rmSync(path.join(process.cwd(), 'test-uploads'), { recursive: true, force: true }); } catch {}
});
