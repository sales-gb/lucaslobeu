# Portfólio Lucas Lobeu — Progress Report

Generated: 2026-05-23

---

## What was built

A complete Next.js 16.2.6 monolith for filmmaker/photographer Lucas Lobeu: public portfolio frontend + headless CMS (admin panel), all in one project targeting Cloudflare Workers via @opennextjs/cloudflare.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.6 App Router + Turbopack |
| Runtime (prod) | @opennextjs/cloudflare |
| ORM | Drizzle ORM 0.45 |
| DB (local) | better-sqlite3 |
| DB (prod) | Cloudflare D1 (SQLite-compatible) |
| Auth | next-auth@5.0.0-beta.31, Credentials + JWT |
| Password | bcryptjs (cost 12) |
| Storage (local) | local disk → `/public/uploads/` |
| Storage (prod) | Cloudflare R2 (stub ready, swap in `lib/storage/index.ts`) |
| Tests | Vitest 4.1.7, 28 tests, one-shot |
| Styling | Verbatim handoff CSS (`styles/portfolio.css`, `styles/admin.css`) |

---

## Design tokens (from handoff)

| Token | Value |
|---|---|
| `--ink` | `#0A0A0A` |
| `--paper` | `#F4F1EA` |
| `--accent` | `#B08D57` (gold) |
| Serif | Cormorant Garamond 300/400 |
| Sans | Inter 300/400 |
| Mono | JetBrains Mono 400 |

Logo: two L-shaped SVG bracket paths forming an aperture, gold circle at centre.

---

## Database schema (8 tables)

| Table | Purpose |
|---|---|
| `users` | Single user — auth + identity (name, bio, city, socials) |
| `projects` | Portfolio projects — slug, title, category, body (JSON blocks), credits (JSON array), cover metadata, sort order, template |
| `media` | Uploaded images — filename, original name, MIME, size, dimensions, path |
| `home_tiles` | Homepage hero tiles — kind (video/photo), label, duration, tone, ratio, sort order |
| `links` | /links page — label, href, kind (primary/social/contact), enabled, sort order |
| `journal` | Blog/diary entries — slug, title, excerpt, content, read time, publishedAt |
| `about_content` | Single-row — intro, body[], selectedClients[], recognition[][], trajectory[][], numbers[][] (all stored as JSON text) |
| `home_settings` | Single-row — manifestoText, ctaHeadline, ctaSub, heroVariant |

---

## Upload limits

```
Max file size:   10 MB  (10 * 1024 * 1024 bytes)
Allowed MIME:    image/jpeg, image/png, image/webp, image/avif
Allowed ext:     .jpg .jpeg .png .webp .avif
```

Validated server-side in `app/api/media/route.ts`. Enforced by:
- File size check before saving
- MIME type allowlist check
- `UPLOAD_LIMITS` constant exported from `lib/storage/interface.ts`

---

## Public portfolio pages

| Route | Strategy | Description |
|---|---|---|
| `/` | Static | Home — Hero (editorial), Em Prática scroll section, Sobre teaser, Manifesto crossfade, Featured projects, Marquee, CTA |
| `/projects` | Static | Masonry projects grid with client-side filter (Todos / Filme / Foto / Social) |
| `/projects/[slug]` | SSG (10 paths) | Project detail with 3 templates: editorial, gallery, longform |
| `/about` | Static | Sticky portrait, paragraphs, clients grid, recognition list, trajectory timeline |
| `/journal` | Static | Numbered entry list with date and readTime |
| `/contact` | Static | Split layout with `ContactForm` client island |
| `/links` | Static | Minimal link-in-bio card with BrandMark |
| `/_not-found` | Static | "Quadro sem imagem." 404 page |

---

## Admin CMS pages

