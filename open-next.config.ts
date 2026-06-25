import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// Configuração do adapter OpenNext → Cloudflare Workers.
// Padrão é suficiente para este app (sem ISR/cache externo): SSR dinâmico nas
// páginas que leem o D1, assets servidos pelo binding ASSETS.
export default defineCloudflareConfig();
