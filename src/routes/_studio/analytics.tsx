import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { creatorShare, poolTotal, useStudio } from "@/lib/studio-store";
import { linkOutline, linkPrimary } from "@/lib/utils";

export const Route = createFileRoute("/_studio/analytics")({
  component: Analytics,
});

function Analytics() {
  const pools = useStudio((s) => s.pools);
  const volume = pools.reduce((n, p) => n + poolTotal(p), 0);
  const earnings = pools.filter((p) => p.status === "settled").reduce((n, p) => n + creatorShare(p), 0);
  const live = pools.filter((p) => p.status === "live").length;
  const settled = pools.filter((p) => p.status === "settled").length;
  const results = useStudio((s) => s.fanResults);
  const hits = results.filter((row) => row.hit).length;
  const rate = results.length === 0 ? "—" : `${Math.round((hits / results.length) * 100)}%`;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Analytics</p>
      <h1 className="font-display text-3xl font-semibold">Session totals</h1>
      <p className="text-sm text-muted">Creator cut is 15% of settled pools. PLLAY takes 0%. Nothing here is paid out.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Volume" value={String(volume)} />
        <Stat label="Your 15%" value={String(earnings)} />
        <Stat label="Live / settled" value={`${live} / ${settled}`} />
        <Stat label="Fan hit rate" value={rate} />
      </div>
      {pools.length === 0 ? (
        <p className="text-sm text-muted">No pools yet. Approve a Pulse moment or create a pool.</p>
      ) : (
        <div className="space-y-2">
          {pools.map((p) => (
            <Card key={p.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.question}</p>
                <p className="text-xs text-muted">
                  {p.status} · pool {poolTotal(p)} · cut {p.status === "settled" ? creatorShare(p) : "—"}
                </p>
              </div>
              <p className="font-mono text-xs tabular-nums text-subtle">{p.aVotes + p.bVotes} votes</p>
            </Card>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Link to="/predictions" className={linkPrimary}>
          Open pools
        </Link>
        <Link to="/statement" className={linkOutline}>
          Statement
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{value}</p>
    </Card>
  );
}
