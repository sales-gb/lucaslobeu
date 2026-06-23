"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import Reveal from "@/components/ui/reveal";
import TextReveal from "@/components/ui/text-reveal";
import { buttonVariants } from "@/components/ui/button";
import { LinkRule } from "@/components/ui/link-rule";
import { EASE_OUT } from "@/features/home/constants";

export function HeroSection({
  roles,
  description,
}: {
  roles: string;
  description: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <section className="ll-h3-hero" ref={ref}>
      <motion.div className="ll-h3-hero-title-block" style={{ y: titleY }}>
        <Reveal y={8} delay={0}>
          <p className="ll-h3-hero-roles">{roles}</p>
        </Reveal>
        <TextReveal
          text="Lucas"
          as="h1"
          className="ll-h3-hero-name ll-h3-hero-name--first"
          delay={80}
          stagger={0.06}
          splitBy="char"
        />
        <TextReveal
          text="Lobeu."
          as="h1"
          className="ll-h3-hero-name ll-h3-hero-name--last"
          delay={240}
          stagger={0.06}
          splitBy="char"
        />
        <Reveal y={12} delay={600}>
          <p className="ll-h3-hero-desc">{description}</p>
        </Reveal>
      </motion.div>

      <div className="ll-h3-hero-bottom">
        <Reveal y={8} delay={720}>
          <div className="ll-h3-hero-actions">
            <Link href="/projects" className={buttonVariants({ variant: "outline" })}>
              Ver projetos
            </Link>
            <LinkRule href="/contact">Falar sobre um projeto</LinkRule>
          </div>
        </Reveal>
      </div>

      <motion.div
        className="ll-h3-scroll-line"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 1, duration: 1.4, ease: EASE_OUT }}
      />
    </section>
  );
}
