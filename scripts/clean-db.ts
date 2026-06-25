#!/usr/bin/env node
/**
 * clean-db.ts — Zera o conteúdo do banco para um início de produção limpo.
 *
 * Faz backup de local.db antes. Esvazia projetos, clientes, mídia, tiles e
 * links; reseta home_settings e about_content para uma única linha padrão; e
 * mantém uma única linha de usuário (identidade do Lucas) para a página de
 * Configurações funcionar. Estrutura/migrações ficam intactas.
 *
 * Run: npx tsx scripts/clean-db.ts
 */
import Database from 'better-sqlite3'
import { randomBytes } from 'crypto'
import fs from 'fs'
import path from 'path'

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), 'local.db')

// Backup com timestamp, por segurança.
if (fs.existsSync(DB_PATH)) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backup = `${DB_PATH}.bak-${stamp}`
  fs.copyFileSync(DB_PATH, backup)
  console.log(`Backup criado: ${backup}`)
}

const db = new Database(DB_PATH)

db.transaction(() => {
  // Conteúdo — esvaziado por completo.
  for (const table of ['projects', 'clients', 'media', 'home_tiles', 'links']) {
    db.prepare(`DELETE FROM ${table}`).run()
  }

  // Páginas single-row — voltam ao padrão do schema (1 linha id=1).
  db.prepare('DELETE FROM home_settings').run()
  db.prepare('INSERT INTO home_settings (id) VALUES (1)').run()
  db.prepare('DELETE FROM about_content').run()
  db.prepare('INSERT INTO about_content (id) VALUES (1)').run()

  // Usuário — mantém uma identidade padrão (login é via Google OAuth/whitelist;
  // o hash é aleatório só porque a coluna é NOT NULL e nunca autentica ninguém).
  db.prepare('DELETE FROM users').run()
  db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(
    'lucas@lobeu.com',
    randomBytes(24).toString('hex'),
  )
})()

const counts = {
  projects: db.prepare('SELECT COUNT(*) c FROM projects').get() as { c: number },
  clients: db.prepare('SELECT COUNT(*) c FROM clients').get() as { c: number },
  media: db.prepare('SELECT COUNT(*) c FROM media').get() as { c: number },
  home_tiles: db.prepare('SELECT COUNT(*) c FROM home_tiles').get() as { c: number },
  links: db.prepare('SELECT COUNT(*) c FROM links').get() as { c: number },
  users: db.prepare('SELECT COUNT(*) c FROM users').get() as { c: number },
}

console.log('✓ Banco limpo. Contagens agora:')
for (const [t, r] of Object.entries(counts)) console.log(`  ${t}: ${r.c}`)
console.log('  home_settings: 1 (padrão) · about_content: 1 (padrão)')
db.close()
