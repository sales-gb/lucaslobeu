"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Reveal from "@/components/ui/reveal";
import TextReveal from "@/components/ui/text-reveal";
import { SectionMarker } from "@/components/ui/section-marker";
import { DEFAULT_FAQ } from "@/features/home/data/fallbacks";
import { EASE_OUT } from "@/features/home/constants";
import type { FaqItem } from "@/features/home/types";

function FaqAccordionItem({ item, index }: { item: FaqItem; index: number }) {
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

export function FaqSection({ faqItems }: { faqItems: FaqItem[] }) {
  const items = faqItems.length > 0 ? faqItems : DEFAULT_FAQ;
  return (
    <section className="ll-h3-faq">
      <div className="ll-h3-faq-inner">
        <div className="ll-h3-faq-head">
          <Reveal y={0}>
            <SectionMarker style={{ marginBottom: 16 }}>
              Perguntas frequentes
            </SectionMarker>
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
              <FaqAccordionItem item={item} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
