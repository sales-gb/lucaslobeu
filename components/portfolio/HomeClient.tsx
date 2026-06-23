"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  type MotionValue,
} from "framer-motion";
import Reveal from "./Reveal";
import TextReveal from "./TextReveal";
import ImageBlock from "./ImageBlock";
import Marquee from "./Marquee";
import type { Project } from "@/lib/db/schema";

export type StatItem = { val: string; label: string; desc: string };
export type TestimonialItem = {
  quote: string;
  name: string;
  role: string;
  company: string;
};
export type FaqItem = { q: string; a: string };
export type ClientItem = { name: string; category: string };
export type JournalEntry = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  readTime: string | null;
  publishedAt: string;
};

interface Props {
  projects: Project[];
  journalEntries?: JournalEntry[];
  heroRoles?: string | null;
  heroDescription?: string | null;
  aboutStatement?: string | null;
  aboutFooterHeadline?: string | null;
  manifestoText?: string | null;
  ctaHeadline?: string | null;
  ctaSub?: string | null;
  stats?: StatItem[];
  testimonials?: TestimonialItem[];
  faqItems?: FaqItem[];
  clients?: ClientItem[];
  showcaseImageUrl?: string | null;
  aboutPortraitUrl?: string | null;
  aboutFooterImageUrl?: string | null;
}

// ─── Ease tokens ─────────────────────────────────────────────
const EASE_OUT = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ─── HERO ─────────────────────────────────────────────────────
function HeroSection({
  roles,
  description,
}: {
  roles: string;
  description: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <section className="ll-h3-hero" ref={ref}>
      <motion.div className="ll-h3-hero-title-block" style={{ y: titleY }}>
        <Reveal y={8} delay={0}>
          <p className="ll-h3-hero-roles">{roles}</p>
        </Reveal>
        <TextReveal
          text="Lucas"
          as="h1"
          className="ll-h3-hero-name ll-h3-hero-name--first"
          delay={80}
          stagger={0.06}
          splitBy="char"
        />
        <TextReveal
          text="Lobeu."
          as="h1"
          className="ll-h3-hero-name ll-h3-hero-name--last"
          delay={240}
          stagger={0.06}
          splitBy="char"
        />
        <Reveal y={12} delay={600}>
          <p className="ll-h3-hero-desc">{description}</p>
        </Reveal>
      </motion.div>

      <div className="ll-h3-hero-bottom">
        <Reveal y={8} delay={720}>
          <div className="ll-h3-hero-actions">
            <Link href="/projects" className="ll-btn-outline">
              Ver projetos
            </Link>
            <Link href="/contact" className="ll-link-rule">
              Falar sobre um projeto <span>→</span>
            </Link>
          </div>
        </Reveal>
      </div>

      <motion.div
        className="ll-h3-scroll-line"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 1, duration: 1.4, ease: EASE_OUT }}
      />
    </section>
  );
}

