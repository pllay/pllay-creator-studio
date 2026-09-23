import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PoolSplit } from "@/components/pool-split";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FanBoardSync } from "@/components/fan-board-sync";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Label } from "@/components/ui/label";
import { useStudio, fanDisplayName, type Pool, type Side } from "@/lib/studio-store";
import { linkOutline, linkPrimary } from "@/lib/utils";

export const Route = createFileRoute("/fan")({
  component: FanHome,
});

const STAKES = [10, 25, 50];

function sideLabel(pool: Pool, side: Side | null) {
  if (!side) return "—";
  return side === "a" ? pool.aLabel : pool.bLabel;
}

function FanHome() {
  const pools = useStudio((s) => s.pools);
  const fanLock = useStudio((s) => s.fanLock);
  const lockIn = useStudio((s) => s.lockIn);
  const live = pools.find((p) => p.status === "live");
  const settled = pools.find((p) => p.status === "settled");
  const last = fanLock ? pools.find((p) => p.id === fanLock.poolId && p.status === "settled") : undefined;
  const fanName = useStudio((s) => s.fanName);
  const setFanName = useStudio((s) => s.setFanName);
  const [stake, setStake] = useState(25);
  const { user, isPending } = useCurrentUserState();
  const name = fanDisplayName(fanName);

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-5 p-6">
      <BrandLogo />
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Fan</p>
      <div className="space-y-2">
        <Label htmlFor="fan-name">Name on the board</Label>
        <Input
          id="fan-name"
          value={fanName}
          maxLength={24}
          onChange={(e) => setFanName(e.target.value)}
        />
        <p className="text-xs text-muted">
          {isPending
            ? "Checking session…"
            : user
              ? "Signed in. This name follows the account, including old rows."
              : "Sign in on Account so this name follows you."}
        </p>
      </div>
      <FanBoardSync />
      {live ? (
        <>
          {last && fanLock ? (
            <p className="text-sm text-muted">
              Last round: {last.winner === fanLock.side ? `${fanLock.name} hit it.` : `${fanLock.name} missed it.`}{" "}
              {sideLabel(last, last.winner)} won.
            </p>
          ) : null}
          <h1 className="font-display text-3xl font-semibold text-pretty sm:text-4xl">{live.question}</h1>
          <p className="text-sm text-muted">{live.title} · studio units, no payout</p>
          <PoolSplit pool={live} />
          <div className="flex gap-2">
            {STAKES.map((n) => (
              <Button key={n} size="sm" variant={stake === n ? "default" : "outline"} onClick={() => setStake(n)}>
                {n}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button className="h-14" onClick={() => lockIn(live.id, "a", stake)}>
              {live.aLabel}
            </Button>
            <Button className="h-14" variant="secondary" onClick={() => lockIn(live.id, "b", stake)}>
              {live.bLabel}
            </Button>
          </div>
          {fanLock?.poolId === live.id ? (
            <p className="text-xs text-muted">
              Locked {fanLock.stake} on {sideLabel(live, fanLock.side)} as {fanLock.name}.
            </p>
          ) : null}
        </>
      ) : settled ? (
        <>
          <h1 className="font-display text-3xl font-semibold text-pretty sm:text-4xl">{settled.question}</h1>
          <p className="text-sm text-muted">
            Winner {sideLabel(settled, settled.winner)}. Studio units, no payout.
          </p>
          <PoolSplit pool={settled} />
          <p className="text-sm text-muted">
            {fanLock?.poolId === settled.id
              ? settled.winner === fanLock.side
                ? `${fanLock.name} hit it. Locked ${fanLock.stake} on ${sideLabel(settled, fanLock.side)}.`
                : `${fanLock.name} missed it. Locked ${fanLock.stake} on ${sideLabel(settled, fanLock.side)}.`
              : `${name} sat this one out.`}
          </p>
        </>
      ) : (
        <>
          <h1 className="font-display text-3xl font-semibold text-pretty sm:text-4xl">No live Pulse yet</h1>
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
