import Reveal from "@/components/ui/reveal";
import { DEFAULT_STATS } from "@/features/home/data/fallbacks";
import type { StatItem } from "@/features/home/types";

export function StatsSection({ stats }: { stats: StatItem[] }) {
  const STATS = stats.length > 0 ? stats : DEFAULT_STATS;

  return (
    <div className="ll-ek-stats">
      {STATS.map((s, i) => (
        <Reveal key={s.label} y={24} delay={i * 100}>
          <div className="ll-ek-stat">
            <span className="ll-ek-stat-dots">• • •</span>
            <span className="ll-ek-stat-val">{s.val}</span>
            <span className="ll-ek-stat-label">{s.label}</span>
            <p className="ll-ek-stat-desc">{s.desc}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
