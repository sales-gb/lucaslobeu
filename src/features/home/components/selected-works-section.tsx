"use client";

import { useRef } from "react";
import Link from "next/link";
import Reveal from "@/components/ui/reveal";
import ImageBlock from "@/components/ui/image-block";
import { FlowButton } from "@/components/ui/flow-button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionMarker } from "@/components/ui/section-marker";
import type { Project } from "@/lib/db/schema";

// ─── SELECTED WORKS · bubble/reveal cards ────────────────────
const SW_TONES: Record<"dark" | "mid" | "light", string> = {
  dark: "repeating-linear-gradient(135deg, #1A1A1A 0px, #1A1A1A 2px, #0A0A0A 2px, #0A0A0A 12px)",
  mid: "repeating-linear-gradient(135deg, #9C9183 0px, #9C9183 2px, #8A7F72 2px, #8A7F72 12px)",
  light:
    "repeating-linear-gradient(135deg, #E9E3D5 0px, #E9E3D5 2px, #DDD7C8 2px, #DDD7C8 12px)",
};

// Grid editorial 4-col: row 1 carta central (cols 2-3); row 2 offset (col 1 + cols 3-4).
const PROJ_PLACE = {
  center:
    "[grid-column:2/4] [grid-row:1] max-lg:[grid-column:auto] max-lg:[grid-row:auto] max-sm:[grid-column:1]",
  left: "[grid-column:1/2] [grid-row:2] max-lg:[grid-column:auto] max-lg:[grid-row:auto] max-sm:[grid-column:1]",
  right:
    "[grid-column:3/5] [grid-row:2] max-lg:[grid-column:auto] max-lg:[grid-row:auto] max-sm:[grid-column:1]",
};

function SwCard({
  project,
  previewTone = "dark",
}: {
  project: Project;
  previewTone?: "dark" | "mid" | "light";
}) {
  const imgRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const getPercent = (e: React.MouseEvent) => {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 50, y: 50 };
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    const { x, y } = getPercent(e);
    const p = previewRef.current;
    if (!p) return;
    p.style.transition = "none";
    p.style.clipPath = `circle(0% at ${x}% ${y}%)`;
    void p.offsetWidth; // force reflow for transition to kick in
    p.style.transition = "clip-path 0.55s cubic-bezier(0.22, 1, 0.36, 1)";
    p.style.clipPath = `circle(150% at ${x}% ${y}%)`;
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    const { x, y } = getPercent(e);
    const p = previewRef.current;
    if (!p) return;
    p.style.transition = "clip-path 0.45s cubic-bezier(0.22, 1, 0.36, 1)";
    p.style.clipPath = `circle(0% at ${x}% ${y}%)`;
  };

  const coverTone = (project.coverTone as "dark" | "mid" | "light") ?? "mid";

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block text-inherit no-underline"
    >
      <div className="flex flex-col">
        <div
          ref={imgRef}
          className="relative cursor-pointer overflow-hidden rounded-[2px]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <ImageBlock tone={coverTone} ratio="4/3" />
          <div
            ref={previewRef}
            className="pointer-events-none absolute inset-0 [clip-path:circle(0%_at_50%_50%)]"
            style={{ background: SW_TONES[previewTone] }}
          />
        </div>
        <div className="mt-4 flex flex-col gap-1.5 border-t-[0.5px] border-rule pt-4">
          <Eyebrow>
            {project.category} · {project.year}
          </Eyebrow>
          <h3 className="font-serif font-light text-[clamp(18px,2vw,32px)] leading-[1.05] tracking-[-0.01em] transition-colors duration-300 group-hover:text-accent">
            {project.title}
          </h3>
          <span className="ll-mono small-cap muted" style={{ fontSize: 11 }}>
            {project.client}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function SelectedWorksSection({ projects }: { projects: Project[] }) {
  const [proj1, proj2, proj3] = projects;

  return (
    <section className="border-b-[0.5px] border-rule px-[var(--page-x)] py-[var(--section-y)]">
      {/* Header: title cols 1–2, description col 4 */}
      <div className="mb-20 grid grid-cols-4 items-end gap-x-8 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <div className="[grid-column:1/3] max-lg:[grid-column:1/2] max-sm:[grid-column:1]">
          <Reveal y={0}>
            <SectionMarker style={{ marginBottom: 24 }}>
              Trabalhos selecionados
            </SectionMarker>
          </Reveal>
          <Reveal y={20} delay={60}>
            <h2 className="mt-5 font-serif font-light text-[clamp(28px,3.4vw,52px)] leading-[1.08] tracking-[-0.015em]">
              Uma coleção
              <br />
              de experiências
              <br />
              digitais refinadas
            </h2>
          </Reveal>
        </div>
        <div className="[grid-column:4/5] max-lg:[grid-column:2/3] max-sm:[grid-column:1]">
          <Reveal y={16} delay={120}>
            <p className="max-w-[240px] text-[14px] leading-[1.65] text-muted">
              Cada projeto aqui foi moldado com intenção — do layout e
              tipografia à interação e tom.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Cards: row 1 centered (cols 2–3), row 2 offset (col 1 + cols 3–4) */}
      <div className="grid grid-cols-4 gap-x-8 gap-y-12 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {proj1 && (
          <Reveal y={28} delay={0} className={PROJ_PLACE.center}>
            <SwCard project={proj1} previewTone="light" />
          </Reveal>
        )}
        {proj2 && (
          <Reveal y={28} delay={80} className={PROJ_PLACE.left}>
            <SwCard project={proj2} previewTone="dark" />
          </Reveal>
        )}
        {proj3 && (
          <Reveal y={28} delay={160} className={PROJ_PLACE.right}>
            <SwCard project={proj3} previewTone="mid" />
          </Reveal>
        )}
      </div>

      {/* Footer: text cols 1–2, CTA button col 4 */}
      <div className="mt-20 grid grid-cols-4 items-center gap-x-8 border-t-[0.5px] border-rule pt-10 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <div className="[grid-column:1/3] max-lg:[grid-column:1/2] max-sm:[grid-column:1]">
          <Reveal y={12}>
            <p className="ll-body" style={{ color: "var(--muted)", maxWidth: 360 }}>
              Cada projeto conta uma história. Veja o quadro completo.
            </p>
          </Reveal>
        </div>
        <div className="[grid-column:4/5] max-lg:[grid-column:2/3] max-sm:[grid-column:1]">
          <Reveal y={12} delay={80}>
            <FlowButton text="Ver todos os trabalhos" href="/projects" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
