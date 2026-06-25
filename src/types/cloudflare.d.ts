// Tipos mínimos da Cloudflare para este app.
//
// Evitamos `@cloudflare/workers-types` / `wrangler types` completos de propósito:
// eles declaram globais (fetch, Response, etc.) que conflitam com a lib DOM dos
// componentes client. Aqui declaramos só o necessário — os bindings do worker e
// um shim enxuto do D1 (R2Bucket vive em src/lib/storage/r2.ts).

declare global {
  // Augmenta o env do OpenNext com os bindings/vars deste projeto.
  interface CloudflareEnv {
    DB?: D1Database;
    MEDIA_BUCKET?: R2Bucket;
    R2_PUBLIC_URL?: string;
    NEXTAUTH_URL?: string;
    NEXTAUTH_SECRET?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
  }

  // Shim do D1 (suficiente para o driver drizzle-orm/d1; skipLibCheck cobre o resto).
  interface D1Database {
    prepare(query: string): unknown;
    batch(statements: unknown[]): Promise<unknown>;
    exec(query: string): Promise<unknown>;
    dump(): Promise<ArrayBuffer>;
  }
}

export {};
