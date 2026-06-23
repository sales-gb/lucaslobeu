"use client";

import { useRef } from "react";
import Link from "next/link";
import Reveal from "@/components/ui/reveal";
import ImageBlock from "@/components/ui/image-block";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { Project } from "@/lib/db/schema";

// ─── SELECTED WORKS · bubble/reveal cards ────────────────────
const SW_TONES: Record<"dark" | "mid" | "light", string> = {
  dark: "repeating-linear-gradient(135deg, #1A1A1A 0px, #1A1A1A 2px, #0A0A0A 2px, #0A0A0A 12px)",
  mid: "repeating-linear-gradient(135deg, #9C9183 0px, #9C9183 2px, #8A7F72 2px, #8A7F72 12px)",
  light:
    "repeating-linear-gradient(135deg, #E9E3D5 0px, #E9E3D5 2px, #DDD7C8 2px, #DDD7C8 12px)",
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
    <Link href={`/projects/${project.slug}`} className="ll-sw-card-link">
      <div className="ll-sw-card">
        <div
          ref={imgRef}
          className="ll-sw-card-image"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <ImageBlock tone={coverTone} ratio="4/3" />
          <div
            ref={previewRef}
            className="ll-sw-card-preview"
            style={{ background: SW_TONES[previewTone] }}
          />
        </div>
        <div className="ll-sw-card-meta">
          <span className="ll-eyebrow muted">
            {project.category} · {project.year}
          </span>
          <h3 className="ll-sw-card-name">{project.title}</h3>
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
    <section className="ll-sw">
      {/* Header: title cols 1–2, description col 4 */}
      <div className="ll-sw-header">
        <div className="ll-sw-header-title">
          <Reveal y={0}>
            <div className="ll-section-marker" style={{ marginBottom: 24 }}>
              <span className="ll-accent-dot" />
              <span className="ll-eyebrow">Trabalhos selecionados</span>
            </div>
          </Reveal>
          <Reveal y={20} delay={60}>
            <h2 className="ll-sw-title">
              Uma coleção
              <br />
              de experiências
              <br />
              digitais refinadas
            </h2>
          </Reveal>
        </div>
        <div className="ll-sw-header-desc">
          <Reveal y={16} delay={120}>
            <p className="ll-sw-desc">
              Cada projeto aqui foi moldado com intenção — do layout e
              tipografia à interação e tom.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Cards: row 1 centered (cols 2–3), row 2 offset (col 1 + cols 3–4) */}
      <div className="ll-sw-projects">
        {proj1 && (
          <Reveal y={28} delay={0} className="ll-sw-proj-center">
            <SwCard project={proj1} previewTone="light" />
          </Reveal>
        )}
        {proj2 && (
          <Reveal y={28} delay={80} className="ll-sw-proj-left">
            <SwCard project={proj2} previewTone="dark" />
          </Reveal>
        )}
        {proj3 && (
          <Reveal y={28} delay={160} className="ll-sw-proj-right">
            <SwCard project={proj3} previewTone="mid" />
          </Reveal>
        )}
      </div>

      {/* Footer: text cols 1–2, CTA button col 4 */}
      <div className="ll-sw-footer">
        <div className="ll-sw-footer-text">
          <Reveal y={12}>
            <p
              className="ll-body"
              style={{ color: "var(--muted)", maxWidth: 360 }}
            >
              Cada projeto conta uma história. Veja o quadro completo.
            </p>
          </Reveal>
        </div>
        <div className="ll-sw-footer-btn">
          <Reveal y={12} delay={80}>
            <Link
              href="/projects"
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              Ver todos os trabalhos →
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
