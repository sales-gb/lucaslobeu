#!/usr/bin/env node
/**
 * seed.ts — Populates the local SQLite DB with sample data.
 * Run: npx tsx seed.ts
 * @ts-check
 */
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import * as schema from './src/lib/db/schema';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import path from 'path';

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), 'local.db');
const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
const db = drizzle(sqlite, { schema });

// Run migrations first
migrate(db, { migrationsFolder: './src/lib/db/migrations' });

// ─── Users ─────────────────────────────────────────────────────
// Login é exclusivamente via Google OAuth (whitelist em auth.config.ts). O
// provider de senha foi removido; mantemos um hash aleatório só porque a coluna
// é NOT NULL — ele não autentica ninguém e nenhuma senha é commitada.
const passwordHash = bcrypt.hashSync(randomBytes(24).toString('hex'), 12);
db.delete(schema.users).run();
db.insert(schema.users).values({
  id: 'user-lucas-lobeu',
  email: 'lucas@lobeu.com',
  passwordHash,
  name: 'Lucas Lobeu',
  city: 'São Paulo, BR',
  bio: 'Diretor, fotógrafo e diretor de social. SP, 2019—.',
  phone: '+55 11 9 8472-0418',
  instagram: '@lucaslobeu',
  vimeo: 'vimeo.com/lucaslobeu',
  behance: 'behance.net/lucaslobeu',
}).run();

