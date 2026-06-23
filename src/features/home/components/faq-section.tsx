"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Reveal from "@/components/ui/reveal";
import TextReveal from "@/components/ui/text-reveal";
import { SectionMarker } from "@/components/ui/section-marker";
import { cn } from "@/lib/utils/cn";
import { DEFAULT_FAQ } from "@/features/home/data/fallbacks";
import { EASE_OUT } from "@/features/home/constants";
import type { FaqItem } from "@/features/home/types";

function FaqAccordionItem({ item, index }: { item: FaqItem; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t-[0.5px] border-rule last:border-b-[0.5px]">
      <button
        className="grid w-full cursor-pointer grid-cols-[32px_1fr_32px] items-center gap-4 py-6 text-left transition-opacity duration-200 hover:opacity-75"
        onClick={() => setOpen(!open)}
      >
        <span className="ll-mono small-cap muted" style={{ fontSize: 10 }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="font-sans font-light text-[clamp(15px,1.4vw,17px)] leading-[1.4]">
          {item.q}
        </span>
        <motion.span
          className="flex items-center justify-center font-mono text-[20px] text-muted"
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
        >
          +
        </motion.span>
      </button>

      {/* Grid row trick — animates height without page jump */}
      <div
        className={cn(
          "grid grid-rows-[0fr] transition-[grid-template-rows] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          open && "grid-rows-[1fr]",
        )}
      >
        <div className="overflow-hidden pl-12">
          <p className="ll-body" style={{ padding: "16px 0 24px", maxWidth: 640 }}>
            {item.a}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FaqSection({ faqItems }: { faqItems: FaqItem[] }) {
  const items = faqItems.length > 0 ? faqItems : DEFAULT_FAQ;
  return (
    <section className="border-b-[0.5px] border-rule px-[var(--page-x)] py-[120px]">
      <div className="grid grid-cols-[1fr_1.6fr] items-start gap-20">
        <div className="sticky top-[120px]">
          <Reveal y={0}>
            <SectionMarker style={{ marginBottom: 16 }}>
              Perguntas frequentes
            </SectionMarker>
          </Reveal>
          <Reveal y={24} delay={60}>
            <TextReveal
              text="Tudo o que você precisa saber."
              as="h2"
              className="mt-4 font-serif font-light text-[clamp(32px,4vw,64px)] leading-[1.05] tracking-[-0.02em]"
              stagger={0.03}
            />
          </Reveal>
        </div>

        <div className="flex flex-col">
          {items.map((item, i) => (
            <Reveal key={i} y={12} delay={i * 40}>
              <FaqAccordionItem item={item} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
