import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { creatorShare, houseRecord, poolTotal, useStudio } from "@/lib/studio-store";
import { linkOutline, linkPrimary } from "@/lib/utils";

export const Route = createFileRoute("/_studio/leaderboard")({
  component: Leaderboard,
});

function Leaderboard() {
  const pools = useStudio((s) => s.pools);
  const record = houseRecord(pools);
  const volume = pools.reduce((n, p) => n + poolTotal(p), 0);
  const cut = pools.filter((p) => p.status === "settled").reduce((n, p) => n + creatorShare(p), 0);
  const rows = [
    { name: "Clutch", wins: record.a, tone: "text-accent" },
    { name: "Fold", wins: record.b, tone: "text-cool" },
  ].sort((a, b) => b.wins - a.wins || a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Leaderboard</p>
      <h1 className="font-display text-3xl font-semibold">House standings</h1>
      <p className="text-sm text-muted">
        Ranked from settled sandbox pools. Volume {volume} · your 15% {cut}.
      </p>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <Card key={row.name} className="flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-subtle">{i + 1}</span>
              <span className={`font-display text-2xl font-semibold ${row.tone}`}>{row.name}</span>
            </div>
            <span className="font-mono text-sm tabular-nums">{row.wins} W</span>
          </Card>
        ))}
      </div>
      {pools.filter((p) => p.status === "settled").length === 0 ? (
        <p className="text-sm text-muted">No settled rounds yet. Settle the live Arena matchup.</p>
      ) : (
        <div className="space-y-2">
          {pools
            .filter((p) => p.status === "settled")
            .slice(0, 8)
            .map((p) => (
              <Card key={p.id}>
                <p className="truncate text-sm font-medium">{p.question}</p>
                <p className="text-xs text-muted">
                  {p.winner === "a" ? p.aLabel : p.bLabel} · pool {poolTotal(p)} · cut {creatorShare(p)}
                </p>
              </Card>
            ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Link to="/arena" className={linkPrimary}>
          Arena
        </Link>
        <Link to="/analytics" className={linkOutline}>
          Analytics
        </Link>
      </div>
    </div>
  );
}
