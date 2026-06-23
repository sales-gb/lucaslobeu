import Reveal from "@/components/ui/reveal";
import { DEFAULT_STATS } from "@/features/home/data/fallbacks";
import type { StatItem } from "@/features/home/types";

// Stagger explícito 2×4: itens 1,3 na linha de cima · 2,4 na de baixo.
// No mobile (<768px) o grid vira 2 colunas com fluxo automático.
const PLACE = [
  "[grid-column:1] [grid-row:1]",
  "[grid-column:2] [grid-row:2]",
  "[grid-column:3] [grid-row:1]",
  "[grid-column:4] [grid-row:2]",
];

export function StatsSection({ stats }: { stats: StatItem[] }) {
  const STATS = stats.length > 0 ? stats : DEFAULT_STATS;

  return (
    <div className="grid grid-cols-4 grid-rows-[auto_auto] border-b-[0.5px] border-paper/8 bg-ink px-[var(--page-x)] text-paper max-md:grid-cols-2 max-md:grid-rows-none">
      {STATS.map((s, i) => (
        <Reveal
          key={s.label}
          y={24}
          delay={i * 100}
          className={`${PLACE[i] ?? ""} max-md:[grid-column:auto] max-md:[grid-row:auto]`}
        >
          <div className="flex flex-col gap-[10px] border-[0.5px] border-paper/8 px-10 pt-[52px] pb-[60px] max-md:px-6 max-md:pt-9 max-md:pb-11">
            <span className="mb-2 font-mono text-[10px] tracking-[0.3em] text-paper/35">
              • • •
            </span>
            <span className="font-serif font-light text-[clamp(56px,8vw,120px)] leading-[0.9] tracking-[-0.02em] text-paper max-md:text-[clamp(44px,10vw,72px)]">
              {s.val}
            </span>
            <span className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-paper">
              {s.label}
            </span>
            <p className="max-w-[240px] font-mono text-[11px] uppercase leading-[1.6] tracking-[0.12em] text-paper/40">
              {s.desc}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
