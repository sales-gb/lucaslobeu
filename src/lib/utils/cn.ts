import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Mescla classes condicionais (clsx) e resolve conflitos do Tailwind (twMerge):
 * a última utilitária do mesmo grupo vence.
 *
 * @example cn("px-7 py-3", isLarge && "px-10") // -> "py-3 px-10"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