// ─── Projects ─────────────────────────────────────────────────
db.delete(schema.projects).run();
const PROJECTS = [
  {
    id: 'silencio-azul',
    slug: 'silencio-azul',
    title: 'Silêncio Azul',
    client: 'Studio Mareh',
    year: '2025',
    category: 'Filme',
    role: 'Direção · Fotografia',
    summary: 'Curta de 8 minutos sobre o lapso entre duas marés. Filmado no litoral norte em 35mm.',
    body: JSON.stringify([
      { kind: 'paragraph', text: 'Silêncio Azul nasceu de uma fotografia. Um retrato fora de foco, tirado às pressas num final de tarde de inverno, em que o céu se confundia com a água.' },
      { kind: 'image', tone: 'dark', ratio: '3/2', caption: 'Still — sequência de abertura.' },
      { kind: 'image-pair', tones: ['light','mid'], ratio: '4/5' },
      { kind: 'paragraph', text: 'O processo foi propositadamente lento. Três meses de pré-produção para 36 horas de filmagem. O resultado é um filme sobre a paciência da luz.' },
      { kind: 'image', tone: 'mid', ratio: '16/9', caption: 'Plano fixo — minuto 04:12.' },
      { kind: 'quote', text: 'A maré sobe quando ninguém repara. É na ausência que mora a forma.', source: 'Caderno de produção' },
      { kind: 'image-trio', tones: ['mid','dark','light'] },
    ]),
    credits: JSON.stringify([['Direção','Lucas Lobeu'],['Fotografia','Lucas Lobeu'],['Som','Marina Téo'],['Montagem','Pedro Aragão'],['Produção','Studio Mareh']]),
    coverTone: 'mid', coverKind: 'tall', template: 'editorial', status: 'published', sortOrder: 0,
  },
  {
    id: 'casa-baixa',
    slug: 'casa-baixa',
    title: 'Casa Baixa',
    client: 'Editorial Pano',
    year: '2025',
    category: 'Foto',
    role: 'Fotografia',
    summary: 'Ensaio de arquitetura doméstica. Cinco casas, uma sobre a outra.',
    body: JSON.stringify([
      { kind: 'paragraph', text: 'Cinco casas em cinco bairros de São Paulo, fotografadas em luz natural ao longo de seis sábados consecutivos.' },
      { kind: 'image-grid', tones: ['light','mid','light','dark'], cols: 2 },
      { kind: 'paragraph', text: 'O grão da película é o grão do tempo. Não há intervenção digital.' },
      { kind: 'image', tone: 'light', ratio: '3/4', caption: 'Casa 03 — sala de estar.' },
    ]),
    credits: JSON.stringify([['Fotografia','Lucas Lobeu'],['Cliente','Editorial Pano'],['Veículo','Pano nº 14, 2025']]),
    coverTone: 'light', coverKind: 'square', template: 'gallery', status: 'published', sortOrder: 1,
  },
  {
    id: 'noturno-saopaulo',
    slug: 'noturno-saopaulo',
    title: 'Noturno SP',
    client: 'Pessoal',
    year: '2024',
    category: 'Foto',
    role: 'Fotografia',
    summary: 'A cidade entre 02h e 05h. Série pessoal.',
    body: JSON.stringify([
      { kind: 'paragraph', text: 'Caminhadas insones que viraram um ano de fotografias. Nenhuma das imagens foi tirada antes das duas da manhã.' },
      { kind: 'image-trio', tones: ['dark','dark','mid'] },
      { kind: 'image', tone: 'dark', ratio: '21/9', caption: 'Av. São João, 03:47.' },
    ]),
    credits: JSON.stringify([['Fotografia','Lucas Lobeu'],['Edição','Lucas Lobeu']]),
    coverTone: 'dark', coverKind: 'wide', template: 'editorial', status: 'published', sortOrder: 2,
  },
  {
    id: 'matinal-coltivare',
    slug: 'matinal-coltivare',
    title: 'Matinal',
    client: 'Coltivare',
    year: '2024',
    category: 'Social',
    role: 'Direção · Edição · Social',
    summary: 'Campanha de 30 dias para um café especial.',
    body: JSON.stringify([
      { kind: 'paragraph', text: 'Coltivare queria mostrar o que acontece entre 05h e 09h da manhã na cafeteria. Trinta peças, uma por dia, com a mesma luz e a mesma pessoa atrás da câmera.' },
      { kind: 'image-grid', tones: ['light','light','mid'], cols: 3 },
      { kind: 'image', tone: 'mid', ratio: '4/5', caption: 'Reel — dia 17.' },
    ]),
    credits: JSON.stringify([['Direção','Lucas Lobeu'],['Edição','Lucas Lobeu'],['Cliente','Coltivare Café']]),
    coverTone: 'light', coverKind: 'tall', template: 'editorial', status: 'published', sortOrder: 3,
  },
  {
    id: 'ilha-de-vidro',
    slug: 'ilha-de-vidro',
    title: 'Ilha de Vidro',
    client: 'Galeria Hum',
    year: '2024',
    category: 'Filme',
    role: 'Fotografia',
    summary: 'Documentação em vídeo da exposição de Mira Hokuto.',
    body: JSON.stringify([
      { kind: 'paragraph', text: 'Quinze peças de vidro soprado, fotografadas em loop curto para serem projetadas dentro da própria exposição.' },
      { kind: 'image', tone: 'mid', ratio: '16/9' },
      { kind: 'image-pair', tones: ['mid','light'], ratio: '1/1' },
    ]),
    credits: JSON.stringify([['Fotografia','Lucas Lobeu'],['Artista','Mira Hokuto'],['Galeria','Hum, São Paulo']]),
    coverTone: 'mid', coverKind: 'square', template: 'gallery', status: 'published', sortOrder: 4,
  },
  {
    id: 'aparelho-domestico',
    slug: 'aparelho-domestico',
    title: 'Aparelho Doméstico',
    client: 'Marfa',
    year: '2024',
    category: 'Foto',
    role: 'Fotografia · Direção de Arte',
    summary: 'Lookbook de utensílios de cozinha em casa real, não em estúdio.',
    body: JSON.stringify([
      { kind: 'paragraph', text: 'Marfa pediu um lookbook de utensílios sem o vocabulário do estúdio. Filmamos em três cozinhas reais, com a luz da janela e a louça do dia anterior na pia.' },
      { kind: 'image-grid', tones: ['light','light','mid','light'], cols: 2 },
    ]),
    credits: JSON.stringify([['Fotografia','Lucas Lobeu'],['Direção de Arte','Lucas Lobeu + Bia Senna'],['Cliente','Marfa']]),
    coverTone: 'light', coverKind: 'wide', template: 'editorial', status: 'published', sortOrder: 5,
  },
  {
    id: 'pequenos-incendios',
    slug: 'pequenos-incendios',
    title: 'Pequenos Incêndios',
    client: 'Pessoal',
    year: '2023',
    category: 'Filme',
    role: 'Direção',
    summary: 'Filme de cinco minutos sobre fogos de cozinha. Sem narração.',
    body: JSON.stringify([
      { kind: 'paragraph', text: 'Cinco minutos de fogo doméstico — chama do bule, do isqueiro, da vela, do fogão, do cigarro. Filme silencioso, sem narração.' },
      { kind: 'image', tone: 'dark', ratio: '16/9' },
      { kind: 'quote', text: 'Tudo arde em escalas diferentes. A panela esquece o que sabe.', source: 'Pequenos Incêndios, 2023' },
    ]),
    credits: JSON.stringify([['Direção','Lucas Lobeu'],['Fotografia','Lucas Lobeu'],['Som','Marina Téo']]),
    coverTone: 'dark', coverKind: 'tall', template: 'longform', status: 'published', sortOrder: 6,
  },
  {
    id: 'rua-tutoia',
    slug: 'rua-tutoia',
    title: 'Rua Tutóia',
    client: 'Casa Tutóia',
    year: '2023',
    category: 'Foto',
    role: 'Fotografia · Edição',
    summary: 'Identidade visual fotográfica para residência permanente em Paraisópolis.',
    body: JSON.stringify([
      { kind: 'paragraph', text: 'Uma casa-ateliê que recebe artistas em residência. A foto não documenta — ela é parte da identidade.' },
      { kind: 'image-pair', tones: ['light','mid'], ratio: '3/4' },
    ]),
    credits: JSON.stringify([['Fotografia','Lucas Lobeu'],['Cliente','Casa Tutóia']]),
    coverTone: 'light', coverKind: 'square', template: 'editorial', status: 'published', sortOrder: 7,
  },
  {
    id: 'antemanha',
    slug: 'antemanha',
    title: 'Antemanhã',
    client: 'Revista Serrote',
    year: '2023',
    category: 'Foto',
    role: 'Fotografia',
    summary: 'Ensaio fotográfico publicado em Serrote nº 41.',
    body: JSON.stringify([
      { kind: 'paragraph', text: 'Antemanhã: o intervalo entre o sono e o despertar do bairro. Doze fotografias publicadas em sequência.' },
      { kind: 'image-trio', tones: ['mid','dark','mid'] },
    ]),
    credits: JSON.stringify([['Fotografia','Lucas Lobeu'],['Veículo','Serrote, IMS — nº 41']]),
    coverTone: 'mid', coverKind: 'wide', template: 'editorial', status: 'published', sortOrder: 8,
  },
  {
    id: 'ofertorio',
    slug: 'ofertorio',
    title: 'Ofertório',
    client: 'Festa Junina Vila',
    year: '2023',
    category: 'Social',
    role: 'Direção · Edição',
    summary: 'Filme curto sobre uma quermesse paulistana. Conteúdo seriado para social.',
    body: JSON.stringify([
      { kind: 'paragraph', text: 'Quatro noites de quermesse, cortadas em sete peças para social. O frame inteiro, sem corte de zoom.' },
      { kind: 'image', tone: 'mid', ratio: '9/16', caption: 'Vertical — story.' },
      { kind: 'image-pair', tones: ['mid','dark'], ratio: '4/5' },
    ]),
    credits: JSON.stringify([['Direção','Lucas Lobeu'],['Edição','Lucas Lobeu']]),
    coverTone: 'mid', coverKind: 'tall', template: 'editorial', status: 'published', sortOrder: 9,
  },
];

