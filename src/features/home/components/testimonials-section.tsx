"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "@/components/ui/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionMarker } from "@/components/ui/section-marker";
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
    <section className="ll-h3-testimonials">
      <div className="ll-h3-testimonials-inner">
        <Reveal y={0}>
          <SectionMarker style={{ marginBottom: 48 }}>O que dizem</SectionMarker>
        </Reveal>

        <div className="ll-h3-test-layout">
          {/* Quote display */}
          <div className="ll-h3-test-quote-wrap">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
                className="ll-h3-test-quote"
              >
                <span className="ll-h3-test-mark">"</span>
                <blockquote className="ll-h3-test-text">
                  {TESTIMONIALS[active].quote}
                </blockquote>
                <div className="ll-h3-test-author">
                  <span className="ll-h3-test-name">
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
          <div className="ll-h3-test-selector">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={i}
                className={`ll-h3-test-item${active === i ? " is-active" : ""}`}
                onClick={() => setActive(i)}
              >
                <motion.div
                  className="ll-h3-test-item-line"
                  animate={{ scaleX: active === i ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                />
                <div className="ll-h3-test-item-info">
                  <span className="ll-h3-test-item-name">{t.name}</span>
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
