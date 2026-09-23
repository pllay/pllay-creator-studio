import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStudio } from "@/lib/studio-store";
import { linkOutline, linkPrimary } from "@/lib/utils";

export const Route = createFileRoute("/_studio/vision")({
  component: Vision,
});

function Vision() {
  const session = useStudio((s) => s.sessionLive);
  const channel = useStudio((s) => s.channel);
  const hits = useStudio((s) => s.vision);
  const capture = useStudio((s) => s.captureFrame);
  const propose = useStudio((s) => s.proposeVision);
  const goLive = useStudio((s) => s.goLive);
  const latest = hits[0];
  const waiting = hits.filter((h) => !h.proposed).length;

  useEffect(() => {
    if (!session) return;
    const id = window.setInterval(() => {
      const s = useStudio.getState();
      if (s.vision.filter((h) => !h.proposed).length >= 4) return;
      s.captureFrame();
    }, 7000);
    return () => window.clearInterval(id);
  }, [session]);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Vision AI</p>
          <h1 className="font-display text-3xl font-semibold">Evidence</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Frames propose moments. They never publish a pool and never settle. Confirm them in Pulse.
          </p>
        </div>
        <Button disabled={!session} onClick={capture}>
          Capture frame
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="flex aspect-video flex-col justify-between rounded-[var(--radius-lg)] border border-line bg-bg p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <BrandLogo className="h-5" />
              {session ? <Badge tone="ok">Live · {channel || "studio"}</Badge> : <Badge>Idle</Badge>}
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Current frame</p>
              <p className="font-display text-3xl font-semibold sm:text-4xl">
                {latest ? latest.label : "Waiting for a frame"}
              </p>
              <p className="mt-1 max-w-md text-sm text-muted">
                {latest
                  ? latest.detail
                  : "Capture reads the sandbox stream. Nothing here calls a remote vision function."}
              </p>
            </div>
            <div>
              <div className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                <span>Confidence</span>
                <span className="tabular-nums">{latest ? latest.confidence.toFixed(2) : "—"}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${Math.round((latest?.confidence ?? 0) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <Card className="lg:col-span-2">
          <p className="text-sm font-medium">Propose queue</p>
          <p className="mt-1 text-xs text-muted">
            {waiting === 0 ? "No unsent frames." : `${waiting} waiting to send to Moment Agent.`}
          </p>
          {!session ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted">Start the session before capturing.</p>
              <Button onClick={goLive}>Go live</Button>
            </div>
          ) : hits.length === 0 ? (
            <p className="mt-4 text-sm text-muted">First frame lands in a few seconds, or capture one now.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {hits.map((hit) => (
                <li key={hit.id} className="rounded-[var(--radius-md)] border border-line p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{hit.label}</p>
                    <span className="font-mono text-[10px] tabular-nums text-subtle">{hit.confidence.toFixed(2)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{hit.detail}</p>
                  <Button
                    size="sm"
                    className="mt-2"
                    variant={hit.proposed ? "outline" : "default"}
                    disabled={hit.proposed}
                    onClick={() => propose(hit.id)}
                  >
                    {hit.proposed ? "In Moment Agent" : "Propose"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link to="/moment-agent" className={linkPrimary}>
          Moment Agent
        </Link>
        <Link to="/pulse" className={linkOutline}>
          Pulse queue
        </Link>
      </div>
    </div>
  );
}