for (const p of PROJECTS) {
  db.insert(schema.projects).values(p).run();
}

// ─── Home Tiles ────────────────────────────────────────────────
db.delete(schema.homeTiles).run();
const TILES = [
  { id: 'h1', kind: 'video', tone: 'dark', label: 'Reel · Janeiro', duration: '00:32', linkedProjectSlug: null, ratio: '9/16', sortOrder: 0 },
  { id: 'h2', kind: 'photo', tone: 'mid', label: 'Still · Silêncio Azul', linkedProjectSlug: 'silencio-azul', ratio: '3/4', sortOrder: 1 },
  { id: 'h3', kind: 'video', tone: 'light', label: 'Behind the scenes · Matinal', duration: '00:18', linkedProjectSlug: 'matinal-coltivare', ratio: '4/5', sortOrder: 2 },
  { id: 'h4', kind: 'photo', tone: 'dark', label: 'Frame · Noturno SP', linkedProjectSlug: 'noturno-saopaulo', ratio: '3/2', sortOrder: 3 },
  { id: 'h5', kind: 'photo', tone: 'light', label: 'Caderno', linkedProjectSlug: null, ratio: '1/1', sortOrder: 4 },
];
for (const t of TILES) {
  db.insert(schema.homeTiles).values(t).run();
}

