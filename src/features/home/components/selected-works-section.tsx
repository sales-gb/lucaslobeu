"use client";

import Link from "next/link";
import Reveal from "@/components/ui/reveal";
import ImageBlock from "@/components/ui/image-block";
import { FlowButton } from "@/components/ui/flow-button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionMarker } from "@/components/ui/section-marker";
import { useTrailReveal } from "@/components/ui/use-trail-reveal";
import type { ProjectWithUrls } from "@/features/projects/types";

// Layout editorial não-uniforme sobre grade de 12 colunas. O ciclo de templates
// alterna larguras e deslocamentos verticais (mt) para quebrar a baseline e
// adaptar-se à quantidade definida no CRM (homeFeaturedCount).
type Cell = { col: string; mt: number };
const HOME_TEMPLATES: Cell[][] = [
  [{ col: "2 / 7", mt: 0 }, { col: "8 / 13", mt: 96 }], // par, direita descida
  [{ col: "1 / 6", mt: 36 }], // único, esquerda
  [{ col: "7 / 13", mt: 0 }], // único, direita
  [{ col: "3 / 10", mt: 64 }], // único, largo ao centro
];

function SwCard({ project }: { project: ProjectWithUrls }) {
  const coverTone = (project.coverTone as "dark" | "mid" | "light") ?? "mid";
  // Imagem revelada pelo pincel: a 2ª imagem (hover) ou, sem ela, a própria
  // capa com um filtro (para o rastro ficar visível).
  const revealUrl = project.coverHoverImageUrl ?? project.coverImageUrl;
  const { containerRef, layerRef, onMouseMove, onMouseLeave } = useTrailReveal(
    revealUrl,
    project.coverHoverImageUrl ? undefined : "saturate(1.5) contrast(1.08)",
  );

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block text-inherit no-underline"
      onMouseLeave={onMouseLeave}
    >
      <div className="flex flex-col">
        <div
          ref={containerRef}
          className="relative cursor-pointer overflow-hidden rounded-[2px]"
          onMouseMove={onMouseMove}
        >
          <ImageBlock tone={coverTone} ratio="4/3" src={project.coverImageUrl} />
          {/* Camada do pincel: carimbos são anexados aqui pelo hook. */}
          <div
            ref={layerRef}
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden
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

export function SelectedWorksSection({
  projects,
}: {
  projects: ProjectWithUrls[];
}) {
  // Constrói as linhas a partir do ciclo de templates, respeitando a
  // quantidade vinda do CRM (todos os projetos recebidos são exibidos).
  const rows: Array<{ project: ProjectWithUrls; cell: Cell }[]> = [];
  let i = 0;
  let t = 0;
  while (i < projects.length) {
    const tpl = HOME_TEMPLATES[t % HOME_TEMPLATES.length];
    const row = tpl
      .map((cell, c) => ({ project: projects[i + c], cell }))
      .filter((r) => !!r.project);
    rows.push(row);
    i += row.length;
    t += 1;
  }

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

      {/* Cards: grade editorial não-uniforme dirigida pelo CRM */}
      <div className="flex flex-col gap-8 max-lg:gap-12">
        {rows.length === 0 && (
          <p className="ll-mono small-cap muted" style={{ fontSize: 12 }}>
            Nenhum projeto em destaque.
          </p>
        )}
        {rows.map((row, ri) => (
          <div
            key={ri}
            className="grid grid-cols-12 items-start gap-x-8 max-lg:flex max-lg:flex-col max-lg:gap-12"
          >
            {row.map(({ project, cell }, ci) => (
              <Reveal
                key={project.id}
                y={28}
                delay={ci * 80}
                className="[grid-column:var(--col)] mt-[var(--mt)] max-lg:!mt-0"
                style={
                  {
                    "--col": cell.col,
                    "--mt": `${cell.mt}px`,
                  } as React.CSSProperties
                }
              >
                <SwCard project={project} />
              </Reveal>
            ))}
          </div>
        ))}
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
