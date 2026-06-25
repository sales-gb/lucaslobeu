import type {
  StatItem,
  TestimonialItem,
  FaqItem,
} from "@/features/home/types";
import type { Client } from "@/features/clients/types";

// ─── Textos default das seções (usados quando o CMS não traz valor) ──────────
export const DEFAULT_HERO_ROLES = "Filmmaker · Photographer · Social";
export const DEFAULT_HERO_DESC =
  "Diretor audiovisual e fotógrafo. Narrativas visuais que movem marcas, produtos e pessoas.";
export const DEFAULT_ABOUT_STMT =
  "DIRETOR AUDIOVISUAL E FOTÓGRAFO DE SÃO PAULO. CRIO IMAGENS CLARAS, IMPACTANTES E AUTÊNTICAS PARA MARCAS E FUNDADORES — TRABALHOS QUE PARECEM CERTOS, FUNCIONAM BEM E DURAM.";
export const DEFAULT_ABOUT_FOOT =
  "O TRABALHO NÃO É SÓ BONITO — ELE PERFORMA. ISSO É O QUE ESTÁ POR TRÁS DE CADA IMAGEM.";
export const DEFAULT_CTA_HEAD = "Tem um projeto?";
export const DEFAULT_CTA_SUB =
  "O estúdio aceita três a quatro projetos por trimestre.";

export const DEFAULT_STATS: StatItem[] = [
  {
    val: "72+",
    label: "Projetos realizados",
    desc: "Campanhas, editoriais e filmes para marcas em 8 países.",
  },
  {
    val: "8",
    label: "Países atendidos",
    desc: "Produção em campo, do Brasil para o mundo.",
  },
  {
    val: "3–4",
    label: "Projetos por trimestre",
    desc: "Capacidade selecionada para máxima qualidade.",
  },
  {
    val: "2019",
    label: "Ano de fundação",
    desc: "Seis anos construindo referências visuais.",
  },
];

export const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    quote:
      "Lucas tem uma sensibilidade rara para transformar briefings complexos em imagens que realmente comunicam. O resultado superou todas as nossas expectativas.",
    name: "Ana Cavalcanti",
    role: "Head de Marketing",
    company: "Studio Branding Co.",
  },
  {
    quote:
      "Trabalhar com o estúdio foi diferente de tudo que já fizemos. A metodologia editorial deles garante que cada frame tenha propósito.",
    name: "Rafael Moura",
    role: "Diretor Criativo",
    company: "Agência Forma",
  },
  {
    quote:
      "Entregaram antes do prazo, dentro do budget, e o conteúdo ainda gera engajamento seis meses depois da campanha. Parceria contínua garantida.",
    name: "Beatriz Lemos",
    role: "CEO",
    company: "Marca Premium Ltda.",
  },
];

export const DEFAULT_FAQ: FaqItem[] = [
  {
    q: "Como funciona o processo de contratação?",
    a: "Começamos com uma conversa de descoberta de 30 minutos para entender seu projeto. Em seguida, enviamos uma proposta detalhada com escopo, timeline e investimento. Após aprovação, iniciamos com o briefing editorial.",
  },
  {
    q: "Qual o prazo médio de um projeto?",
    a: "Projetos de foto editorial levam entre 2 e 4 semanas da aprovação ao entregável final. Produções audiovisuais variam de 4 a 10 semanas, dependendo da complexidade.",
  },
  {
    q: "O estúdio trabalha com clientes fora de São Paulo?",
    a: "Sim. Já produzimos em 8 países e atendemos clientes remotamente em todo o Brasil. Custos de deslocamento são incluídos no orçamento quando aplicável.",
  },
  {
    q: "É possível contratar apenas fotografia ou apenas audiovisual?",
    a: "Sim. Trabalhamos tanto com projetos isolados quanto com contratos mensais de produção de conteúdo. O escopo é sempre definido conforme sua necessidade.",
  },
  {
    q: "Como vocês garantem que o resultado vai refletir nossa marca?",
    a: "A metodologia editorial começa por imersão na marca antes de qualquer câmera ser acionada. Desenvolvemos um moodboard e brief visual aprovado por você antes do início da produção.",
  },
];

export const DEFAULT_CLIENTS: Client[] = [
  { id: "d1", name: "Studio Branding Co.", year: "2025", category: "Branding", imageUrl: "", instagramUrl: "" },
  { id: "d2", name: "Agência Forma", year: "2025", category: "Agência", imageUrl: "", instagramUrl: "" },
  { id: "d3", name: "Marca Premium", year: "2024", category: "Varejo", imageUrl: "", instagramUrl: "" },
  { id: "d4", name: "Coletivo Visual", year: "2024", category: "Arte", imageUrl: "", instagramUrl: "" },
  { id: "d5", name: "Grupo Mídia SP", year: "2023", category: "Mídia", imageUrl: "", instagramUrl: "" },
  { id: "d6", name: "Tech Forward", year: "2023", category: "Tech", imageUrl: "", instagramUrl: "" },
  { id: "d7", name: "Visão Criativa", year: "2022", category: "Estúdio", imageUrl: "", instagramUrl: "" },
  { id: "d8", name: "Arte & Forma", year: "2021", category: "Design", imageUrl: "", instagramUrl: "" },
];