// ─── ABOUT · eliankent-style ──────────────────────────────────
function AboutWord({
  word,
  index,
  total,
  scrollYProgress,
}: {
  word: string;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  // Finish the full reveal at 55% of the section scroll so the text is
  // already complete when the user approaches the bottom — no race to the end.
  const pct = (index / total) * 0.35;
  const opacity = useTransform(
    scrollYProgress,
    [Math.max(0, pct - 0.008), Math.min(1, pct + 0.02)],
    [0, 1],
  );
  return (
    <motion.span className="ll-ek-word" style={{ opacity }}>
      {word}{" "}
    </motion.span>
  );
}

function AboutSection({
  statement,
  footerHeadline,
  portraitUrl,
  footerImageUrl,
}: {
  statement: string;
  footerHeadline: string;
  portraitUrl?: string;
  footerImageUrl?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 1", "end 0"],
  });

  const words = statement.split(" ");

  return (
    <section className="ll-ek-about" ref={ref}>
      <span className="ll-crosshair ll-crosshair--tl" aria-hidden />
      <span className="ll-crosshair ll-crosshair--tr" aria-hidden />

      {/* 4-col grid: text cols 1-2, col 3 empty, portrait col 4 */}
      <div className="ll-ek-about-inner">
        <div className="ll-ek-about-text">
          <div className="ll-section-marker" style={{ marginBottom: 40 }}>
            <span className="ll-accent-dot" />
            <span
              className="ll-eyebrow"
              style={{ color: "rgba(244,241,234,.5)" }}
            >
              Sobre
            </span>
          </div>
          <p className="ll-ek-about-statement">
            {words.map((word, i) => (
              <AboutWord
                key={i}
                word={word}
                index={i}
                total={words.length}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </p>
        </div>

        {/* Col 4: sticky portrait + caption text below */}
        <div className="ll-ek-about-col4">
          <div className="ll-ek-about-portrait">
            <ImageBlock
              tone="dark"
              ratio="3/4"
              style={{ height: "100%" }}
              src={portraitUrl || undefined}
            />
          </div>
          <div className="ll-ek-about-portrait-caption">
            <span
              className="ll-eyebrow"
              style={{
                display: "block",
                marginBottom: 6,
                color: "rgba(244,241,234,.6)",
              }}
            >
              Lucas Lobeu
            </span>
            <span
              className="ll-mono small-cap"
              style={{ fontSize: 10, color: "rgba(244,241,234,.38)" }}
            >
              São Paulo · Diretor & Fotógrafo
            </span>
          </div>
        </div>
      </div>

      {/* Footer: cols 1-2 image, cols 3-4 tagline */}
      <div className="ll-ek-about-footer">
        <div className="ll-ek-about-footer-img">
          <ImageBlock
            tone="mid"
            ratio="4/5"
            style={{ height: "100%" }}
            src={footerImageUrl || undefined}
          />
        </div>
        <div className="ll-ek-about-footer-copy">
          <div className="ll-section-marker" style={{ marginBottom: 24 }}>
            <span className="ll-accent-dot" />
            <span
              className="ll-eyebrow"
              style={{ color: "rgba(244,241,234,.5)" }}
            >
              Resultado
            </span>
          </div>
          <p className="ll-ek-about-footer-headline">{footerHeadline}</p>
        </div>
      </div>
    </section>
  );
}

const DEFAULT_STATS: StatItem[] = [
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

// ─── STATS · eliankent-style staggered ────────────────────────
function StatsSection({ stats }: { stats: StatItem[] }) {
  const STATS = stats.length > 0 ? stats : DEFAULT_STATS;

  return (
    <div className="ll-ek-stats">
      {STATS.map((s, i) => (
        <Reveal key={s.label} y={24} delay={i * 100}>
          <div className="ll-ek-stat">
            <span className="ll-ek-stat-dots">• • •</span>
            <span className="ll-ek-stat-val">{s.val}</span>
            <span className="ll-ek-stat-label">{s.label}</span>
            <p className="ll-ek-stat-desc">{s.desc}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

// ─── SHOWCASE · scroll reveal ─────────────────────────────────
function ShowcaseLetter({
  letter,
  index,
  scrollYProgress,
}: {
  letter: string;
  index: number;
  scrollYProgress: MotionValue<number>;
}) {
  const opacity = useTransform(
    scrollYProgress,
    [(index / 8) * 0.3, (index / 8) * 0.3 + 0.08],
    [0, 1],
  );
  return (
    <motion.span className="ll-h3-showcase-letter" style={{ opacity }}>
      {letter}
    </motion.span>
  );
}

// ─── SELECTED WORKS · bubble/reveal cards ────────────────────
const SW_TONES: Record<"dark" | "mid" | "light", string> = {
  dark: "repeating-linear-gradient(135deg, #1A1A1A 0px, #1A1A1A 2px, #0A0A0A 2px, #0A0A0A 12px)",
  mid: "repeating-linear-gradient(135deg, #9C9183 0px, #9C9183 2px, #8A7F72 2px, #8A7F72 12px)",
  light:
    "repeating-linear-gradient(135deg, #E9E3D5 0px, #E9E3D5 2px, #DDD7C8 2px, #DDD7C8 12px)",
};

function SwCard({
  project,
  previewTone = "dark",
}: {
  project: Project;
  previewTone?: "dark" | "mid" | "light";
}) {
  const imgRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const getPercent = (e: React.MouseEvent) => {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 50, y: 50 };
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    const { x, y } = getPercent(e);
    const p = previewRef.current;
    if (!p) return;
    p.style.transition = "none";
    p.style.clipPath = `circle(0% at ${x}% ${y}%)`;
    void p.offsetWidth; // force reflow for transition to kick in
    p.style.transition = "clip-path 0.55s cubic-bezier(0.22, 1, 0.36, 1)";
    p.style.clipPath = `circle(150% at ${x}% ${y}%)`;
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    const { x, y } = getPercent(e);
    const p = previewRef.current;
    if (!p) return;
    p.style.transition = "clip-path 0.45s cubic-bezier(0.22, 1, 0.36, 1)";
    p.style.clipPath = `circle(0% at ${x}% ${y}%)`;
  };

  const coverTone = (project.coverTone as "dark" | "mid" | "light") ?? "mid";

  return (
    <Link href={`/projects/${project.slug}`} className="ll-sw-card-link">
      <div className="ll-sw-card">
        <div
          ref={imgRef}
          className="ll-sw-card-image"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <ImageBlock tone={coverTone} ratio="4/3" />
          <div
            ref={previewRef}
            className="ll-sw-card-preview"
            style={{ background: SW_TONES[previewTone] }}
          />
        </div>
        <div className="ll-sw-card-meta">
          <span className="ll-eyebrow muted">
            {project.category} · {project.year}
          </span>
          <h3 className="ll-sw-card-name">{project.title}</h3>
          <span className="ll-mono small-cap muted" style={{ fontSize: 11 }}>
            {project.client}
          </span>
        </div>
      </div>
    </Link>
  );
}

function SelectedWorksSection({ projects }: { projects: Project[] }) {
  const [proj1, proj2, proj3] = projects;

  return (
    <section className="ll-sw">
      {/* Header: title cols 1–2, description col 4 */}
      <div className="ll-sw-header">
        <div className="ll-sw-header-title">
          <Reveal y={0}>
            <div className="ll-section-marker" style={{ marginBottom: 24 }}>
              <span className="ll-accent-dot" />
              <span className="ll-eyebrow">Trabalhos selecionados</span>
            </div>
          </Reveal>
          <Reveal y={20} delay={60}>
            <h2 className="ll-sw-title">
              Uma coleção
              <br />
              de experiências
              <br />
              digitais refinadas
            </h2>
          </Reveal>
        </div>
        <div className="ll-sw-header-desc">
          <Reveal y={16} delay={120}>
            <p className="ll-sw-desc">
              Cada projeto aqui foi moldado com intenção — do layout e
              tipografia à interação e tom.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Cards: row 1 centered (cols 2–3), row 2 offset (col 1 + cols 3–4) */}
      <div className="ll-sw-projects">
        {proj1 && (
          <Reveal y={28} delay={0} className="ll-sw-proj-center">
            <SwCard project={proj1} previewTone="light" />
          </Reveal>
        )}
        {proj2 && (
          <Reveal y={28} delay={80} className="ll-sw-proj-left">
            <SwCard project={proj2} previewTone="dark" />
          </Reveal>
        )}
        {proj3 && (
          <Reveal y={28} delay={160} className="ll-sw-proj-right">
            <SwCard project={proj3} previewTone="mid" />
          </Reveal>
        )}
      </div>

      {/* Footer: text cols 1–2, CTA button col 4 */}
      <div className="ll-sw-footer">
        <div className="ll-sw-footer-text">
          <Reveal y={12}>
            <p
              className="ll-body"
              style={{ color: "var(--muted)", maxWidth: 360 }}
            >
              Cada projeto conta uma história. Veja o quadro completo.
            </p>
          </Reveal>
        </div>
        <div className="ll-sw-footer-btn">
          <Reveal y={12} delay={80}>
            <Link
              href="/projects"
              className="ll-btn-outline"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Ver todos os trabalhos →
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
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

// ─── TESTIMONIALS ─────────────────────────────────────────────
function TestimonialsSection({
  testimonials,
}: {
  testimonials: TestimonialItem[];
}) {
  const TESTIMONIALS =
    testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS;
  const [active, setActive] = useState(0);

  return (
    <section className="ll-h3-testimonials">
      <div className="ll-h3-testimonials-inner">
        <Reveal y={0}>
          <div className="ll-section-marker" style={{ marginBottom: 48 }}>
            <span className="ll-accent-dot" />
            <span className="ll-eyebrow">O que dizem</span>
          </div>
        </Reveal>

        <div className="ll-h3-test-layout">
          {/* Quote display */}
          <div className="ll-h3-test-quote-wrap">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
                className="ll-h3-test-quote"
              >
                <span className="ll-h3-test-mark">"</span>
                <blockquote className="ll-h3-test-text">
                  {TESTIMONIALS[active].quote}
                </blockquote>
                <div className="ll-h3-test-author">
                  <span className="ll-h3-test-name">
                    {TESTIMONIALS[active].name}
                  </span>
                  <span className="ll-eyebrow muted">
                    {TESTIMONIALS[active].role} · {TESTIMONIALS[active].company}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Selector */}
          <div className="ll-h3-test-selector">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={i}
                className={`ll-h3-test-item${active === i ? " is-active" : ""}`}
                onClick={() => setActive(i)}
              >
                <motion.div
                  className="ll-h3-test-item-line"
                  animate={{ scaleX: active === i ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                />
                <div className="ll-h3-test-item-info">
                  <span className="ll-h3-test-item-name">{t.name}</span>
                  <span className="ll-eyebrow muted">{t.company}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const DEFAULT_FAQ: FaqItem[] = [
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

// ─── FAQ ──────────────────────────────────────────────────────
function FaqItem({ item, index }: { item: FaqItem; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="ll-h3-faq-item">
      <button className="ll-h3-faq-trigger" onClick={() => setOpen(!open)}>
        <span className="ll-mono small-cap muted" style={{ fontSize: 10 }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="ll-h3-faq-question">{item.q}</span>
        <motion.span
          className="ll-h3-faq-icon"
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
        >
          +
        </motion.span>
      </button>

      {/* Grid row trick — animates height without page jump */}
      <div className={`ll-h3-faq-body${open ? " is-open" : ""}`}>
        <div className="ll-h3-faq-answer">
          <p
            className="ll-body"
            style={{ padding: "16px 0 24px", maxWidth: 640 }}
          >
            {item.a}
          </p>
        </div>
      </div>
    </div>
  );
}

function FaqSection({ faqItems }: { faqItems: FaqItem[] }) {
  const items = faqItems.length > 0 ? faqItems : DEFAULT_FAQ;
  return (
    <section className="ll-h3-faq">
      <div className="ll-h3-faq-inner">
        <div className="ll-h3-faq-head">
          <Reveal y={0}>
            <div className="ll-section-marker" style={{ marginBottom: 16 }}>
              <span className="ll-accent-dot" />
              <span className="ll-eyebrow">Perguntas frequentes</span>
            </div>
          </Reveal>
          <Reveal y={24} delay={60}>
            <TextReveal
              text="Tudo o que você precisa saber."
              as="h2"
              className="ll-h3-faq-title"
              stagger={0.03}
            />
          </Reveal>
        </div>

        <div className="ll-h3-faq-list">
          {items.map((item, i) => (
            <Reveal key={i} y={12} delay={i * 40}>
              <FaqItem item={item} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CLIENTS ──────────────────────────────────────────────────
const DEFAULT_CLIENTS: ClientItem[] = [
  { name: "Studio Branding Co.", category: "2025/" },
  { name: "Agência Forma", category: "2025/" },
  { name: "Marca Premium", category: "2024/" },
  { name: "Coletivo Visual", category: "2024/" },
  { name: "Grupo Mídia SP", category: "2023/" },
  { name: "Tech Forward", category: "2023/" },
  { name: "Visão Criativa", category: "2022/" },
  { name: "Arte & Forma", category: "2021/" },
];

const CLIENT_TONES: Array<"dark" | "mid" | "light"> = [
  "mid",
  "light",
  "dark",
  "mid",
  "light",
  "dark",
  "mid",
  "light",
];

function ClientsSection({ clients }: { clients: ClientItem[] }) {
  const CLIENTS = clients.length > 0 ? clients : DEFAULT_CLIENTS;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="ll-h3-clients">
      {/* ── Header: título (esq) · descrição (dir, alinhada ao inferior) ── */}
      <div className="ll-h3-clients-header">
        <div className="ll-h3-clients-title-block">
          <Reveal y={0}>
            <div className="ll-section-marker" style={{ marginBottom: 40 }}>
              <span className="ll-accent-dot" />
              <span className="ll-eyebrow">
                Clientes ({String(CLIENTS.length).padStart(2, "0")})
              </span>
            </div>
          </Reveal>
          <Reveal y={24} delay={60}>
            <h2 className="ll-h3-clients-headline">
              <span className="ll-h3-clients-headline-muted">MARCAS</span>
              COM QUE
              <br />
              TRABALHEI
            </h2>
          </Reveal>
        </div>

        <div className="ll-h3-clients-desc-zone">
          <Reveal y={0} delay={80}>
            <p className="ll-h3-clients-right-desc">
              COLABORO COM EMPRESAS QUE SE IMPORTAM COM PRESENÇA DIGITAL
              CUIDADOSA. CADA PROJETO É MOLDADO ATRAVÉS DE COMPREENSÃO,
              REFINAMENTO E ATENÇÃO AOS DETALHES.
            </p>
          </Reveal>
        </div>
      </div>

      {/* ── Conteúdo: CTA | imagem | lista ── */}
      <div className="ll-h3-clients-content">
        <div className="ll-h3-clients-col1-lower">
          <div className="ll-h3-clients-cta-block">
            <Reveal y={16} delay={120}>
              <p className="ll-h3-clients-desc">
                O objetivo é sempre o mesmo:{" "}
                <strong>
                  design que comunica com clareza e deixa uma impressão
                  duradoura.
                </strong>
              </p>
            </Reveal>

            <Reveal y={12} delay={160}>
              <div className="ll-h3-clients-person">
                <div className="ll-h3-clients-avatar" />
                <div className="ll-h3-clients-person-info">
                  <span className="ll-h3-clients-person-name">LUCAS LOBEU</span>
                  <span className="ll-h3-clients-person-role">
                    DIRETOR &amp; FOTÓGRAFO
                  </span>
                </div>
              </div>
            </Reveal>

            <Reveal y={12} delay={200}>
              <Link href="/contact" className="ll-h3-clients-cta-btn">
                <span>Book a call</span>
                <span>→</span>
              </Link>
            </Reveal>
          </div>
        </div>

        <div className="ll-h3-clients-img-zone">
          <AnimatePresence mode="wait">
            {hoveredIndex !== null && (
              <motion.div
                key={hoveredIndex}
                className="ll-h3-clients-image-preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: EASE_OUT }}
              >
                <ImageBlock
                  tone={CLIENT_TONES[hoveredIndex % CLIENT_TONES.length]}
                  ratio="4/5"
                  style={{ height: "100%" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="ll-h3-clients-list-zone">
          <div className="ll-h3-clients-list">
            {CLIENTS.map((client, i) => (
              <Reveal key={i} y={12} delay={i * 40}>
                <div
                  className={`ll-h3-client-row${hoveredIndex === i ? " is-hovered" : ""}`}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <span className="ll-h3-client-name">{client.name}</span>
                  <span className="ll-h3-client-year">{client.category}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── JOURNAL · sticky scroll ──────────────────────────────────
const TONES: Array<"light" | "mid" | "dark"> = ["light", "mid", "dark"];

const FALLBACK_JOURNAL: JournalEntry[] = [
  {
    id: "1",
    slug: "sobre-o-caderno",
    title: "Sobre o caderno que precede a câmera",
    excerpt:
      "Toda imagem boa tem um peso antes de ter uma forma. O planejamento editorial define tudo.",
    readTime: "4 min",
    publishedAt: "2026-03-01",
  },
  {
    id: "2",
    slug: "luz-natural-inverno",
    title: "O que a luz natural de inverno ensina",
    excerpt:
      "A qualidade da luz muda a percepção do produto. Fotografar no inverno paulistano tem nuances que nenhum estúdio replica.",
    readTime: "3 min",
    publishedAt: "2026-02-01",
  },
  {
    id: "3",
    slug: "metodo-editorial",
    title: "Por que todo projeto começa por um briefing editorial",
    excerpt:
      "Antes de qualquer câmera ligada, o projeto precisa existir em palavras. A metodologia que usamos para cada cliente.",
    readTime: "6 min",
    publishedAt: "2026-01-01",
  },
];

function formatMonth(iso: string) {
  const d = new Date(iso);
  return d
    .toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    .replace(/^\w/, (c) => c.toUpperCase());
}

type JournalCardEntry = {
  slug: string;
  title: string;
  excerpt: string;
  readTime: string | null;
  publishedAt: string;
  tone: "light" | "mid" | "dark";
};

function JournalCard({
  entry,
  index,
  total,
  scrollYProgress,
}: {
  entry: JournalCardEntry;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const slotStart = index / total;
  const entryStart = index === 0 ? 0 : slotStart - 0.12;
  const entryEnd = index === 0 ? 0 : slotStart;

  const y = useTransform(
    scrollYProgress,
    [entryStart, Math.max(entryStart + 0.001, entryEnd)],
    index === 0 ? ["0%", "0%"] : ["100%", "0%"],
  );

  return (
    <motion.div
      className="ll-h3-journal-stack-card"
      style={{ y, zIndex: index + 1 }}
    >
      {/* Top depth gradient — visible as card enters */}
      <div className="ll-h3-jsc-depth" aria-hidden />

      <div className="ll-h3-jsc-topbar">
        <span className="ll-eyebrow">
          {formatMonth(entry.publishedAt)}&nbsp;·&nbsp;
          {entry.readTime ?? "3 min"} leitura
        </span>
        <span className="ll-h3-jsc-num">
          /{String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="ll-h3-jsc-rule" />

      <div className="ll-h3-jsc-body">
        <div className="ll-h3-jsc-text">
          <span className="ll-mono small-cap muted" style={{ fontSize: 10 }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="ll-h3-jsc-title">{entry.title}</h3>
          <p className="ll-body ll-h3-jsc-excerpt">{entry.excerpt}</p>
          <Link
            href={`/journal/${entry.slug}`}
            className="ll-link-rule"
            style={{ marginTop: 32, display: "inline-flex" }}
          >
            Ler entrada <span>→</span>
          </Link>
        </div>

        <div className="ll-h3-jsc-image">
          <ImageBlock tone={entry.tone} ratio="3/4" />
        </div>
      </div>
    </motion.div>
  );
}

function JournalSection({
  journalEntries,
}: {
  journalEntries: JournalEntry[];
}) {
  const entries = (
    journalEntries.length > 0 ? journalEntries : FALLBACK_JOURNAL
  ).map((e, i) => ({
    ...e,
    tone: TONES[i % TONES.length],
  }));

  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end start"],
  });
  const total = entries.length;

  return (
    <section className="ll-h3-journal-section">
      <div className="ll-h3-journal-header">
        <Reveal y={0}>
          <div className="ll-section-marker">
            <span className="ll-accent-dot" />
            <span className="ll-eyebrow">Diário · Processo</span>
          </div>
        </Reveal>
      </div>

      <div ref={trackRef} className="ll-h3-journal-stack-track">
        <div className="ll-h3-journal-sticky-container">
          {entries.map((entry, i) => (
            <JournalCard
              key={entry.id}
              entry={entry}
              index={i}
              total={total}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>
      </div>

      <Reveal y={12}>
        <div className="ll-h3-journal-footer">
          <Link href="/journal" className="ll-link-rule">
            Ler todos os diários <span>→</span>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

// ─── MARQUEE ──────────────────────────────────────────────────
function MarqueeSection() {
  return (
    <div className="ll-h3-marquee">
      <Marquee speed={40}>
        {[
          "LOBEU",
          "·",
          "DIREÇÃO",
          "·",
          "FOTOGRAFIA",
          "·",
          "SP",
          "·",
          "LOBEU",
          "·",
          "2019—",
          "·",
        ].map((w, i) => (
          <span
            key={i}
            className={w === "·" ? "ll-marquee-sep" : "ll-marquee-word"}
          >
            {w}
          </span>
        ))}
      </Marquee>
    </div>
  );
}

// ─── CTA ──────────────────────────────────────────────────────
function CtaSection({ headline, sub }: { headline: string; sub: string }) {
  return (
    <section className="ll-h3-cta">
      <div className="ll-h3-cta-inner">
        <div className="ll-section-marker ll-section-marker--light">
          <span className="ll-accent-dot" />
          <span
            className="ll-eyebrow"
            style={{ color: "rgba(244,241,234,.5)" }}
          >
            Próximo passo
          </span>
        </div>
        <TextReveal
          text={headline}
          as="h2"
          className="ll-h3-cta-title"
          stagger={0.055}
          delay={60}
        />
        <Reveal y={20} delay={200}>
          <p className="ll-h3-cta-sub">{sub}</p>
        </Reveal>
        <Reveal y={16} delay={300}>
          <div className="ll-h3-cta-actions">
            <a href="mailto:lucas@lobeu.studio" className="ll-btn-light">
              lucas@lobeu.studio
            </a>
            <Link href="/contact" className="ll-btn-ghost-light">
              Ver disponibilidade →
            </Link>
          </div>
        </Reveal>
      </div>

      <span className="ll-crosshair ll-crosshair--tl" aria-hidden />
      <span className="ll-crosshair ll-crosshair--tr" aria-hidden />
      <span className="ll-crosshair ll-crosshair--bl" aria-hidden />
      <span className="ll-crosshair ll-crosshair--br" aria-hidden />
    </section>
  );
}

// ─── SHOWCASE INTRO · scroll-scale + SHOW/CASE split title ───
function ShowcaseIntroSection({ imageUrl }: { imageUrl?: string }) {
  const isVideo = imageUrl ? /\.mp4$/i.test(imageUrl) : false;
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // Video: grows from a small centered box to full-screen
  const videoScale = useTransform(scrollYProgress, [0, 0.82], [0.15, 1]);
  const videoBorderRadius = useTransform(scrollYProgress, [0, 0.7], [10, 0]);

  // SHOW: comes from left → natural left position (no crossing)
  const showX = useTransform(scrollYProgress, [0.06, 0.88], ["-120vw", "0vw"]);
  // CASE: comes from right → natural right position (no crossing)
  const caseX = useTransform(scrollYProgress, [0.06, 0.88], ["120vw", "0vw"]);
  // Words fade in early
  const wordOpacity = useTransform(scrollYProgress, [0.04, 0.18], [0, 1]);

  return (
    <div ref={trackRef} className="ll-sc-track">
      <div className="ll-sc-sticky">
        {/* Expanding media behind the words */}
        <motion.div
          className="ll-sc-media"
          style={{ scale: videoScale, borderRadius: videoBorderRadius }}
        >
          {isVideo ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            >
              <source src={imageUrl} type="video/mp4" />
            </video>
          ) : (
            <ImageBlock
              tone="dark"
              ratio="16/9"
              style={{ height: "100%" }}
              src={imageUrl || undefined}
            />
          )}
        </motion.div>

        {/* SHOW   CASE split title */}
        <div className="ll-sc-words" aria-label="Showcase">
          <motion.span
            className="ll-sc-word"
            style={{ x: showX, opacity: wordOpacity }}
            aria-hidden
          >
            SHOW
          </motion.span>
          <motion.span
            className="ll-sc-word"
            style={{ x: caseX, opacity: wordOpacity }}
            aria-hidden
          >
            CASE
          </motion.span>
        </div>

        {/* crosshair corners */}
        <span className="ll-crosshair ll-crosshair--tl" aria-hidden />
        <span className="ll-crosshair ll-crosshair--tr" aria-hidden />
        <span className="ll-crosshair ll-crosshair--bl" aria-hidden />
        <span className="ll-crosshair ll-crosshair--br" aria-hidden />
      </div>
    </div>
  );
}

const DEFAULT_HERO_ROLES = "Filmmaker · Photographer · Social";
const DEFAULT_HERO_DESC =
  "Diretor audiovisual e fotógrafo. Narrativas visuais que movem marcas, produtos e pessoas.";
const DEFAULT_ABOUT_STMT =
  "DIRETOR AUDIOVISUAL E FOTÓGRAFO DE SÃO PAULO. CRIO IMAGENS CLARAS, IMPACTANTES E AUTÊNTICAS PARA MARCAS E FUNDADORES — TRABALHOS QUE PARECEM CERTOS, FUNCIONAM BEM E DURAM.";
const DEFAULT_ABOUT_FOOT =
  "O TRABALHO NÃO É SÓ BONITO — ELE PERFORMA. ISSO É O QUE ESTÁ POR TRÁS DE CADA IMAGEM.";
const DEFAULT_CTA_HEAD = "Tem um projeto?";
const DEFAULT_CTA_SUB =
  "O estúdio aceita três a quatro projetos por trimestre.";

// ─── ROOT ─────────────────────────────────────────────────────
export default function HomeClient({
  projects,
  journalEntries = [],
  heroRoles,
  heroDescription,
  aboutStatement,
  aboutFooterHeadline,
  ctaHeadline,
  ctaSub,
  stats = [],
  testimonials = [],
  faqItems = [],
  clients = [],
  showcaseImageUrl,
  aboutPortraitUrl,
  aboutFooterImageUrl,
}: Props) {
  return (
    <>
      <HeroSection
        roles={heroRoles || DEFAULT_HERO_ROLES}
        description={heroDescription || DEFAULT_HERO_DESC}
      />
      <AboutSection
        statement={aboutStatement || DEFAULT_ABOUT_STMT}
        footerHeadline={aboutFooterHeadline || DEFAULT_ABOUT_FOOT}
        portraitUrl={aboutPortraitUrl || undefined}
        footerImageUrl={aboutFooterImageUrl || undefined}
      />
      <StatsSection stats={stats} />
      <ShowcaseIntroSection imageUrl={showcaseImageUrl || undefined} />
      <SelectedWorksSection projects={projects} />
      <TestimonialsSection testimonials={testimonials} />
      <ClientsSection clients={clients} />
      <FaqSection faqItems={faqItems} />
      <JournalSection journalEntries={journalEntries} />
      <MarqueeSection />
      <CtaSection
        headline={ctaHeadline || DEFAULT_CTA_HEAD}
        sub={ctaSub || DEFAULT_CTA_SUB}
      />
    </>
  );
}