// ─── Links ────────────────────────────────────────────────────
db.delete(schema.links).run();
const LINKS = [
  { id: 'l1', label: 'Portfólio · lucaslobeu.com', href: '/', kind: 'primary', enabled: true, sortOrder: 0 },
  { id: 'l2', label: 'Projetos recentes', href: '/projects', kind: 'primary', enabled: true, sortOrder: 1 },
  { id: 'l3', label: 'Instagram', href: 'https://instagram.com/lucaslobeu', kind: 'social', enabled: true, sortOrder: 2 },
  { id: 'l4', label: 'Vimeo · filmes em alta', href: 'https://vimeo.com/lucaslobeu', kind: 'social', enabled: true, sortOrder: 3 },
  { id: 'l5', label: 'Behance', href: 'https://behance.net/lucaslobeu', kind: 'social', enabled: true, sortOrder: 4 },
  { id: 'l6', label: 'estudio@lucaslobeu.com', href: 'mailto:estudio@lucaslobeu.com', kind: 'contact', enabled: true, sortOrder: 5 },
];
for (const l of LINKS) {
  db.insert(schema.links).values(l).run();
}

// ─── Clients (módulo global) ───────────────────────────────────
// Fonte única de clientes/marcas, consumida pela Home e pela página Sobre e
// atrelada aos projetos. Os ids fixos permitem vincular os projetos abaixo.
db.delete(schema.clients).run();
const CLIENTS = [
  { id: 'cli-studio-mareh', name: 'Studio Mareh', year: '2025', category: 'Filme', instagramUrl: 'https://instagram.com/studiomareh' },
  { id: 'cli-editorial-pano', name: 'Editorial Pano', year: '2025', category: 'Editorial', instagramUrl: 'https://instagram.com/editorialpano' },
  { id: 'cli-coltivare', name: 'Coltivare', year: '2024', category: 'Café', instagramUrl: '' },
  { id: 'cli-galeria-hum', name: 'Galeria Hum', year: '2024', category: 'Arte', instagramUrl: 'https://instagram.com/galeriahum' },
  { id: 'cli-marfa', name: 'Marfa', year: '2024', category: 'Design', instagramUrl: '' },
  { id: 'cli-casa-tutoia', name: 'Casa Tutóia', year: '2023', category: 'Residência', instagramUrl: 'https://instagram.com/casatutoia' },
  { id: 'cli-revista-serrote', name: 'Revista Serrote', year: '2023', category: 'Editorial', instagramUrl: 'https://instagram.com/revistaserrote' },
];
CLIENTS.forEach((c, i) => {
  db.insert(schema.clients).values({ ...c, imageUrl: '', sortOrder: i }).run();
});
// Atrela cada projeto ao cliente correspondente pelo nome.
const clientIdByName = new Map(CLIENTS.map((c) => [c.name.toLowerCase(), c.id]));
for (const p of PROJECTS) {
  const cid = clientIdByName.get(p.client.toLowerCase());
  if (cid) db.update(schema.projects).set({ clientId: cid }).where(eq(schema.projects.id, p.id)).run();
}

