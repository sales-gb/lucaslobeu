"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "@/components/ui/reveal";
import ImageBlock from "@/components/ui/image-block";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionMarker } from "@/components/ui/section-marker";
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
    <section className="ll-h3-clients">
      {/* ── Header: título (esq) · descrição (dir, alinhada ao inferior) ── */}
      <div className="ll-h3-clients-header">
        <div className="ll-h3-clients-title-block">
          <Reveal y={0}>
            <SectionMarker style={{ marginBottom: 40 }}>
              Clientes ({String(CLIENTS.length).padStart(2, "0")})
            </SectionMarker>
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
