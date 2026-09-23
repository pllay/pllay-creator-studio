import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStudio } from "@/lib/studio-store";
import { linkOutline, linkPrimary } from "@/lib/utils";

export const Route = createFileRoute("/_studio/")({
  component: Dashboard,
});

function Dashboard() {
  const channel = useStudio((s) => s.channel);
  const connected = useStudio((s) => s.sourceConnected);
  const session = useStudio((s) => s.sessionLive);
  const mode = useStudio((s) => s.mode);
  const goLive = useStudio((s) => s.goLive);
  const reviews = useStudio((s) => s.reviews);
  const drafts = reviews.reduce((n, r) => n + (r.status === "pending" ? 1 : 0), 0);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Creator home</p>
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        You keep 15% of every pool.
        <span className="text-accent"> PLLAY takes 0%.</span>
      </h1>
      <p className="max-w-xl text-sm leading-relaxed text-muted">
        Winners split 85%. Live publishes one pool. You still settle the winner.
      </p>
      <div className="flex flex-wrap gap-2">
        {session && mode === "AUTO_PUBLISH" ? (
          <Link to="/fan" className={linkPrimary}>
            Open live fan
          </Link>
        ) : (
          <Button onClick={goLive}>Go live</Button>
        )}
        <Link to="/pulse" className={linkOutline}>
          Pulse Studio
        </Link>
      </div>

      <Card>
        <p className="text-sm font-medium">Two steps to Pulse</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">
          <li>
            Connect a channel in{" "}
            <Link to="/pulse/onboarding" className="text-fg underline decoration-line">
              Pulse Studio onboarding
            </Link>
            .
          </li>
          <li>
            Set Suggest, start a private session, then confirm moments on the{" "}
            <Link to="/pulse" className="text-fg underline decoration-line">
              Pulse dashboard
            </Link>
            .
          </li>
        </ol>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Channel" value={connected ? channel : "Not connected"} />
        <Stat label="Agent mode" value={mode} />
        <Stat label="Session" value={session ? "Live" : "Idle"} />
      </div>
      <p className="text-xs text-subtle">Pending drafts: {drafts}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold tabular-nums">{value}</p>
    </Card>
  );
}