| Route | Description |
|---|---|
| `/admin/login` | Split layout login with BrandMark SVG, email+password, Auth.js credentials |
| `/admin/dashboard` | Stats (projects / published / media / journal), recent activity |
| `/admin/projects` | Table with DnD sort, status badge, edit/delete per row |
| `/admin/projects/[id]` | Full editor — body blocks (paragraph, heading, image, video, quote, divider), sidebar (meta, cover, publish) |
| `/admin/home` | Tiles DnD editor with kind/label/duration/tone/ratio fields |
| `/admin/about` | About page editor — intro, paragraphs, clients chips, recognition table, trajectory table, numbers table, contactBlurb |
| `/admin/links` | DnD links list with inline editing, kind select, enabled toggle, right-panel preview |
| `/admin/settings` | Identity (name, city, bio), contact (email, phone), socials (instagram, vimeo, behance), account (password) |
| `/admin/media` | File grid, multi-upload via `<input type=file multiple>`, delete with confirm |

---

## API routes

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/projects` | No | List projects (filters: `status`, `category`; ordered by `sortOrder`) |
| POST | `/api/projects` | Yes | Create project |
| GET | `/api/projects/[id]` | No | Get project by ID |
| PATCH | `/api/projects/[id]` | Yes | Update project fields |
| DELETE | `/api/projects/[id]` | Yes | Delete project |
| GET | `/api/home-tiles` | No | List tiles ordered by sortOrder |
| POST | `/api/home-tiles` | Yes | Upsert tile |
| PATCH | `/api/home-tiles` | Yes | Reorder tiles (body: `{order: string[]}`) |
| GET | `/api/links` | No | List links |
| POST | `/api/links` | Yes | Create link |
| PATCH | `/api/links` | Yes | Reorder links |
| GET | `/api/journal` | No | List entries ordered by publishedAt desc |
| POST | `/api/journal` | Yes | Create entry |
| GET | `/api/journal/[id]` | No | Get entry |
| PATCH | `/api/journal/[id]` | Yes | Update entry |
| DELETE | `/api/journal/[id]` | Yes | Delete entry |
| GET | `/api/about` | No | Get about content (row id=1) |
| PATCH | `/api/about` | Yes | Update about content |
| GET | `/api/settings` | Yes | Get user profile |
| POST | `/api/settings` | Yes | Update user profile |
| POST | `/api/media` | Yes | Upload image (multipart/form-data, validates MIME + size) |
| GET | `/api/media` | Yes | List media records |
| DELETE | `/api/media/[id]` | Yes | Delete media + disk file |
| ALL | `/api/auth/[...nextauth]` | — | Auth.js handler (login, session, signout) |

---

## Test results

```
Test Files  1 passed (1)
     Tests  28 passed (28)
  Duration  ~1.3s (one-shot, terminates)
```

### Coverage by entity

| Entity | Tests |
|---|---|
| UPLOAD_LIMITS | 3 — maxSizeBytes, allowed MIME types, rejected MIME types |
| User | 3 — insert+read all fields, unique email constraint, bcrypt verify |
| Projects | 9 — CRUD, slug uniqueness, JSON body, JSON credits, update, delete, filter by status, filter by category, order by sortOrder, required fields |
| HomeTiles | 1 — full CRUD cycle |
| Links | 2 — create+read, filter by enabled |
| Journal | 1 — full CRUD cycle |
| AboutContent | 1 — all JSON fields |
| Media | 3 — MIME validation, size validation, create+read, delete |
| LocalStorageAdapter | 2 — save+getUrl, delete |
| HomeSettings | 1 — all fields |

---

## How to run

```bash
# Install deps
pnpm install

# Generate + run DB migrations
pnpm db:generate
pnpm db:migrate

# Seed sample data (10 projects + all entities from handoff)
pnpm seed
# Credentials: lucas@lobeu.com / lobeu2026

# Run tests (one-shot, exits)
pnpm test

# Build for production
pnpm build

