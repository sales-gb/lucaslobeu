"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import ImageBlock from "@/components/ui/image-block";

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
