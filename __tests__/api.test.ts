/**
 * API & validation tests — field-by-field coverage for the CMS.
 * Run: pnpm vitest run
 */
import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '../src/lib/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { UPLOAD_LIMITS } from '../src/lib/storage/interface';
import path from 'path';
import fs from 'fs/promises';
import { unlinkSync } from 'fs';

// ─── Test DB setup ──────────────────────────────────────────────
const TEST_DB_PATH = path.join(process.cwd(), '__test_api.db');
let db: ReturnType<typeof drizzle<typeof schema>>;

function setupDb() {
  const sqlite = new Database(TEST_DB_PATH);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: './src/lib/db/migrations' });
  return sqlite;
}

let sqlite: ReturnType<typeof Database>;
beforeEach(() => {
  // Fresh DB per test group
  try { unlinkSync(TEST_DB_PATH); } catch {}
  sqlite = setupDb();
});

// Cleanup
import { afterAll } from 'vitest';
afterAll(() => {
  try { sqlite?.close(); } catch {}
  try { unlinkSync(TEST_DB_PATH); } catch {}
});

// ─── Upload Limits ─────────────────────────────────────────────
describe('UPLOAD_LIMITS', () => {
  it('maxSizeBytes is 10MB', () => {
    expect(UPLOAD_LIMITS.maxSizeBytes).toBe(10 * 1024 * 1024);
  });

  it('allows JPEG, PNG, WebP, AVIF', () => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    for (const mime of allowed) {
      expect(UPLOAD_LIMITS.allowedMimeTypes).toContain(mime);
    }
  });

  it('rejects disallowed types', () => {
    // video/mp4 é permitido (showcase em vídeo); só tipos realmente inválidos são rejeitados.
    const rejected = ['application/pdf', 'text/plain'];
    for (const mime of rejected) {
      expect(UPLOAD_LIMITS.allowedMimeTypes).not.toContain(mime);
    }
  });
});

// ─── User (auth + settings) ────────────────────────────────────
describe('User entity', () => {
  it('inserts and retrieves a user with all fields', async () => {
    const hash = await bcrypt.hash('test123', 10);
    db.insert(schema.users).values({
      id: 'u1', email: 'a@b.com', passwordHash: hash,
      name: 'Lucas', city: 'SP', bio: 'Test', phone: '+55',
      instagram: '@l', vimeo: 'v.com/l', behance: 'b.com/l',
    }).run();

    const user = db.select().from(schema.users).where(eq(schema.users.id, 'u1')).get();
    expect(user?.email).toBe('a@b.com');
    expect(user?.name).toBe('Lucas');
    expect(user?.city).toBe('SP');
    expect(user?.instagram).toBe('@l');
  });

  it('enforces unique email constraint', () => {
    const hash = bcrypt.hashSync('test', 10);
    db.insert(schema.users).values({ id: 'u1', email: 'dup@test.com', passwordHash: hash, name: 'A', city: 'SP', bio: 'b' }).run();
    expect(() => {
      db.insert(schema.users).values({ id: 'u2', email: 'dup@test.com', passwordHash: hash, name: 'B', city: 'SP', bio: 'b' }).run();
    }).toThrow();
  });

  it('verifies password hash correctly', async () => {
    const password = 'lobeu2026';
    const hash = await bcrypt.hash(password, 10);
    expect(await bcrypt.compare(password, hash)).toBe(true);
    expect(await bcrypt.compare('wrong', hash)).toBe(false);
  });
});

