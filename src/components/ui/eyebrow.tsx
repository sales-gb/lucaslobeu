import { cn } from "@/lib/utils/cn";

/** Classes do rótulo eyebrow — exportadas p/ reuso pontual sem o componente. */
export const eyebrowClass =
  "font-mono text-[12px] uppercase tracking-[0.28em] text-muted";

/**
 * Rótulo "eyebrow" — mono, caixa-alta, tracking largo. Substitui .ll-eyebrow.
 * Polimórfico via `as` (ex.: as="cite"). Encaminha className/style, então
 * overrides de cor inline (seções escuras) continuam funcionando.
 */
type EyebrowProps<T extends React.ElementType> = {
  as?: T;
} & React.ComponentPropsWithoutRef<T>;

export function Eyebrow<T extends React.ElementType = "span">({
  as,
  className,
  ...props
}: EyebrowProps<T>) {
  const Tag = as ?? "span";
  return <Tag className={cn(eyebrowClass, className)} {...props} />;
}
