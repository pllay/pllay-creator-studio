import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const linkPrimary =
  "inline-flex h-10 items-center justify-center rounded-[var(--radius-sm)] bg-accent px-4 text-sm font-medium text-accent-fg";
export const linkOutline =
  "inline-flex h-10 items-center justify-center rounded-[var(--radius-sm)] border border-line px-4 text-sm font-medium text-fg hover:bg-elevated";
export const linkPrimarySm =
  "inline-flex h-8 items-center justify-center rounded-[var(--radius-sm)] bg-accent px-3 text-xs font-medium text-accent-fg";
export const linkOutlineSm =
  "inline-flex h-8 items-center justify-center rounded-[var(--radius-sm)] border border-line px-3 text-xs font-medium text-fg hover:bg-elevated";
