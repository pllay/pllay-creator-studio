import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useStudio } from "@/lib/studio-store";

export const Route = createFileRoute("/_studio/support")({
  component: Support,
});

const STEPS: { to: string; title: string; body: string }[] = [
  { to: "/vision", title: "Vision AI", body: "Pull a frame. It proposes a moment and never opens a pool." },
  { to: "/moment-agent", title: "Moment Agent", body: "Confirm writes a draft. Approve opens one pool." },
  { to: "/pulse", title: "Pulse", body: "You settle the winner here. The copilot cannot." },
  { to: "/obs-overlay", title: "OBS Overlay", body: "Copy the browser source. The checker is empty space." },
  { to: "/set-tools", title: "Set Tools", body: "Preview a stinger once so the browser allows sound." },
  { to: "/statement", title: "Statement", body: "Your 15% is recorded. It is not paid out." },
  { to: "/account", title: "Account", body: "Sign in with Google or X. Studio units stay on this browser." },
];

function Support() {
  const session = useStudio((s) => s.sessionLive);
  const mode = useStudio((s) => s.mode);
  const channel = useStudio((s) => s.channel);
  const moments = useStudio((s) => s.moments);
  const reviews = useStudio((s) => s.reviews);
  const stingers = useStudio((s) => s.stingers);
  const seats = useStudio((s) => s.seats);
  const waiting = moments.filter((m) => m.status === "under_review").length;
  const drafts = reviews.filter((r) => r.status === "pending").length;
  const armed = [
    stingers.open ? "Pool opens" : null,
    stingers.settle ? "Winner settled" : null,
    stingers.vote ? "Fan lock-in" : null,
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Support</p>
        <h1 className="font-display text-3xl font-semibold">How a pool goes live</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Studio units. No payouts. PLLAY takes 0%. You keep 15% of a settled pool.
        </p>
      </div>

      <Card className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge tone={session ? "ok" : "neutral"}>{session ? "Live" : "Idle"}</Badge>
          <Badge>{mode}</Badge>
          <Badge>{channel || "no channel"}</Badge>
        </div>
        <p className="text-sm text-muted">
          {waiting} under review · {drafts} drafts · {seats.length} of 4 seats
        </p>
        <p className="text-sm text-muted">
          {armed.length > 0 ? `Armed: ${armed.join(", ")}` : "No stingers armed."}
        </p>
      </Card>

      <ol className="space-y-2">
        {STEPS.map((step, index) => (
          <li key={step.to}>
            <Card className="flex items-start gap-3">
              <span className="font-mono text-xs tabular-nums text-subtle">{index + 1}</span>
              <div className="min-w-0">
                <Link to={step.to} className="text-sm font-medium text-fg underline decoration-line">
                  {step.title}
                </Link>
                <p className="text-sm text-muted">{step.body}</p>
              </div>
            </Card>
          </li>
        ))}
      </ol>
    </div>
  );
}
