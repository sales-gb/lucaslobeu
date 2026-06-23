import Link from "next/link";
import Reveal from "@/components/ui/reveal";
import TextReveal from "@/components/ui/text-reveal";
import { buttonVariants } from "@/components/ui/button";

export function CtaSection({ headline, sub }: { headline: string; sub: string }) {
  return (
    <section className="ll-h3-cta">
      <div className="ll-h3-cta-inner">
        <div className="ll-section-marker ll-section-marker--light">
          <span className="ll-accent-dot" />
          <span
            className="ll-eyebrow"
            style={{ color: "rgba(244,241,234,.5)" }}
          >
            Próximo passo
          </span>
        </div>
        <TextReveal
          text={headline}
          as="h2"
          className="ll-h3-cta-title"
          stagger={0.055}
          delay={60}
        />
        <Reveal y={20} delay={200}>
          <p className="ll-h3-cta-sub">{sub}</p>
        </Reveal>
        <Reveal y={16} delay={300}>
          <div className="ll-h3-cta-actions">
            <a href="mailto:lucas@lobeu.studio" className={buttonVariants({ variant: "light" })}>
              lucas@lobeu.studio
            </a>
            <Link href="/contact" className={buttonVariants({ variant: "ghost" })}>
              Ver disponibilidade →
            </Link>
          </div>
        </Reveal>
      </div>

      <span className="ll-crosshair ll-crosshair--tl" aria-hidden />
      <span className="ll-crosshair ll-crosshair--tr" aria-hidden />
      <span className="ll-crosshair ll-crosshair--bl" aria-hidden />
      <span className="ll-crosshair ll-crosshair--br" aria-hidden />
    </section>
  );
}
