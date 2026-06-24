import Marquee from "@/components/ui/marquee";

// py em `em`: escala com a fonte e garante caixa de recorte mais alta que os
// glifos (topo das maiúsculas + acentos/cedilha de Ã, Ç), evitando o corte
// vertical dentro do overflow:hidden do Marquee.
const WORD =
  "font-serif font-light text-[clamp(80px,12vw,200px)] leading-none tracking-[-0.03em] px-8 py-[0.18em]";
const SEP =
  "font-serif text-[clamp(80px,12vw,200px)] leading-none text-accent px-2 py-[0.18em]";

export function MarqueeSection() {
  return (
    <div className="overflow-hidden border-y-[0.5px] border-rule py-2">
      <Marquee speed={40}>
        {[
          "LOBEU",
          "·",
          "DIREÇÃO",
          "·",
          "FOTOGRAFIA",
          "·",
          "SP",
          "·",
          "LOBEU",
          "·",
          "2019—",
          "·",
        ].map((w, i) => (
          <span key={i} className={w === "·" ? SEP : WORD}>
            {w}
          </span>
        ))}
      </Marquee>
    </div>
  );
}
