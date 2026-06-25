import { getDb, schema } from '@/lib/db';
import { asc } from 'drizzle-orm';
import type { Client } from '@/features/clients/types';

/**
 * Camada de dados (server-side) do módulo global de clientes. Lê a tabela
 * `clients` na ordem definida no admin e devolve a forma leve usada pela Home
 * e pela página Sobre. Falha graciosa: devolve [] se o BD não responder.
 */
export async function getClients(): Promise<Client[]> {
  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(schema.clients)
      .orderBy(asc(schema.clients.sortOrder));
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      year: r.year,
      category: r.category,
      imageUrl: r.imageUrl,
      instagramUrl: r.instagramUrl,
    }));
  } catch {
    return [];
  }
}
