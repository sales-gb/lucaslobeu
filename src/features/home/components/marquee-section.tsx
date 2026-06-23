import Marquee from "@/components/ui/marquee";

export function MarqueeSection() {
  return (
    <div className="ll-h3-marquee">
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
          <span
            key={i}
            className={w === "·" ? "ll-marquee-sep" : "ll-marquee-word"}
          >
            {w}
          </span>
        ))}
      </Marquee>
    </div>
  );
}
