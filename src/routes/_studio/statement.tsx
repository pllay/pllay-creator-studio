import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { creatorShare, poolTotal, useStudio } from "@/lib/studio-store";
import { linkOutline } from "@/lib/utils";

export const Route = createFileRoute("/_studio/statement")({
  component: Statement,
});

function Statement() {
  const pools = useStudio((s) => s.pools);
  const settled = pools.filter((pool) => pool.status === "settled");
  const earned = settled.reduce((n, pool) => n + creatorShare(pool), 0);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Statement</p>
        <h1 className="font-display text-3xl font-semibold">Not paid</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Your 15% is recorded in studio units. PLLAY takes 0%. This is not a payout.
        </p>
      </div>
      <Card>
        <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">Recorded</p>
        <p className="mt-1 font-display text-4xl font-semibold tabular-nums">{earned}</p>
        <p className="mt-1 text-xs text-muted">{settled.length} settled pools · status unpaid</p>
      </Card>
      {settled.length === 0 ? (
        <p className="text-sm text-muted">Nothing recorded yet. Settle a pool to add a line.</p>
      ) : (
        <div className="space-y-2">
          {settled.map((pool) => (
            <Card key={pool.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{pool.question}</p>
                <p className="text-xs text-muted">Pool {poolTotal(pool)} · cut {creatorShare(pool)}</p>
              </div>
              <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Not paid</p>
            </Card>
          ))}
        </div>
      )}
      <Link to="/plans" className={linkOutline}>
        Plans
      </Link>
    </div>
  );
}
