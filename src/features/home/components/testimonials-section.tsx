"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "@/components/ui/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionMarker } from "@/components/ui/section-marker";
import { cn } from "@/lib/utils/cn";
import { DEFAULT_TESTIMONIALS } from "@/features/home/data/fallbacks";
import { EASE_OUT } from "@/features/home/constants";
import type { TestimonialItem } from "@/features/home/types";

export function TestimonialsSection({
  testimonials,
}: {
  testimonials: TestimonialItem[];
}) {
  const TESTIMONIALS =
    testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS;
  const [active, setActive] = useState(0);

  return (
    <section className="bg-ink px-[var(--page-x)] py-[120px] text-paper">
      <div className="mx-auto max-w-[1280px]">
        <Reveal y={0}>
          <SectionMarker tone="light" style={{ marginBottom: 48 }}>
            O que dizem
          </SectionMarker>
        </Reveal>

        <div className="mt-12 grid grid-cols-[1fr_280px] items-start gap-20">
          {/* Quote display */}
          <div className="min-h-[280px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
              >
                <span className="mb-4 block font-serif text-[120px] leading-[0.6] text-accent">
                  &ldquo;
                </span>
                <blockquote className="mb-8 font-sans font-light text-[clamp(22px,2.8vw,42px)] leading-[1.25] tracking-[-0.01em] text-paper">
                  {TESTIMONIALS[active].quote}
                </blockquote>
                <div className="flex flex-col gap-1.5">
                  <span className="font-sans text-[15px] text-paper">
                    {TESTIMONIALS[active].name}
                  </span>
                  <Eyebrow>
                    {TESTIMONIALS[active].role} · {TESTIMONIALS[active].company}
                  </Eyebrow>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Selector */}
          <div className="flex flex-col border-l-[0.5px] border-paper/15 pl-8">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={i}
                className={cn(
                  "relative flex cursor-pointer items-start gap-3 border-b-[0.5px] border-paper/10 py-5 text-left opacity-45 transition-opacity duration-[250ms]",
                  active === i && "opacity-100",
                )}
                onClick={() => setActive(i)}
              >
                <motion.div
                  className="absolute left-[-32.25px] top-0 bottom-0 w-[0.5px] origin-top bg-accent"
                  animate={{ scaleX: active === i ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                />
                <div className="flex flex-col gap-[3px]">
                  <span className="font-sans text-[13px] text-paper">
                    {t.name}
                  </span>
                  <Eyebrow>{t.company}</Eyebrow>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