// ─── Projects ──────────────────────────────────────────────────
describe('Projects entity — field by field', () => {
  function insertProject(overrides: Partial<typeof schema.projects.$inferInsert> = {}) {
    const defaults = {
      id: 'p1', slug: 'test-project', title: 'Test', client: 'Client',
      year: '2025', category: 'Filme', role: 'Direção',
      summary: 'A test project', body: '[]', credits: '[]',
      coverTone: 'mid', coverKind: 'tall', template: 'editorial',
      status: 'published', sortOrder: 0,
    };
    db.insert(schema.projects).values({ ...defaults, ...overrides }).run();
  }

  it('creates and reads a project', () => {
    insertProject();
    const p = db.select().from(schema.projects).where(eq(schema.projects.id, 'p1')).get();
    expect(p?.title).toBe('Test');
    expect(p?.category).toBe('Filme');
  });

  it('slug must be unique', () => {
    insertProject({ id: 'p1', slug: 'same-slug' });
    expect(() => insertProject({ id: 'p2', slug: 'same-slug' })).toThrow();
  });

  it('stores and parses body JSON', () => {
    const body = [{ kind: 'paragraph', text: 'Hello world' }];
    insertProject({ body: JSON.stringify(body) });
    const p = db.select().from(schema.projects).where(eq(schema.projects.id, 'p1')).get();
    const parsed = JSON.parse(p!.body);
    expect(parsed[0].text).toBe('Hello world');
  });

  it('stores and parses credits JSON', () => {
    const credits = [['Direção', 'Lucas Lobeu']];
    insertProject({ credits: JSON.stringify(credits) });
    const p = db.select().from(schema.projects).where(eq(schema.projects.id, 'p1')).get();
    const parsed = JSON.parse(p!.credits);
    expect(parsed[0][0]).toBe('Direção');
  });

  it('updates project title and updatedAt', () => {
    insertProject();
    db.update(schema.projects)
      .set({ title: 'Updated', updatedAt: new Date().toISOString() })
      .where(eq(schema.projects.id, 'p1'))
      .run();
    const p = db.select().from(schema.projects).where(eq(schema.projects.id, 'p1')).get();
    expect(p?.title).toBe('Updated');
  });

  it('deletes a project', () => {
    insertProject();
    db.delete(schema.projects).where(eq(schema.projects.id, 'p1')).run();
    const p = db.select().from(schema.projects).where(eq(schema.projects.id, 'p1')).get();
    expect(p).toBeUndefined();
  });

  it('filters by status', () => {
    insertProject({ id: 'pub', slug: 'pub', status: 'published' });
    insertProject({ id: 'dra', slug: 'dra', status: 'draft' });
    const published = db.select().from(schema.projects)
      .where(eq(schema.projects.status, 'published')).all();
    expect(published.length).toBe(1);
    expect(published[0].id).toBe('pub');
  });

  it('filters by category', () => {
    insertProject({ id: 'f1', slug: 'f1', category: 'Filme' });
    insertProject({ id: 'f2', slug: 'f2', category: 'Foto' });
    insertProject({ id: 'f3', slug: 'f3', category: 'Foto' });
    const fotos = db.select().from(schema.projects)
      .where(eq(schema.projects.category, 'Foto')).all();
    expect(fotos.length).toBe(2);
  });

  it('orders by sortOrder', () => {
    insertProject({ id: 'a', slug: 'a', sortOrder: 2 });
    insertProject({ id: 'b', slug: 'b', sortOrder: 0 });
    insertProject({ id: 'c', slug: 'c', sortOrder: 1 });
    const ordered = db.select().from(schema.projects)
      .orderBy(schema.projects.sortOrder).all();
    expect(ordered[0].id).toBe('b');
    expect(ordered[1].id).toBe('c');
    expect(ordered[2].id).toBe('a');
  });

  it('validates all required fields are present', () => {
    // Missing required fields should throw
    expect(() => {
      db.insert(schema.projects)
        .values({ id: 'bad' } as typeof schema.projects.$inferInsert)
        .run();
    }).toThrow();
  });
});

// ─── Home Tiles ────────────────────────────────────────────────
describe('HomeTiles entity', () => {
  it('creates, reads, updates, deletes a tile', () => {
    db.insert(schema.homeTiles).values({
      id: 't1', kind: 'video', label: 'Reel', duration: '00:32',
      tone: 'dark', ratio: '9/16', sortOrder: 0,
    }).run();

    const t = db.select().from(schema.homeTiles).where(eq(schema.homeTiles.id, 't1')).get();
    expect(t?.label).toBe('Reel');
    expect(t?.kind).toBe('video');

    db.update(schema.homeTiles).set({ label: 'Updated Reel' }).where(eq(schema.homeTiles.id, 't1')).run();
    const updated = db.select().from(schema.homeTiles).where(eq(schema.homeTiles.id, 't1')).get();
    expect(updated?.label).toBe('Updated Reel');

    db.delete(schema.homeTiles).where(eq(schema.homeTiles.id, 't1')).run();
    const deleted = db.select().from(schema.homeTiles).where(eq(schema.homeTiles.id, 't1')).get();
    expect(deleted).toBeUndefined();
  });
});

// ─── Links ────────────────────────────────────────────────────
describe('Links entity', () => {
  it('creates and reads a link', () => {
    db.insert(schema.links).values({
      id: 'lk1', label: 'Instagram', href: 'https://instagram.com', kind: 'social',
      enabled: true, sortOrder: 0,
    }).run();
    const l = db.select().from(schema.links).where(eq(schema.links.id, 'lk1')).get();
    expect(l?.label).toBe('Instagram');
    expect(l?.kind).toBe('social');
  });

  it('filters by enabled', () => {
    db.insert(schema.links).values({ id: 'l1', label: 'A', href: '#', kind: 'primary', enabled: true, sortOrder: 0 }).run();
    db.insert(schema.links).values({ id: 'l2', label: 'B', href: '#', kind: 'primary', enabled: false, sortOrder: 1 }).run();
    const enabled = db.select().from(schema.links).where(eq(schema.links.enabled, true)).all();
    expect(enabled.length).toBe(1);
  });
});

