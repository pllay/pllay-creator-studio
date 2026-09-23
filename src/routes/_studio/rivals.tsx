import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { fanStandings, houseRecord, useStudio } from "@/lib/studio-store";
import { linkOutline, linkPrimary } from "@/lib/utils";

export const Route = createFileRoute("/_studio/rivals")({
  component: Rivals,
});

function Rivals() {
  const pools = useStudio((s) => s.pools);
  const record = houseRecord(pools);
  const settled = pools.filter((p) => p.status === "settled");
  const fans = fanStandings(useStudio((s) => s.fanResults));
  const leader = record.a === record.b ? "Tied" : record.a > record.b ? "Clutch" : "Fold";

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Rivals</p>
      <h1 className="font-display text-3xl font-semibold">Clutch vs Fold</h1>
      <p className="text-sm text-muted">House series, then the fans who locked. It updates when you settle.</p>
      <Card className="space-y-4">
        <div className="grid grid-cols-3 items-end gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">Clutch</p>
            <p className="font-display text-5xl font-semibold leading-none text-accent">{record.a}</p>
          </div>
          <p className="pb-1 text-center font-mono text-xs text-subtle">series</p>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">Fold</p>
            <p className="font-display text-5xl font-semibold leading-none text-cool">{record.b}</p>
          </div>
        </div>
        <p className="text-sm text-muted">Lead: {leader}</p>
      </Card>
      {fans.length === 0 ? (
        <p className="text-sm text-muted">No fans in the series yet.</p>
      ) : (
        <div className="space-y-2">
          {fans.slice(0, 6).map((fan) => (
            <Card key={fan.fanId} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {fan.name}
                  {fan.crowd ? " · crowd" : ""}
                </p>
                <p className="truncate text-xs text-muted">
                  {fan.sideLabel} · {fan.stake} · {fan.question}
                </p>
              </div>
              <span className="shrink-0 font-mono text-xs tabular-nums">
                {fan.hits} W · {fan.misses} L
              </span>
            </Card>
          ))}
        </div>
      )}
      {settled.length === 0 ? (
        <p className="text-sm text-muted">No series games yet.</p>
      ) : (
        <ol className="space-y-2">
          {settled.slice(0, 8).map((p) => (
            <li key={p.id}>
              <Card className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-sm">{p.question}</p>
                <p className={p.winner === "a" ? "text-accent" : "text-cool"}>
                  {p.winner === "a" ? p.aLabel : p.bLabel}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      )}
      <div className="flex flex-wrap gap-2">
        <Link to="/arena" className={linkPrimary}>
          Open arena
        </Link>
        <Link to="/leaderboard" className={linkOutline}>
          Standings
        </Link>
      </div>
    </div>
  );
}
