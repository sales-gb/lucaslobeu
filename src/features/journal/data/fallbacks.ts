import type { JournalEntry } from "@/lib/db/schema";

export const FALLBACK_ENTRIES: JournalEntry[] = [
  {
    id: "1",
    slug: "sobre-o-caderno",
    title: "Sobre o caderno que precede a câmera",
    excerpt:
      "Toda imagem boa tem um peso antes de ter uma forma. Isso é o que tento capturar aqui.",
    content: "",
    readTime: "4 min",
    publishedAt: "2026-03-15",
    createdAt: "2026-03-15",
    imageId: null,
  },
  {
    id: "2",
    slug: "luz-natural-inverno",
    title: "O que a luz natural de inverno ensina",
    excerpt:
      "Fotografar no inverno paulistano tem uma qualidade que nenhum estúdio consegue replicar.",
    content: "",
    readTime: "3 min",
    publishedAt: "2026-02-08",
    createdAt: "2026-02-08",
    imageId: null,
  },
  {
    id: "3",
    slug: "metodo-editorial",
    title: "Por que todo projeto começa por um briefing editorial",
    excerpt:
      "Antes de qualquer câmera ligada, o projeto precisa existir em palavras.",
    content: "",
    readTime: "6 min",
    publishedAt: "2026-01-22",
    createdAt: "2026-01-22",
    imageId: null,
  },
];
