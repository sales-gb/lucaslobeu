import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/**
 * Link com régua animada (sweep). A animação vive em styles/portfolio.css
 * (.ll-link-rule + keyframes) — CSS de animação fica em CSS, por design.
 * Este wrapper só dá uma API limpa e injeta a seta. Para links externos/âncora
 * (mailto, tel, target=_blank) use `as="a"`.
 */
type LinkRuleProps = {
  href: string;
  children: React.ReactNode;
  as?: "link" | "a";
  muted?: boolean;
  className?: string;
  style?: React.CSSProperties;
} & Pick<React.AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel">;

export function LinkRule({
  href,
  children,
  as = "link",
  muted = false,
  className,
  style,
  ...anchorProps
}: LinkRuleProps) {
  const classes = cn("ll-link-rule", muted && "muted", className);
  const content = (
    <>
      {children} <span>→</span>
    </>
  );

  if (as === "a") {
    return (
      <a href={href} className={classes} style={style} {...anchorProps}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} style={style}>
      {content}
    </Link>
  );
}
