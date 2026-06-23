import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ─── Users ────────────────────────────────────────────────────
// Single user (Lucas). Stores auth + all identity/settings data.
export const users = sqliteTable('users', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull().default('Lucas Lobeu'),
  city: text('city').notNull().default('São Paulo, BR'),
  bio: text('bio').notNull().default('Diretor, fotógrafo e diretor de social. SP, 2019—.'),
  phone: text('phone').default('+55 11 9 8472-0418'),
  instagram: text('instagram').default('@lucaslobeu'),
  vimeo: text('vimeo').default('vimeo.com/lucaslobeu'),
  behance: text('behance').default('behance.net/lucaslobeu'),
  socialLinks: text('social_links').notNull().default('[]'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ─── Projects ─────────────────────────────────────────────────
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  client: text('client').notNull(),
  year: text('year').notNull(),
  category: text('category').notNull(), // Filme | Foto | Social
  role: text('role').notNull(),
  summary: text('summary').notNull(),
  body: text('body').notNull().default('[]'),        // JSON: ContentBlock[]
  credits: text('credits').notNull().default('[]'),  // JSON: [role, name][]
  coverImageId: text('cover_image_id'),
  coverHoverImageId: text('cover_hover_image_id'),
  coverTone: text('cover_tone').notNull().default('mid'), // light | mid | dark
  coverKind: text('cover_kind').notNull().default('tall'), // tall | wide | square
  template: text('template').notNull().default('editorial'), // editorial | gallery | longform
  status: text('status').notNull().default('published'), // published | draft
  sortOrder: integer('sort_order').notNull().default(0),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// ─── Media ────────────────────────────────────────────────────
// Upload limits: 10MB per image, JPEG/PNG/WebP/AVIF only
export const media = sqliteTable('media', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  filename: text('filename').notNull(),       // stored filename (hashed)
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),             // bytes
  width: integer('width'),
  height: integer('height'),
  path: text('path').notNull(),               // relative path from storage root
  alt: text('alt').default(''),
  projectId: text('project_id'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ─── Home Tiles ───────────────────────────────────────────────
export const homeTiles = sqliteTable('home_tiles', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  kind: text('kind').notNull().default('photo'), // video | photo
  label: text('label').notNull(),
  imageId: text('image_id'),
  duration: text('duration'),                    // for videos e.g. "00:32"
  linkedProjectSlug: text('linked_project_slug'),
  ratio: text('ratio').notNull().default('4/5'),
  tone: text('tone').notNull().default('mid'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ─── Links (/links bio page) ───────────────────────────────────
export const links = sqliteTable('links', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  label: text('label').notNull(),
  href: text('href').notNull(),
  kind: text('kind').notNull().default('primary'), // primary | social | contact
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ─── Journal ──────────────────────────────────────────────────
export const journal = sqliteTable('journal', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull().default(''),
  imageId: text('image_id'),
  readTime: text('read_time').default('3 min'),
  publishedAt: text('published_at').notNull().default(sql`(datetime('now'))`),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ─── About Content ────────────────────────────────────────────
// Single-row table for the About page editorial content.
export const aboutContent = sqliteTable('about_content', {
  id: integer('id').primaryKey().default(1),
  intro: text('intro').notNull().default(''),
  body: text('body').notNull().default('[]'),           // JSON: string[]
  selectedClients: text('selected_clients').notNull().default('[]'), // JSON: string[]
  recognition: text('recognition').notNull().default('[]'), // JSON: [year, txt][]
  trajectory: text('trajectory').notNull().default('[]'),   // JSON: [year, txt][]
  contactBlurb: text('contact_blurb').notNull().default(''),
  portraitImageId: text('portrait_image_id'),
  portraitImageUrl: text('portrait_image_url').notNull().default(''),
  numbers: text('numbers').notNull().default('[]'), // JSON: [val, label][]
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// ─── Home Settings ────────────────────────────────────────────
// Editable home page copy — all sections stored here as text/JSON.
export const homeSettings = sqliteTable('home_settings', {
  id: integer('id').primaryKey().default(1),
  // Hero section
  heroRoles: text('hero_roles').notNull().default('Filmmaker · Photographer · Social'),
  heroDescription: text('hero_description').notNull().default('Diretor audiovisual e fotógrafo. Narrativas visuais que movem marcas, produtos e pessoas.'),
  // About section
  aboutStatement: text('about_statement').notNull().default('DIRETOR AUDIOVISUAL E FOTÓGRAFO DE SÃO PAULO. CRIO IMAGENS CLARAS, IMPACTANTES E AUTÊNTICAS PARA MARCAS E FUNDADORES — TRABALHOS QUE PARECEM CERTOS, FUNCIONAM BEM E DURAM.'),
  aboutFooterHeadline: text('about_footer_headline').notNull().default('O TRABALHO NÃO É SÓ BONITO — ELE PERFORMA. ISSO É O QUE ESTÁ POR TRÁS DE CADA IMAGEM.'),
  // Repeated text sections — kept from original
  manifestoText: text('manifesto_text').notNull().default('Cada projeto começa por um caderno. A maior parte dele acontece antes da câmera ser acionada. O resto é só obediência ao plano.'),
  ctaHeadline: text('cta_headline').notNull().default('Tem um projeto?'),
  ctaSub: text('cta_sub').notNull().default('O estúdio aceita três a quatro projetos por trimestre.'),
  // Media fields
  showcaseImageUrl: text('showcase_image_url').notNull().default(''),
  aboutPortraitUrl: text('about_portrait_url').notNull().default(''),
  aboutFooterImageUrl: text('about_footer_image_url').notNull().default(''),
  // Featured projects count on home
  homeFeaturedCount: integer('home_featured_count').notNull().default(5),
  // Projects page sections
  projectsHeroSub: text('projects_hero_sub').notNull().default(''),
  projectsManifestoText: text('projects_manifesto_text').notNull().default(''),
  projectsManifestoImageUrl: text('projects_manifesto_image_url').notNull().default(''),
  // JSON arrays — stored as text, parsed at query time
  stats: text('stats').notNull().default('[]'),         // StatItem[]
  testimonials: text('testimonials').notNull().default('[]'), // TestimonialItem[]
  faqItems: text('faq_items').notNull().default('[]'),  // FaqItem[]
  clients: text('clients').notNull().default('[]'),     // ClientItem[]
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Media = typeof media.$inferSelect;
export type HomeTile = typeof homeTiles.$inferSelect;
export type Link = typeof links.$inferSelect;
export type JournalEntry = typeof journal.$inferSelect;
export type AboutContent = typeof aboutContent.$inferSelect;
export type HomeSettings = typeof homeSettings.$inferSelect;
