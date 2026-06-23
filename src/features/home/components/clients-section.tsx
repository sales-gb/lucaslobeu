"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "@/components/ui/reveal";
import ImageBlock from "@/components/ui/image-block";
import { SectionMarker } from "@/components/ui/section-marker";
import { cn } from "@/lib/utils/cn";
import { DEFAULT_CLIENTS } from "@/features/home/data/fallbacks";
import { EASE_OUT } from "@/features/home/constants";
import type { ClientItem } from "@/features/home/types";

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

export function ClientsSection({ clients }: { clients: ClientItem[] }) {
  const CLIENTS = clients.length > 0 ? clients : DEFAULT_CLIENTS;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="overflow-hidden border-y-[0.5px] border-rule">
      {/* ── Header: título (esq) · descrição (dir, alinhada ao inferior) ── */}
      <div className="flex items-end justify-between px-[var(--page-x)] pt-20 pb-10 max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-8 max-[900px]:py-[60px]">
        <div>
          <Reveal y={0}>
            <SectionMarker style={{ marginBottom: 40 }}>
              Clientes ({String(CLIENTS.length).padStart(2, "0")})
            </SectionMarker>
          </Reveal>
          <Reveal y={24} delay={60}>
            <h2 className="font-serif font-bold text-[clamp(38px,5.2vw,82px)] leading-none tracking-[-0.03em]">
              <span className="block font-light text-[rgba(10,10,10,0.22)]">
                MARCAS
              </span>
              COM QUE
              <br />
              TRABALHEI
            </h2>
          </Reveal>
        </div>

        <div>
          <Reveal y={0} delay={80}>
            <p className="max-w-[50%] justify-self-end font-mono text-[10px] uppercase leading-[2.1] tracking-[0.05em] text-muted max-[900px]:max-w-full">
              COLABORO COM EMPRESAS QUE SE IMPORTAM COM PRESENÇA DIGITAL
              CUIDADOSA. CADA PROJETO É MOLDADO ATRAVÉS DE COMPREENSÃO,
              REFINAMENTO E ATENÇÃO AOS DETALHES.
            </p>
          </Reveal>
        </div>
      </div>

      {/* ── Conteúdo: CTA | imagem | lista ── */}
      <div className="grid grid-cols-[1fr_1fr_2.4fr] max-[900px]:grid-cols-1">
        <div className="flex flex-col justify-end py-10 pr-12 pl-[var(--page-x)] max-[900px]:justify-start max-[900px]:px-[var(--page-x)] max-[900px]:pt-0 max-[900px]:pb-12">
          <div className="flex flex-col gap-7">
            <Reveal y={16} delay={120}>
              <p className="max-w-[320px] font-sans text-[clamp(13px,1vw,15px)] leading-[1.65] text-[rgba(10,10,10,0.65)]">
                O objetivo é sempre o mesmo:{" "}
                <strong>
                  design que comunica com clareza e deixa uma impressão
                  duradoura.
                </strong>
              </p>
            </Reveal>

            <Reveal y={12} delay={160}>
              <div className="flex items-center gap-3">
                <div className="size-9 shrink-0 overflow-hidden rounded-full bg-rule" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[11px] tracking-[0.07em] text-ink">
                    LUCAS LOBEU
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.06em] text-muted">
                    DIRETOR &amp; FOTÓGRAFO
                  </span>
                </div>
              </div>
            </Reveal>

            <Reveal y={12} delay={200}>
              <Link
                href="/contact"
                className="flex items-center justify-between border-t-[0.5px] border-rule pt-5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink no-underline transition-opacity duration-200 hover:opacity-50"
              >
                <span>Book a call</span>
                <span>→</span>
              </Link>
            </Reveal>
          </div>
        </div>

        <div className="relative overflow-hidden max-[900px]:hidden">
          <AnimatePresence mode="wait">
            {hoveredIndex !== null && (
              <motion.div
                key={hoveredIndex}
                className="absolute left-1/2 top-1/2 aspect-[4/5] w-[clamp(140px,15vw,220px)] -translate-x-1/2 -translate-y-1/2 [&>*]:!h-full [&>*]:!w-full"
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

        <div className="flex flex-col justify-start py-10 pr-[var(--page-x)] pl-12 max-[900px]:justify-start max-[900px]:px-[var(--page-x)] max-[900px]:pt-0 max-[900px]:pb-[60px]">
          <div className="flex flex-col">
            {CLIENTS.map((client, i) => (
              <Reveal key={i} y={12} delay={i * 40}>
                <div
                  className={cn(
                    "flex items-center justify-between border-t-[0.5px] border-rule py-[13px] transition-opacity duration-[250ms] first:border-t-0 last:border-b-[0.5px]",
                    hoveredIndex !== null && hoveredIndex !== i && "opacity-20",
                  )}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <span className="font-sans font-bold text-[clamp(12px,1.05vw,16px)] uppercase tracking-[-0.01em]">
                    {client.name}
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.04em] text-muted">
                    {client.category}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
