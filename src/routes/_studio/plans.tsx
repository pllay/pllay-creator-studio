import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { creatorShare, useStudio } from "@/lib/studio-store";
import { linkOutline } from "@/lib/utils";

export const Route = createFileRoute("/_studio/plans")({
  component: Plans,
});

function Plans() {
  const pools = useStudio((s) => s.pools);
  const seats = useStudio((s) => s.seats);
  const earned = pools.filter((pool) => pool.status === "settled").reduce((n, pool) => n + creatorShare(pool), 0);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Plans</p>
        <h1 className="font-display text-3xl font-semibold">Free during beta</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Pro and Studio are both on. No card. Paid plans wait until you earn here.
        </p>
      </div>

      <Card className="space-y-3">
        <Badge tone="ok">Beta</Badge>
        <p className="font-display text-3xl font-semibold tabular-nums">{earned}</p>
        <p className="text-sm text-muted">Sandbox cut from settled pools. PLLAY takes 0%. {seats.length} of 4 seats used.</p>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <p className="font-display text-lg font-semibold">Pro</p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            <li>Vision and Moment Agent</li>
            <li>OBS overlay and sound kit</li>
            <li>15% of every settled pool</li>
          </ul>
        </Card>
        <Card>
          <p className="font-display text-lg font-semibold">Studio</p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            <li>Everything in Pro</li>
            <li>4 seats, no invites sent</li>
            <li>Support shows the live path</li>
          </ul>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link to="/analytics" className={linkOutline}>
          Analytics
        </Link>
        <Link to="/team" className={linkOutline}>
          Team
        </Link>
      </div>
    </div>
  );
}
