"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionMarker } from "@/components/ui/section-marker";
import { DEFAULT_TESTIMONIALS } from "@/features/home/data/fallbacks";
import type { TestimonialItem } from "@/features/home/types";

// ─── Feedback card · scroll-driven ───────────────────────────────
// Cada card sobe do rodapé, cruza o centro da tela (passando POR CIMA do
// título fixo) e sai pelo topo, conforme o progresso de scroll da seção.
function FeedbackCard({
  item,
  index,
  total,
  progress,
}: {
  item: TestimonialItem;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const span = 1 / total;
  // framer-motion usa WAAPI para opacity/transform: os offsets precisam ficar
  // dentro de [0,1] e não-decrescentes — por isso clampamos cada ponto.
  const c01 = (n: number) => Math.min(1, Math.max(0, n));

  // Trajetória vertical: entra de baixo (+62vh) e sai por cima (-62vh).
  const y = useTransform(
    progress,
    [c01(start - span * 0.55), c01(end + span * 0.15)],
    ["62vh", "-62vh"],
  );
  // Surge e desaparece nas bordas da janela.
  const opacity = useTransform(
    progress,
    [
      c01(start - span * 0.5),
      c01(start - span * 0.12),
      c01(end - span * 0.25),
      c01(end + span * 0.05),
    ],
    [0, 1, 1, 0],
  );

  // Alterna lados para criar um ritmo editorial.
  const side =
    index % 3 === 0
      ? "justify-center"
      : index % 3 === 1
        ? "justify-start md:pl-[8vw]"
        : "justify-end md:pr-[8vw]";

  return (
    <motion.div
      style={{ y, opacity }}
      className={`absolute inset-0 flex h-screen items-center px-[var(--page-x)] ${side}`}
    >
      <figure className="w-full max-w-[560px] rounded-[4px] border-[0.5px] border-paper/15 bg-ink-soft p-8 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.75)] md:p-10">
        <span className="mb-3 block font-serif text-[72px] leading-[0.4] text-accent">
          &ldquo;
        </span>
        <blockquote className="mb-7 font-sans font-light text-[clamp(18px,2vw,28px)] leading-[1.3] tracking-[-0.01em] text-paper">
          {item.quote}
        </blockquote>
        <figcaption className="flex items-end justify-between gap-4 border-t-[0.5px] border-paper/12 pt-5">
          <div className="flex flex-col gap-1">
            <span className="font-sans text-[14px] text-paper">{item.name}</span>
            <Eyebrow>
              {item.role} · {item.company}
            </Eyebrow>
          </div>
          <span className="font-mono text-[11px] tracking-[0.14em] text-paper/35">
            {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
          </span>
        </figcaption>
      </figure>
    </motion.div>
  );
}

export function TestimonialsSection({
  testimonials,
}: {
  testimonials: TestimonialItem[];
}) {
  const TESTIMONIALS =
    testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS;
  const total = TESTIMONIALS.length;

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Sutil vida no título conforme rola (escala/opacidade leves).
  const titleScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.04, 1]);
  const titleOpacity = useTransform(
    scrollYProgress,
    [0, 0.08, 0.92, 1],
    [0.45, 1, 1, 0.45],
  );
  const railScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-ink text-paper"
      style={{ height: `${100 + total * 78}vh` }}
    >
      {/* Viewport fixado durante toda a seção. */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* z-1 · Título fixo ao centro — os cards passam por cima dele. */}
        <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center px-[var(--page-x)] text-center">
          <SectionMarker tone="light" style={{ marginBottom: 28 }}>
            O que dizem
          </SectionMarker>
          <motion.h2
            style={{ scale: titleScale, opacity: titleOpacity }}
            className="font-serif font-light text-[clamp(48px,9vw,150px)] leading-[0.9] tracking-[-0.03em] text-paper"
          >
            Feedbacks
          </motion.h2>
          <motion.p
            style={{ opacity: titleOpacity }}
            className="mt-6 max-w-[320px] font-mono text-[11px] uppercase leading-[2] tracking-[0.18em] text-paper/40"
          >
            O que clientes e parceiros dizem sobre o trabalho.
          </motion.p>
        </div>

        {/* z-2 · Camada dos cards, sobreposta ao título. */}
        <div className="absolute inset-0 z-[2]">
          {TESTIMONIALS.map((item, i) => (
            <FeedbackCard
              key={i}
              item={item}
              index={i}
              total={total}
              progress={scrollYProgress}
            />
          ))}
        </div>

        {/* z-3 · Trilho de progresso. */}
        <div className="absolute inset-y-0 right-0 z-[3] flex items-center px-[var(--page-x)] max-md:hidden">
          <div className="relative h-[140px] w-[1px] bg-paper/15">
            <motion.div
              style={{ scaleY: railScale }}
              className="absolute inset-0 origin-top bg-accent"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
