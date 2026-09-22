import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { useStudio } from "@/lib/studio-store";
import { linkPrimarySm } from "@/lib/utils";

export const Route = createFileRoute("/_studio/moment-agent")({
  component: MomentAgent,
});

function MomentAgent() {
  const mode = useStudio((s) => s.mode);
  const session = useStudio((s) => s.sessionLive);
  const moments = useStudio((s) => s.moments);
  const pending = moments.reduce((n, m) => n + (m.status === "under_review" ? 1 : 0), 0);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Moment Agent</p>
      <h1 className="font-display text-3xl font-semibold">Propose only</h1>
      <p className="text-sm text-muted">
        The agent writes under_review moments unless mode is Live. Live auto-publishes one pool. It never settles.
      </p>
      <Card className="space-y-2">
        <p className="text-sm">
          Mode <span className="font-mono">{mode}</span>
        </p>
        <p className="text-sm">
          Session <span className="font-mono">{session ? "live" : "idle"}</span>
        </p>
        <p className="text-sm">
          Queue <span className="font-mono tabular-nums">{pending}</span>
        </p>
        <Link to="/pulse" className={linkPrimarySm}>
          Open Pulse Studio
        </Link>
      </Card>
    </div>
  );
}
