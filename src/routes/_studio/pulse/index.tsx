import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PoolSplit } from "@/components/pool-split";
import { useStudio, type AgentMode } from "@/lib/studio-store";

export const Route = createFileRoute("/_studio/pulse/")({
  component: PulseDashboard,
});

const MODES: { value: AgentMode; label: string }[] = [
  { value: "OFF", label: "Off" },
  { value: "SUGGEST", label: "Suggest" },
  { value: "APPROVAL_REQUIRED", label: "Approval required" },
  { value: "AUTO_PUBLISH", label: "Live" },
];

function PulseDashboard() {
  const studio = useStudio();

  if (!studio.sourceConnected) {
    return (
      <div className="mx-auto max-w-lg space-y-3 py-10 text-sm text-muted">
        <p>No content source yet. Go live to connect a channel and publish.</p>
        <Button onClick={studio.goLive}>Go live</Button>
      </div>
    );
  }

  const pendingMoments = studio.moments.filter((m) => m.status === "under_review");
  const pendingReviews = studio.reviews.filter((r) => r.status === "pending");
  let queueHint = "No under_review moments yet. Agent drafts land here.";
  if (studio.mode === "OFF") queueHint = "Agent is Off. Set Suggest to allow drafts.";
  else if (!studio.sessionLive) queueHint = "No active session. Go live or start a private test session.";
  else if (studio.mode === "AUTO_PUBLISH") queueHint = "Live. New moments auto-publish as one open pool.";

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div className="xl:col-span-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Pulse Studio</p>
        <h1 className="font-display text-3xl font-semibold">Ops</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active session</CardTitle>
        </CardHeader>
        <CardContent>
          {studio.sessionLive ? <Badge tone="ok">Live</Badge> : <p className="text-sm text-muted">No active session.</p>}
          {!studio.sessionLive ? (
            <Button size="sm" onClick={studio.goLive}>
              Go live
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={studio.stopSession}>
              End session
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent mode</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted">
            {studio.mode === "AUTO_PUBLISH"
              ? "Live auto-publishes one pool. You still settle the winner."
              : "Suggest and Approval keep drafts in queue. Live publishes."}
          </p>
          <div className="flex flex-wrap gap-2">
            {MODES.map((m) => (
              <Button
                key={m.value}
                size="sm"
                variant={studio.mode === m.value ? "default" : "outline"}
                onClick={() => studio.setMode(m.value)}
              >
                {m.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Channel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-sm">{studio.channel}</p>
          <p className="text-xs text-muted">Creator workspace</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 xl:col-span-3">
        <CardHeader>
          <CardTitle>Detected moments</CardTitle>
          <Button
            size="sm"
            variant="outline"
            disabled={studio.mode === "OFF" || !studio.sessionLive}
            onClick={studio.simulateMoment}
          >
            Simulate game event
          </Button>
        </CardHeader>
        <CardContent>
          {pendingMoments.length === 0 ? <p className="text-sm text-muted">{queueHint}</p> : null}
          {pendingMoments.map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-line p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{row.description}</p>
                <p className="text-xs text-muted">
                  confidence {row.confidence.toFixed(2)} · {row.status}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="outline" onClick={() => studio.reviewMoment(row.id, "rejected")}>
                  Skip
                </Button>
                <Button size="sm" onClick={() => studio.reviewMoment(row.id, "confirmed")}>
                  Confirm moment
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="md:col-span-2 xl:col-span-3">
        <CardHeader>
          <CardTitle>Approval queue</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingReviews.length === 0 ? <p className="text-sm text-muted">Nothing pending.</p> : null}
          {pendingReviews.map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-line p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{row.prompt}</p>
                <p className="text-xs text-muted">{row.explanation}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="outline" onClick={() => studio.reviewDraft(row.id, false)}>
                  Reject
                </Button>
                <Button size="sm" onClick={() => studio.reviewDraft(row.id, true)}>
                  Approve
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="md:col-span-2 xl:col-span-3">
        <CardHeader>
          <CardTitle>Live interactions</CardTitle>
          <Link to="/arena" className="text-xs text-muted underline decoration-line">
            Open arena
          </Link>
        </CardHeader>
        <CardContent>
          {studio.pools.filter((p) => p.status === "live").length === 0 ? (
            <p className="text-sm text-muted">No live pool. Live mode publishes one matchup. You still settle.</p>
          ) : null}
          {studio.pools
            .filter((p) => p.status === "live")
            .map((p) => (
              <div key={p.id} className="space-y-3 rounded-[var(--radius-md)] border border-line p-3">
                <p className="text-sm font-medium">{p.question}</p>
                <PoolSplit pool={p} />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => studio.settlePool(p.id, "a")}>
                    Settle {p.aLabel}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => studio.settlePool(p.id, "b")}>
                    Settle {p.bLabel}
                  </Button>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