// ─── About Content ─────────────────────────────────────────────
db.delete(schema.aboutContent).run();
db.insert(schema.aboutContent).values({
  id: 1,
  intro: 'Lucas Lobeu é diretor, fotógrafo e diretor de social para marcas que pedem silêncio. Trabalha em São Paulo desde 2019.',
  body: JSON.stringify([
    'O estúdio nasceu de uma teimosia: a de não separar foto de filme, e nenhum dos dois do gesto cotidiano que os antecede.',
    'A prática se divide entre três frentes: filme curto (autoral e comercial), ensaio fotográfico (editorial, identidade e arquitetura) e direção de conteúdo para marcas que entendem que ritmo importa mais que volume.',
    'Trabalhos publicados em Serrote, Pano, Vogue Brasil, e expostos na Galeria Hum e Casa Tutóia.',
  ]),
  companies: JSON.stringify([
    { name: 'Studio Mareh', imageUrl: '', instagramUrl: 'https://instagram.com/studiomareh' },
    { name: 'Editorial Pano', imageUrl: '', instagramUrl: 'https://instagram.com/editorialpano' },
    { name: 'Galeria Hum', imageUrl: '', instagramUrl: 'https://instagram.com/galeriahum' },
    { name: 'Casa Tutóia', imageUrl: '', instagramUrl: 'https://instagram.com/casatutoia' },
    { name: 'Revista Serrote', imageUrl: '', instagramUrl: 'https://instagram.com/revistaserrote' },
    { name: 'Coltivare', imageUrl: '', instagramUrl: '' },
  ]),
  trajectory: JSON.stringify([
    { year: '2019', title: 'O primeiro estúdio', description: 'Um porão na Vila Madalena e a teimosia de não separar foto de filme, nem nenhum dos dois do gesto cotidiano que os antecede.' },
    { year: '2021', title: 'Primeira capa', description: 'Direção e fotografia para a Pano nº 07 — o método encontra um público.' },
    { year: '2023', title: 'Ensaio em Serrote', description: 'Ensaio publicado na Serrote nº 41 (IMS) e mudança do estúdio para o Bom Retiro.' },
    { year: '2025', title: 'Silêncio Azul', description: 'Curta selecionado para a Mostra de Cinema de Tiradentes.' },
    { year: '2026', title: 'Hoje', description: 'Três a quatro projetos por trimestre, entre filme, ensaio e direção de conteúdo.' },
  ]),
  contactBlurb: 'Para projetos comerciais e autorais: estudio@lucaslobeu.com. Resposta em até dois dias úteis.',
  numbers: JSON.stringify([['72','projetos entregues'],['08','países alcançados'],['3—4','projetos por trimestre']]),
}).run();

// ─── Home Settings ─────────────────────────────────────────────
db.delete(schema.homeSettings).run();
db.insert(schema.homeSettings).values({
  id: 1,
  manifestoText: 'Cada projeto começa por um caderno. A maior parte dele acontece antes da câmera ser acionada. O resto é só obediência ao plano.',
  ctaHeadline: 'Tem um projeto?',
  ctaSub: 'O estúdio aceita três a quatro projetos por trimestre.',
}).run();

console.log('✓ Seed concluído. BD em:', DB_PATH);
console.log('  Login: somente Google OAuth (whitelist em src/lib/auth.config.ts)');
console.log('  Projetos:', PROJECTS.length);
console.log('  Tiles:', TILES.length);
console.log('  Links:', LINKS.length);
sqlite.close();
