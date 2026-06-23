"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import Reveal from "@/components/ui/reveal";
import ImageBlock from "@/components/ui/image-block";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionMarker } from "@/components/ui/section-marker";
import { LinkRule } from "@/components/ui/link-rule";
import { FALLBACK_JOURNAL } from "@/features/home/data/fallbacks";
import type { JournalEntry } from "@/features/home/types";

const TONES: Array<"light" | "mid" | "dark"> = ["light", "mid", "dark"];

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
        <Eyebrow>
          {formatMonth(entry.publishedAt)}&nbsp;·&nbsp;
          {entry.readTime ?? "3 min"} leitura
        </Eyebrow>
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
          <LinkRule
            href={`/journal/${entry.slug}`}
            style={{ marginTop: 32, display: "inline-flex" }}
          >
            Ler entrada
          </LinkRule>
        </div>

        <div className="ll-h3-jsc-image">
          <ImageBlock tone={entry.tone} ratio="3/4" />
        </div>
      </div>
    </motion.div>
  );
}

export function JournalSection({
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
          <SectionMarker>Diário · Processo</SectionMarker>
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
          <LinkRule href="/journal">Ler todos os diários</LinkRule>
        </div>
      </Reveal>
    </section>
  );
}
