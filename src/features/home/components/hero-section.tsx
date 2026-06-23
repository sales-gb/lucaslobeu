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

  const heroName =
    "font-serif font-light text-[clamp(100px,16vw,260px)] leading-[0.86] tracking-[-0.03em] text-ink";

  return (
    <section
      className="relative grid min-h-screen grid-rows-[1fr_auto] overflow-hidden border-b-[0.5px] border-rule px-[var(--page-x)]"
      ref={ref}
    >
      <motion.div
        className="flex flex-col items-center justify-center pt-[120px] pb-12 text-center"
        style={{ y: titleY }}
      >
        <Reveal y={8} delay={0}>
          <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.28em] text-muted-soft">
            {roles}
          </p>
        </Reveal>
        <TextReveal
          text="Lucas"
          as="h1"
          className={`${heroName} italic`}
          delay={80}
          stagger={0.06}
          splitBy="char"
        />
        <TextReveal
          text="Lobeu."
          as="h1"
          className={heroName}
          delay={240}
          stagger={0.06}
          splitBy="char"
        />
        <Reveal y={12} delay={600}>
          <p className="mt-9 max-w-[420px] text-center font-sans font-light text-[clamp(15px,1.4vw,17px)] leading-[1.65] text-muted">
            {description}
          </p>
        </Reveal>
      </motion.div>

      <div className="flex items-center justify-center gap-10 border-t-[0.5px] border-rule pt-7 pb-12">
        <Reveal y={8} delay={720}>
          <div className="flex shrink-0 items-center gap-8">
            <Link href="/projects" className={buttonVariants({ variant: "outline" })}>
              Ver projetos
            </Link>
            <LinkRule href="/contact">Falar sobre um projeto</LinkRule>
          </div>
        </Reveal>
      </div>

      <motion.div
        className="absolute bottom-0 left-1/2 h-20 w-[0.5px] origin-top bg-rule"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 1, duration: 1.4, ease: EASE_OUT }}
      />
    </section>
  );
}