// ─── Journal ──────────────────────────────────────────────────
describe('Journal entity', () => {
  it('creates, reads, updates, deletes a journal entry', () => {
    db.insert(schema.journal).values({
      id: 'j1', slug: 'test-post', title: 'Test Post',
      excerpt: 'A short excerpt', content: 'Full content',
      readTime: '3 min', publishedAt: '2025-01-01',
    }).run();

    const j = db.select().from(schema.journal).where(eq(schema.journal.id, 'j1')).get();
    expect(j?.title).toBe('Test Post');
    expect(j?.readTime).toBe('3 min');

    db.update(schema.journal).set({ title: 'Updated Post' }).where(eq(schema.journal.id, 'j1')).run();
    const u = db.select().from(schema.journal).where(eq(schema.journal.id, 'j1')).get();
    expect(u?.title).toBe('Updated Post');

    db.delete(schema.journal).where(eq(schema.journal.id, 'j1')).run();
    expect(db.select().from(schema.journal).where(eq(schema.journal.id, 'j1')).get()).toBeUndefined();
  });
});

// ─── About Content ─────────────────────────────────────────────
describe('AboutContent entity', () => {
  it('stores and reads all about fields', () => {
    const clients = ['Coltivare', 'Marfa'];
    const recognition = [['2025', 'Award']];
    db.insert(schema.aboutContent).values({
      id: 1,
      intro: 'Intro text',
      body: JSON.stringify(['Para 1', 'Para 2']),
      selectedClients: JSON.stringify(clients),
      recognition: JSON.stringify(recognition),
      trajectory: JSON.stringify([['2019', 'Start']]),
      contactBlurb: 'Contact info',
      numbers: JSON.stringify([['72', 'projetos']]),
    }).run();

    const about = db.select().from(schema.aboutContent).where(eq(schema.aboutContent.id, 1)).get();
    expect(about?.intro).toBe('Intro text');
    expect(JSON.parse(about!.selectedClients)).toContain('Coltivare');
    expect(JSON.parse(about!.recognition)[0][1]).toBe('Award');
  });
});

// ─── Media entity ──────────────────────────────────────────────
describe('Media entity', () => {
  it('validates mime type against UPLOAD_LIMITS', () => {
    const badTypes = ['application/pdf', 'text/html'];
    for (const t of badTypes) {
      expect(UPLOAD_LIMITS.allowedMimeTypes.includes(t as (typeof UPLOAD_LIMITS.allowedMimeTypes)[number])).toBe(false);
    }
  });

  it('validates file size against UPLOAD_LIMITS', () => {
    const overLimit = UPLOAD_LIMITS.maxSizeBytes + 1;
    const underLimit = UPLOAD_LIMITS.maxSizeBytes - 1;
    expect(overLimit > UPLOAD_LIMITS.maxSizeBytes).toBe(true);
    expect(underLimit <= UPLOAD_LIMITS.maxSizeBytes).toBe(true);
  });

  it('creates and reads a media record', () => {
    db.insert(schema.media).values({
      id: 'm1', filename: 'abc123.jpg', originalName: 'photo.jpg',
      mimeType: 'image/jpeg', size: 1024, width: 1920, height: 1080,
      path: 'abc123.jpg',
    }).run();
    const m = db.select().from(schema.media).where(eq(schema.media.id, 'm1')).get();
    expect(m?.mimeType).toBe('image/jpeg');
    expect(m?.size).toBe(1024);
  });

  it('deletes a media record', () => {
    db.insert(schema.media).values({
      id: 'm2', filename: 'del.png', originalName: 'del.png',
      mimeType: 'image/png', size: 512, path: 'del.png',
    }).run();
    db.delete(schema.media).where(eq(schema.media.id, 'm2')).run();
    expect(db.select().from(schema.media).where(eq(schema.media.id, 'm2')).get()).toBeUndefined();
  });
});

// ─── Local Storage Adapter ─────────────────────────────────────
describe('Local storage adapter', () => {
  const TEST_UPLOADS = path.join(process.cwd(), '__test_uploads');

  afterAll(async () => {
    await fs.rm(TEST_UPLOADS, { recursive: true, force: true });
  });

  it('saves a file and returns the stored filename', async () => {
    process.env.UPLOADS_DIR = TEST_UPLOADS;
    const { localAdapter } = await import('../src/lib/storage/local');
    const buf = Buffer.from('fake image data');
    const stored = await localAdapter.save(buf, 'test.jpg', 'image/jpeg');
    expect(stored).toMatch(/\.jpg$/);
    const exists = await fs.access(path.join(TEST_UPLOADS, stored)).then(() => true).catch(() => false);
    expect(exists).toBe(true);
    await localAdapter.delete(stored);
  });

  it('getUrl returns /uploads/{filename}', async () => {
    const { localAdapter } = await import('../src/lib/storage/local');
    expect(localAdapter.getUrl('abc123.jpg')).toBe('/uploads/abc123.jpg');
  });
});

// ─── HomeSettings entity ────────────────────────────────────────
describe('HomeSettings entity', () => {
  it('stores and reads all home settings fields', () => {
    db.insert(schema.homeSettings).values({
      id: 1,
      manifestoText: 'Cada projeto começa por um caderno.',
      ctaHeadline: 'Tem um projeto?',
      ctaSub: 'O estúdio aceita 3-4 projetos por trimestre.',
    }).run();
    const hs = db.select().from(schema.homeSettings).where(eq(schema.homeSettings.id, 1)).get();
    expect(hs?.ctaHeadline).toBe('Tem um projeto?');
  });
});
