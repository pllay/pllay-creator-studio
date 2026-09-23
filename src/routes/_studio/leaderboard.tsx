import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { creatorShare, fanStandings, houseRecord, poolTotal, useStudio } from "@/lib/studio-store";
import { linkOutline, linkPrimary } from "@/lib/utils";

export const Route = createFileRoute("/_studio/leaderboard")({
  component: Leaderboard,
});

function Leaderboard() {
  const pools = useStudio((s) => s.pools);
  const results = useStudio((s) => s.fanResults);
  const fans = fanStandings(results);
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
      <h1 className="font-display text-3xl font-semibold">Standings</h1>
      <p className="text-sm text-muted">
        Fans rank by settled locks. A rename keeps the same row. Volume {volume} · your 15% {cut}.
      </p>
      {fans.length === 0 ? (
        <p className="text-sm text-muted">No named locks yet. A name on the fan page ranks here after you settle.</p>
      ) : (
        <div className="space-y-2">
          {fans.map((fan, i) => (
            <Card key={fan.fanId} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-subtle">{i + 1}</span>
                  <span className="truncate font-display text-2xl font-semibold">{fan.name}</span>
                </div>
                <p className="mt-1 truncate text-xs text-muted">
                  {fan.crowd ? "Crowd · " : ""}
                  {fan.sideLabel} · {fan.stake} · {fan.question}
                </p>
              </div>
              <span className="shrink-0 font-mono text-sm tabular-nums">
                {fan.hits} W · {fan.misses} L
              </span>
            </Card>
          ))}
        </div>
      )}
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">House</p>
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
