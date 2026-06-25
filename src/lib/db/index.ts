import { drizzle as drizzleD1, type DrizzleD1Database } from 'drizzle-orm/d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import * as schema from './schema';

// Tipo unificado: os call sites usam o mesmo query builder (select/insert/
// update/delete) e já fazem `await` nas queries, então D1 (async) e
// better-sqlite3 (dev) são intercambiáveis sob este tipo.
export type Db = DrizzleD1Database<typeof schema>;

let _nodeDb: Db | null = null;

/**
 * Camada de banco com dois ambientes:
 *
 * - **Produção (Cloudflare Workers):** usa o binding **D1** (`env.DB`), obtido
 *   via `getCloudflareContext()`. Nenhum módulo nativo é carregado.
 * - **Dev local (Node):** carrega `better-sqlite3` por import dinâmico (nunca
 *   entra no bundle do Worker, pois o ramo D1 retorna antes no workerd).
 *
 * É async porque o caminho de dev importa o driver sob demanda. Os call sites
 * passam a `await getDb()`; as queries já eram aguardadas.
 */
export async function getDb(): Promise<Db> {
  // Produção: binding D1 do Cloudflare.
  try {
    const { env } = getCloudflareContext();
    if (env.DB) return drizzleD1(env.DB, { schema });
  } catch {
    // Fora do contexto Cloudflare (next dev / scripts) → SQLite de arquivo.
  }

  // Dev local: better-sqlite3 (import dinâmico, fora do bundle do Worker).
  if (_nodeDb) return _nodeDb;
  const [{ default: Database }, { drizzle: drizzleNode }, nodePath] = await Promise.all([
    import(/* webpackIgnore: true */ /* turbopackIgnore: true */ 'better-sqlite3'),
    import('drizzle-orm/better-sqlite3'),
    import('node:path'),
  ]);
  const dbPath = process.env.DB_PATH ?? nodePath.join(process.cwd(), 'local.db');
  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  // Cast: o driver better-sqlite3 expõe o mesmo builder; tratamos como Db.
  _nodeDb = drizzleNode(sqlite, { schema }) as unknown as Db;
  return _nodeDb;
}

export { schema };
