"use client";

import { useRef } from "react";
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
      className="absolute inset-0 flex flex-col border-b-[0.5px] border-rule bg-paper"
      style={{ y, zIndex: index + 1 }}
    >
      {/* Top depth gradient — visible as card enters */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-[linear-gradient(to_bottom,rgba(10,10,10,0.06),transparent)]"
        aria-hidden
      />

      <div className="flex flex-shrink-0 items-start justify-between px-[var(--page-x)] pt-20 pb-5 max-md:pt-[72px]">
        <Eyebrow>
          {formatMonth(entry.publishedAt)}&nbsp;·&nbsp;
          {entry.readTime ?? "3 min"} leitura
        </Eyebrow>
        <span className="font-mono font-light text-[clamp(40px,5vw,72px)] leading-none tracking-[-0.02em] text-[rgba(10,10,10,0.1)]">
          /{String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="h-[0.5px] w-full flex-shrink-0 bg-accent" />

      <div className="grid min-h-0 flex-1 grid-cols-2 px-[var(--page-x)] max-md:grid-cols-1">
        <div className="flex flex-col justify-center gap-5 border-r-[0.5px] border-rule py-12 pr-14 max-md:border-r-0 max-md:border-b-[0.5px] max-md:py-8">
          <span className="ll-mono small-cap muted" style={{ fontSize: 10 }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="font-serif font-light text-[clamp(28px,3.6vw,58px)] leading-none tracking-[-0.025em]">
            {entry.title}
          </h3>
          <p className="ll-body max-w-[460px] leading-[1.6] text-muted">
            {entry.excerpt}
          </p>
          <LinkRule
            href={`/journal/${entry.slug}`}
            style={{ marginTop: 32, display: "inline-flex" }}
          >
            Ler entrada
          </LinkRule>
        </div>

        <div className="flex items-center justify-center overflow-hidden py-12 pl-14 [&>*]:w-full [&>*]:max-w-[300px] max-md:justify-start max-md:py-8 max-md:[&>*]:max-w-[240px]">
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
    <section className="border-b-[0.5px] border-rule">
      <div className="border-b-[0.5px] border-rule px-[var(--page-x)] pt-20 pb-12">
        <Reveal y={0}>
          <SectionMarker>Diário · Processo</SectionMarker>
        </Reveal>
      </div>

      <div ref={trackRef} className="relative h-[300vh]">
        <div className="sticky top-0 h-[100dvh] overflow-hidden">
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
        <div className="border-t-[0.5px] border-rule px-[var(--page-x)] py-10">
          <LinkRule href="/journal">Ler todos os diários</LinkRule>
        </div>
      </Reveal>
    </section>
  );
}
