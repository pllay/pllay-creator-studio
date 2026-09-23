import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { PoolSplit } from "@/components/pool-split";
import { useStudio, type FanLock, type Pool } from "@/lib/studio-store";

export function useStreamCard() {
  const pools = useStudio((s) => s.pools);
  const fanLock = useStudio((s) => s.fanLock);
  const sessionLive = useStudio((s) => s.sessionLive);
  const [holdId, setHoldId] = useState<string | null>(null);

  useEffect(() => {
    let prev = new Map(useStudio.getState().pools.map((pool) => [pool.id, pool.status]));
    const timers = new Set<number>();
    const unsub = useStudio.subscribe((state) => {
      const next = new Map(state.pools.map((pool) => [pool.id, pool.status]));
      for (const [id, status] of next) {
        if (prev.get(id) === "live" && status === "settled") {
          setHoldId(id);
          const timer = window.setTimeout(() => {
            timers.delete(timer);
            setHoldId((current) => (current === id ? null : current));
          }, 5000);
          timers.add(timer);
        }
      }
      prev = next;
    });
    return () => {
      unsub();
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, []);

  const held = holdId ? pools.find((pool) => pool.id === holdId && pool.status === "settled") : undefined;
  const pool = held ?? pools.find((item) => item.status === "live") ?? pools[0];
  return { pool, fanLock, sessionLive };
}

export function OverlayCard({
  slug,
  pool,
  sessionLive,
  fanLock = null,
}: {
  slug: string;
  pool: Pool | undefined;
  sessionLive: boolean;
  fanLock?: FanLock | null;
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
          <p className={pool.status === "settled" ? "mt-2 text-xs text-pretty text-ok" : "mt-2 text-[10px] uppercase tracking-[0.16em] text-subtle"}>
            {resultLine(pool, fanLock)}
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-muted">No approved interaction yet.</p>
      )}
    </div>
  );
}

function resultLine(pool: Pool, fanLock: FanLock | null) {
  if (pool.status !== "settled") return "Open · 15% creator";
  const winner = pool.winner === "a" ? pool.aLabel : pool.bLabel;
  if (!fanLock || fanLock.poolId !== pool.id) return `Settled · ${winner}`;
  return `Settled · ${winner} · ${fanLock.name} ${pool.winner === fanLock.side ? "hit it" : "missed it"}`;
}
