#!/usr/bin/env node
/**
 * backfill-clients.ts — Migração de dados (idempotente) para o módulo global
 * de clientes.
 *
 * Junta os clientes que viviam espalhados em três lugares:
 *   - about_content.companies  (JSON: { name, year?, imageUrl?, instagramUrl? })
 *   - home_settings.clients    (JSON: { name, category })  — `category` é um ano ("2025/")
 *   - projects.client          (texto livre)
 *
 * Dedupe por nome (case-insensitive), insere na tabela `clients` e atrela os
 * projetos existentes por nome. Reexecutar é seguro: nomes já presentes são
 * ignorados e clientIds já preenchidos não são sobrescritos.
 *
 * Run: npx tsx scripts/backfill-clients.ts
 */
import Database from 'better-sqlite3'
import { randomBytes } from 'crypto'
import path from 'path'

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), 'local.db')
const db = new Database(DB_PATH)

interface ClientSeed {
  name: string
  year: string
  category: string
  imageUrl: string
  instagramUrl: string
}

const norm = (s: string) => s.trim().toLowerCase()
const parse = <T,>(raw: unknown, fallback: T): T => {
  if (typeof raw !== 'string' || !raw.trim()) return fallback
  try { return JSON.parse(raw) as T } catch { return fallback }
}

// ── Coleta as fontes ────────────────────────────────────────────
const about = db.prepare('SELECT companies FROM about_content WHERE id = 1').get() as { companies?: string } | undefined
const home = db.prepare('SELECT clients FROM home_settings WHERE id = 1').get() as { clients?: string } | undefined

const companies = parse<Array<{ name?: string; year?: string; imageUrl?: string; instagramUrl?: string }>>(about?.companies, [])
const homeClients = parse<Array<{ name?: string; category?: string }>>(home?.clients, [])

// ── Mescla por nome (about tem prioridade por ser mais rico) ─────
const merged = new Map<string, ClientSeed>()

for (const c of companies) {
  const name = (c.name ?? '').trim()
  if (!name) continue
  merged.set(norm(name), {
    name,
    year: c.year ?? '',
    category: '',
    imageUrl: c.imageUrl ?? '',
    instagramUrl: c.instagramUrl ?? '',
  })
}

for (const c of homeClients) {
  const name = (c.name ?? '').trim()
  if (!name) continue
  const key = norm(name)
  // home `category` guardava um ano ("2025/"). Vira `year` se for numérico.
  const raw = (c.category ?? '').trim()
  const asYear = raw.replace(/[^0-9]/g, '')
  const existing = merged.get(key)
  if (existing) {
    if (!existing.year && asYear) existing.year = asYear
  } else {
    merged.set(key, {
      name,
      year: asYear || '',
      category: asYear ? '' : raw,
      imageUrl: '',
      instagramUrl: '',
    })
  }
}

// ── Insere os que ainda não existem ─────────────────────────────
const existingRows = db.prepare('SELECT id, name FROM clients').all() as Array<{ id: string; name: string }>
const byName = new Map(existingRows.map((r) => [norm(r.name), r.id]))
const maxRow = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM clients').get() as { m: number }
let sort = maxRow.m + 1

const insert = db.prepare(
  `INSERT INTO clients (id, name, year, category, image_url, instagram_url, sort_order)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
)

let inserted = 0
for (const [key, c] of merged) {
  if (byName.has(key)) continue
  const id = randomBytes(16).toString('hex')
  insert.run(id, c.name, c.year, c.category, c.imageUrl, c.instagramUrl, sort++)
  byName.set(key, id)
  inserted++
}

// ── Atrela projetos por nome (sem sobrescrever vínculos existentes) ─
const projects = db.prepare('SELECT id, client, client_id FROM projects').all() as Array<{ id: string; client: string; client_id: string | null }>
const setClientId = db.prepare('UPDATE projects SET client_id = ? WHERE id = ?')
let linked = 0
for (const p of projects) {
  if (p.client_id) continue
  const id = byName.get(norm(p.client ?? ''))
  if (id) { setClientId.run(id, p.id); linked++ }
}

console.log(`✓ Backfill de clientes concluído (${DB_PATH})`)
console.log(`  Clientes inseridos: ${inserted}`)
console.log(`  Total de clientes:  ${byName.size}`)
console.log(`  Projetos atrelados: ${linked}`)
db.close()
