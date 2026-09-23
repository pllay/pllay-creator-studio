import { BrandLogo } from "@/components/brand-logo";
import { PoolSplit } from "@/components/pool-split";
import type { Pool } from "@/lib/studio-store";

export function OverlayCard({
  slug,
  pool,
  sessionLive,
}: {
  slug: string;
  pool: Pool | undefined;
  sessionLive: boolean;
}) {
  return (
    <div className="w-full rounded-[var(--radius-lg)] border border-line bg-surface/90 p-4">
      <div className="flex items-center justify-between gap-3">
        <BrandLogo className="h-5" />
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
          {slug} · {sessionLive ? "live" : "idle"}
        </p>
      </div>
      {pool ? (
        <>
          <p className="mt-3 font-display text-xl font-semibold text-pretty sm:text-2xl">{pool.question}</p>
          <div className="mt-3">
            <PoolSplit pool={pool} compact />
          </div>
          {pool.status === "settled" ? (
            <p className="mt-2 text-xs text-ok">
              Settled · {pool.winner === "a" ? pool.aLabel : pool.bLabel}
            </p>
          ) : (
            <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-subtle">Open · 15% creator</p>
          )}
        </>
      ) : (
        <p className="mt-2 text-sm text-muted">No approved interaction yet.</p>
      )}
    </div>
  );
}
