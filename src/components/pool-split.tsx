import { cn } from "@/lib/utils";
import { creatorShare, poolTotal, winnerShare, type Pool } from "@/lib/studio-store";

export function PoolSplit({ pool, compact }: { pool: Pool; compact?: boolean }) {
  const total = poolTotal(pool);
  const aPct = total === 0 ? 50 : Math.round((pool.aStake / total) * 100);
  const bPct = 100 - aPct;
  return (
    <div className="space-y-2">
      <div className="flex h-3 overflow-hidden rounded-full bg-elevated">
        <div className="bg-accent" style={{ width: `${aPct}%` }} />
        <div className="bg-cool" style={{ width: `${bPct}%` }} />
      </div>
      <div className={cn("flex justify-between font-mono tabular-nums text-xs", compact && "text-[10px]")}>
        <span className="text-accent">
          {pool.aLabel} {aPct}% · {pool.aStake}
        </span>
        <span className="text-cool">
          {pool.bLabel} {bPct}% · {pool.bStake}
        </span>
      </div>
      {!compact ? (
        <p className="text-xs text-muted">
          Pool {total} · you keep {creatorShare(pool)} (15%) · winners {winnerShare(pool)}
        </p>
      ) : null}
    </div>
  );
}
