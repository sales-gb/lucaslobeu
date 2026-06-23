import type { Project } from "@/lib/db/schema";

export const FALLBACK_PROJECTS: Project[] = [
  { id: '1', slug: 'editorial-sp', title: 'Editorial SP', client: 'Marca A', year: '2025', category: 'Foto', role: 'Dir. Foto', summary: 'Uma coleção de imagens editoriais.', coverTone: 'mid', coverKind: 'tall', template: 'editorial', status: 'published', sortOrder: 0, body: '[]', credits: '[]', coverImageId: null, coverHoverImageId: null, metaTitle: null, metaDescription: null, createdAt: '', updatedAt: '' },
  { id: '2', slug: 'campanha-verao', title: 'Campanha Verão', client: 'Marca B', year: '2025', category: 'Filme', role: 'Direção', summary: 'Campanha audiovisual completa.', coverTone: 'dark', coverKind: 'wide', template: 'gallery', status: 'published', sortOrder: 1, body: '[]', credits: '[]', coverImageId: null, coverHoverImageId: null, metaTitle: null, metaDescription: null, createdAt: '', updatedAt: '' },
  { id: '3', slug: 'social-first', title: 'Social First', client: 'Marca C', year: '2024', category: 'Social', role: 'Produção', summary: 'Estratégia e conteúdo para redes.', coverTone: 'light', coverKind: 'square', template: 'editorial', status: 'published', sortOrder: 2, body: '[]', credits: '[]', coverImageId: null, coverHoverImageId: null, metaTitle: null, metaDescription: null, createdAt: '', updatedAt: '' },
];
