"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import ImageBlock from "@/components/ui/image-block";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionMarker } from "@/components/ui/section-marker";

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
    <motion.span className="inline text-paper" style={{ opacity }}>
      {word}{" "}
    </motion.span>
  );
}

export function AboutSection({
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
    <section
      className="relative bg-ink px-[var(--page-x)] pt-20 text-paper"
      ref={ref}
    >
      <span className="ll-crosshair ll-crosshair--tl" aria-hidden />
      <span className="ll-crosshair ll-crosshair--tr" aria-hidden />

      {/* 4-col grid: text cols 1-2, col 3 empty, portrait col 4 */}
      <div className="grid grid-cols-4 items-start gap-x-8 max-[900px]:grid-cols-1">
        <div className="pr-4 pb-[100px] [grid-column:1/3] [grid-row:1] max-[900px]:[grid-column:1] max-[900px]:pr-0">
          <SectionMarker tone="light" style={{ marginBottom: 40 }}>
            Sobre
          </SectionMarker>
          <p className="font-sans font-light text-[clamp(20px,2.8vw,42px)] leading-[1.18] tracking-[-0.01em] text-paper max-[1024px]:text-[clamp(18px,2.6vw,32px)]">
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
        <div className="sticky top-[100px] flex flex-col gap-5 self-start [grid-column:4/5] [grid-row:1] max-[900px]:static max-[900px]:flex-row max-[900px]:items-start max-[900px]:gap-4 max-[900px]:[grid-column:1] max-[900px]:[grid-row:2]">
          <div className="h-[58vh] max-h-[520px] overflow-hidden rounded-[2px] [&>*]:!h-full max-[900px]:h-[52vw] max-[900px]:max-h-[320px] max-[900px]:flex-1">
            <ImageBlock
              tone="dark"
              ratio="3/4"
              style={{ height: "100%" }}
              src={portraitUrl || undefined}
            />
          </div>
          <div className="text-left">
            <Eyebrow
              style={{
                display: "block",
                marginBottom: 6,
                color: "rgba(244,241,234,.6)",
              }}
            >
              Lucas Lobeu
            </Eyebrow>
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
      <div className="mt-20 grid grid-cols-4 gap-x-8 border-t-[0.5px] border-paper/8 max-[900px]:grid-cols-1">
        <div className="h-[60vh] min-h-[420px] overflow-hidden [grid-column:1/3] [&>*]:!h-full max-[900px]:h-[55vw] max-[900px]:min-h-[300px] max-[900px]:[grid-column:1]">
          <ImageBlock
            tone="mid"
            ratio="4/5"
            style={{ height: "100%" }}
            src={footerImageUrl || undefined}
          />
        </div>
        <div className="flex flex-col justify-center pb-20 pl-12 [grid-column:3/5] max-[900px]:px-0 max-[900px]:pt-12 max-[900px]:pb-16 max-[900px]:[grid-column:1]">
          <SectionMarker tone="light" style={{ marginBottom: 24 }}>
            Resultado
          </SectionMarker>
          <p className="mt-4 font-sans font-light text-[clamp(24px,3vw,48px)] leading-[1.15] tracking-[-0.015em] text-paper">
            {footerHeadline}
          </p>
        </div>
      </div>
    </section>
  );
}
