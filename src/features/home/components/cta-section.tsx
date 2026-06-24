import Reveal from "@/components/ui/reveal";
import TextReveal from "@/components/ui/text-reveal";
import { FlowButton } from "@/components/ui/flow-button";
import { LinkRule } from "@/components/ui/link-rule";
import { SectionMarker } from "@/components/ui/section-marker";

export function CtaSection({ headline, sub }: { headline: string; sub: string }) {
  return (
    <section className="surface-light relative overflow-hidden bg-paper px-[var(--page-x)] py-[120px] text-ink">
      <div className="flex max-w-[900px] flex-col gap-7">
        <SectionMarker>Próximo passo</SectionMarker>
        <TextReveal
          text={headline}
          as="h2"
          className="font-serif font-light italic text-[clamp(52px,8vw,128px)] leading-[0.92] tracking-[-0.03em] text-ink"
          stagger={0.055}
          delay={60}
        />
        <Reveal y={20} delay={200}>
          <p className="max-w-[480px] font-sans font-light text-[clamp(16px,1.8vw,20px)] leading-[1.6] text-ink/60">
            {sub}
          </p>
        </Reveal>
        <Reveal y={16} delay={300}>
          <div className="flex flex-wrap items-center gap-8">
            <FlowButton text="lucas@lobeu.studio" href="mailto:lucas@lobeu.studio" />
            <LinkRule href="/contact">Ver disponibilidade</LinkRule>
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