# Deploy to Cloudflare Workers
pnpm dlx wrangler deploy
```

---

## Key files

```
lib/db/schema.ts          — 8 Drizzle tables + inferred TypeScript types
lib/db/index.ts           — getDb() singleton (better-sqlite3 + drizzle)
lib/db/migrations/        — Generated SQL migrations
lib/storage/interface.ts  — StorageAdapter interface + UPLOAD_LIMITS
lib/storage/local.ts      — Local disk adapter (saves to /public/uploads/)
lib/storage/r2.ts         — R2 stub (swap in index.ts for production)
lib/storage/index.ts      — Active adapter export (change here to switch)
lib/auth.ts               — NextAuth config (Credentials, JWT, bcrypt)
styles/portfolio.css      — Portfolio CSS verbatim from handoff
styles/admin.css          — Admin CSS verbatim from handoff
seed.ts                   — Seeds all 8 tables with handoff sample data
__tests__/api.test.ts     — 28 Vitest tests (one-shot)
drizzle.config.ts         — Drizzle Kit config
wrangler.toml             — Cloudflare D1 + R2 bindings
```

---

## Production deployment (Cloudflare)

1. Create D1 database: `wrangler d1 create lucaslobeu-db`
2. Update `wrangler.toml` `database_id` with the returned ID
3. Create R2 bucket: `wrangler r2 bucket create lucaslobeu-media`
4. Set secret: `wrangler secret put NEXTAUTH_SECRET`
5. Swap storage adapter in `lib/storage/index.ts` → use `createR2Adapter`
6. Run migrations against D1: `wrangler d1 execute lucaslobeu-db --file=lib/db/migrations/0000_fast_lady_mastermind.sql`
7. Deploy: `pnpm build && wrangler deploy`

---

## Design decisions

- **8-table schema** instead of 1-2: needed to properly separate content types and enable independent CMS management per entity. JSON blobs (body, credits, selectedClients, etc.) handle flexible list structures without excessive normalization.
- **JWT sessions** (not database sessions): no session table needed, stateless, CF Workers compatible.
- **Storage abstraction**: swapping from local to R2 is a single-line change in `lib/storage/index.ts`. Same interface, two implementations.
- **CSS verbatim**: handoff CSS copied without modification to guarantee pixel-perfect fidelity. Admin uses `styles/admin.css` (adm-* classes), portfolio uses `styles/portfolio.css` (ll-* classes).
- **Static generation for public pages**: all portfolio pages pre-rendered at build time — `/projects/[slug]` uses `generateStaticParams` for all 10 projects. Admin routes are dynamic (server-rendered on demand, protected by auth middleware).
- **Auth middleware**: `middleware.ts` protects all `/admin/*` routes except `/admin/login`. API routes check `getServerSession()` for mutation endpoints.
- **bcryptjs sync** in seed.ts: avoids top-level await / CJS output format issues with tsx.

---

## Known limits / TODOs

- **Image optimization in admin**: the `<Image>` component is not used in admin thumbnails — shows MIME badge instead. A proper thumbnail renderer would need a signed URL from R2 or a local URL from `/public/uploads/`.
- **Contact form**: `ContactForm` sends optimistic UI feedback but the actual form submission endpoint (`/api/contact`) is not wired — needs SMTP integration (e.g. Resend, SendGrid) or Formspree.
- **Journal rich text**: journal `content` is stored as plain text. A rich text editor (e.g. Tiptap) would improve the admin experience.
- **Project body blocks**: the block editor in `/admin/projects/[id]` supports paragraph, heading, image, video, quote, divider. Adding new block types requires updating both the editor UI and the portfolio body-block renderer.
- **R2 swap**: `lib/storage/r2.ts` is a complete stub — fill in the `save` / `delete` implementation using the Cloudflare `R2Bucket` binding API.
- **D1 ID**: `wrangler.toml` has a placeholder `database_id` — must be replaced with the real ID from `wrangler d1 create`.
- **Multi-image project covers**: currently a single `coverImageId` FK. The project body supports image blocks for galleries.
- **Search / SEO**: `generateMetadata` is implemented per project page. Sitemap and robots.txt are not yet generated.
