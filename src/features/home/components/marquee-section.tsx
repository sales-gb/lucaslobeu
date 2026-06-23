import Marquee from "@/components/ui/marquee";

const WORD =
  "font-serif font-light text-[clamp(80px,12vw,200px)] leading-none tracking-[-0.03em] px-8";
const SEP = "font-serif text-[clamp(80px,12vw,200px)] text-accent px-2";

export function MarqueeSection() {
  return (
    <div className="overflow-hidden border-y-[0.5px] border-rule bg-paper py-5">
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
