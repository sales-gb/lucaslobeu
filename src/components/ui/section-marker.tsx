import { cn } from "@/lib/utils/cn";
import { Eyebrow } from "@/components/ui/eyebrow";

/**
 * Marcador de seção: ponto de destaque + eyebrow. Substitui .ll-section-marker
 * (+ --light). `tone="light"` usa o eyebrow claro das seções escuras.
 */
export function SectionMarker({
  children,
  tone = "dark",
  className,
  eyebrowClassName,
  style,
}: {
  children: React.ReactNode;
  tone?: "dark" | "light";
  className?: string;
  eyebrowClassName?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)} style={style}>
      <span className="inline-block size-[5px] shrink-0 rounded-full bg-accent" />
      <Eyebrow className={cn(tone === "light" && "text-paper/50", eyebrowClassName)}>
        {children}
      </Eyebrow>
    </div>
  );
}
