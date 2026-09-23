import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { draftMoment } from "@/lib/draft-moment";
import { draftPrompt, useStudio } from "@/lib/studio-store";
import { linkOutline, linkPrimary } from "@/lib/utils";

export const Route = createFileRoute("/_studio/moment-agent")({
  component: MomentAgent,
});

function MomentAgent() {
  const mode = useStudio((s) => s.mode);
  const session = useStudio((s) => s.sessionLive);
  const moments = useStudio((s) => s.moments);
  const reviews = useStudio((s) => s.reviews);
  const reviewMoment = useStudio((s) => s.reviewMoment);
  const reviewDraft = useStudio((s) => s.reviewDraft);
  const pullEvidence = useStudio((s) => s.pullEvidence);
  const rewriteMoment = useStudio((s) => s.rewriteMoment);
  const [asking, setAsking] = useState(false);
  const waiting = moments.filter((m) => m.status === "under_review");
  const current = waiting[0];
  const drafts = reviews.filter((r) => r.status === "pending");
  const decided = moments.filter((m) => m.status !== "under_review").slice(0, 4);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Moment Agent</p>
          <h1 className="font-display text-3xl font-semibold">Copilot</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Confirm writes a draft. Approve opens one pool. This desk never settles a winner.
          </p>
        </div>
        <Button onClick={pullEvidence}>Pull evidence</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge tone={session ? "ok" : "neutral"}>{session ? "Live" : "Idle"}</Badge>
        <Badge>{mode}</Badge>
        <Badge tone={waiting.length > 0 ? "accent" : "neutral"}>{waiting.length} under review</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Under review</p>
          {current ? (
            <div className="mt-3 space-y-4">
              <div>
                <p className="font-display text-3xl font-semibold">{current.description}</p>
                <p className="mt-1 font-mono text-xs tabular-nums text-subtle">
                  confidence {current.confidence.toFixed(2)}
                  {waiting.length > 1 ? ` · ${waiting.length - 1} more behind this` : ""}
                </p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-line bg-bg p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Draft it will write</p>
                <p className="mt-1 text-sm font-medium">{draftPrompt(current.description)}</p>
                <p className="mt-1 text-xs text-muted">Confirm does not publish. Fans still cannot see this.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => reviewMoment(current.id, "rejected")}>
                  Skip
                </Button>
                <Button
                  variant="outline"
                  disabled={asking}
                  onClick={() => {
                    const moment = current;
                    setAsking(true);
                    void draftMoment({ data: { label: moment.description, detail: "Rewrite the interaction question. Do not settle." } })
                      .then((result) => {
                        if (!result.ok) {
                          toast.error(result.error);
                          return;
                        }
                        rewriteMoment(moment.id, result.text);
                        toast.success("Draft rewritten. Still under review.");
                      })
                      .catch(() => toast.error("Sign in on Account first."))
                      .finally(() => setAsking(false));
                  }}
                >
                  {asking ? "Asking…" : "Ask Grok"}
                </Button>
                <Button onClick={() => reviewMoment(current.id, "confirmed")}>Confirm moment</Button>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <p className="font-display text-2xl font-semibold">Nothing under review</p>
              <p className="text-sm text-muted">
                Pull a frame from the live session, or send one from Vision. The agent will not open a pool by itself.
              </p>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <p className="text-sm font-medium">Drafts</p>
          <p className="mt-1 text-xs text-muted">
            {drafts.length === 0
              ? "No drafts. Confirm a moment to write one."
              : "Approve opens one pool. You still pick the winner."}
          </p>
          {drafts.length === 0 ? null : (
            <ul className="mt-3 space-y-2">
              {drafts.map((row) => (
                <li key={row.id} className="rounded-[var(--radius-md)] border border-line p-3">
                  <p className="text-sm font-medium">{row.prompt}</p>
                  <p className="mt-1 text-xs text-muted">{row.explanation}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => reviewDraft(row.id, false)}>
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => reviewDraft(row.id, true)}>
                      Approve
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {decided.length > 0 ? (
        <Card>
          <p className="text-sm font-medium">Recent decisions</p>
          <ul className="mt-2 space-y-1">
            {decided.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-muted">{m.description}</span>
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                  {m.status === "confirmed" ? "Drafted" : "Skipped"}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Link to="/vision" className={linkPrimary}>
          Vision evidence
        </Link>
        <Link to="/pulse" className={linkOutline}>
          Pulse Studio
        </Link>
      </div>
    </div>
  );
}
