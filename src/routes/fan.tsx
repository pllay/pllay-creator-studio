import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PoolSplit } from "@/components/pool-split";
import { Button } from "@/components/ui/button";
import { useStudio, type Side } from "@/lib/studio-store";
import { linkOutline, linkPrimary } from "@/lib/utils";

export const Route = createFileRoute("/fan")({
  component: FanHome,
});

const STAKES = [10, 25, 50];

function FanHome() {
  const pools = useStudio((s) => s.pools);
  const castVote = useStudio((s) => s.castVote);
  const live = pools.find((p) => p.status === "live");
  const [stake, setStake] = useState(25);
  const [picked, setPicked] = useState<Side | null>(null);

  function pick(side: Side) {
    if (!live) return;
    castVote(live.id, side, stake);
    setPicked(side);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-5 p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Fan</p>
      {live ? (
        <>
          <h1 className="font-display text-4xl font-semibold">{live.question}</h1>
          <p className="text-sm text-muted">{live.title} · sandbox units, not real money</p>
          <PoolSplit pool={live} />
          <div className="flex gap-2">
            {STAKES.map((n) => (
              <Button key={n} size="sm" variant={stake === n ? "default" : "outline"} onClick={() => setStake(n)}>
                {n}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button className="h-14" onClick={() => pick("a")}>
              {live.aLabel}
            </Button>
            <Button className="h-14" variant="secondary" onClick={() => pick("b")}>
              {live.bLabel}
            </Button>
          </div>
          {picked ? (
            <p className="text-xs text-muted">
              Locked {stake} on {picked === "a" ? live.aLabel : live.bLabel}.
            </p>
          ) : null}
        </>
      ) : (
        <>
          <h1 className="font-display text-4xl font-semibold">No live Pulse yet</h1>
          <p className="text-sm text-muted">
            Fans only see approved interactions. Confirm a moment in Pulse Studio, then Approve.
          </p>
        </>
      )}
      <div className="flex flex-wrap gap-2">
        <Link to="/pulse" className={linkPrimary}>
          Back to studio
        </Link>
        <Link to="/" className={linkOutline}>
          Dashboard
        </Link>
      </div>
    </main>
  );
}
