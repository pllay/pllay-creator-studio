import { cn } from "@/lib/utils";

/** Official PLLAY wordmark. The file is the same asset the product apps ship. */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <img
      src="/pllay-logo.png"
      alt="PLLAY"
      width={837}
      height={350}
      className={cn("h-7 w-auto", className)}
    />
  );
}
