import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

/**
 * Variantes de botão — substituem .ll-btn-outline / --dark / .ll-btn-light /
 * .ll-btn-ghost-light de styles/portfolio.css.
 *
 * Exportado à parte porque metade dos "botões" do site são <Link>/<a>; assim o
 * elemento semântico correto recebe o estilo sem precisar virar <button>:
 *   <Link className={buttonVariants({ variant: "outline" })}>…</Link>
 */
export const buttonVariants = cva(
  "inline-flex items-center font-mono text-[11px] uppercase tracking-[0.2em]",
  {
    variants: {
      variant: {
        outline:
          "justify-center px-7 py-3 border-[0.5px] border-ink text-ink bg-transparent transition-colors duration-300 hover:bg-ink hover:text-paper",
        light:
          "px-8 py-3.5 bg-paper text-ink transition-opacity duration-200 hover:opacity-85",
        ghost:
          "gap-2 pb-1 text-paper/70 border-b-[0.5px] border-paper/30 transition-colors duration-200 hover:text-paper hover:border-paper",
      },
      /** Para superfícies escuras (era o sufixo --dark). */
      onDark: { true: "", false: "" },
    },
    compoundVariants: [
      {
        variant: "outline",
        onDark: true,
        class: "border-paper text-paper hover:bg-paper hover:text-ink",
      },
    ],
    defaultVariants: { variant: "outline", onDark: false },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ variant, onDark, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, onDark }), className)}
      {...props}
    />
  );
}
