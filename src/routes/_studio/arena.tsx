import { createFileRoute, Link } from "@tanstack/react-router";
import { PoolSplit } from "@/components/pool-split";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStudio, type Side } from "@/lib/studio-store";
import { linkOutline, linkPrimary } from "@/lib/utils";

export const Route = createFileRoute("/_studio/arena")({
  component: Arena,
});

function Arena() {
  const pools = useStudio((s) => s.pools);
  const live = pools.find((p) => p.status === "live");
  const sessionLive = useStudio((s) => s.sessionLive);
  const goLive = useStudio((s) => s.goLive);
  const castVote = useStudio((s) => s.castVote);
  const settlePool = useStudio((s) => s.settlePool);

  function pick(side: Side) {
    if (!live) return;
    castVote(live.id, side, 25);
  }

  if (!live) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Arena</p>
        <h1 className="font-display text-3xl font-semibold">Pit is empty</h1>
        <p className="text-sm text-muted">Go live and Pulse opens one sandbox matchup. Settlement stays with you.</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={goLive}>Go live</Button>
          <Link to="/pulse" className={linkOutline}>
            Pulse Studio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Arena</p>
          <h1 className="font-display text-3xl font-semibold">{live.question}</h1>
        </div>
        <Badge tone={sessionLive ? "ok" : "warn"}>{sessionLive ? "Live" : "Idle"}</Badge>
      </div>
      <PoolSplit pool={live} />
      <div className="grid gap-3 sm:grid-cols-2">
        <HouseCard
          name={live.aLabel}
          stake={live.aStake}
          votes={live.aVotes}
          tone="accent"
          onPick={() => pick("a")}
          onSettle={() => settlePool(live.id, "a")}
        />
        <HouseCard
          name={live.bLabel}
          stake={live.bStake}
          votes={live.bVotes}
          tone="cool"
          onPick={() => pick("b")}
          onSettle={() => settlePool(live.id, "b")}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to="/fan" className={linkPrimary}>
          Open as fan
        </Link>
        <Link to="/rivals" className={linkOutline}>
          Series
        </Link>
      </div>
    </div>
  );
}

function HouseCard({
  name,
  stake,
  votes,
  tone,
  onPick,
  onSettle,
}: {
  name: string;
  stake: number;
  votes: number;
  tone: "accent" | "cool";
  onPick: () => void;
  onSettle: () => void;
}) {
  return (
    <Card className={tone === "accent" ? "border-accent/40" : "border-cool/30"}>
      <p className="font-display text-3xl font-semibold">{name}</p>
      <p className="mt-1 font-mono text-xs tabular-nums text-muted">
        {stake} in · {votes} votes
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" variant={tone === "accent" ? "default" : "secondary"} onClick={onPick}>
          Lock 25
        </Button>
        <Button size="sm" variant="outline" onClick={onSettle}>
          Settle {name}
        </Button>
      </div>
    </Card>
  );
}
