import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { previewStinger, type StingerKey } from "@/lib/stingers";
import { useStudio } from "@/lib/studio-store";
import { linkOutline } from "@/lib/utils";

export const Route = createFileRoute("/_studio/set-tools")({
  component: SetTools,
});

const KIT: { key: StingerKey; title: string; detail: string }[] = [
  {
    key: "open",
    title: "Pool opens",
    detail: "Plays when a draft is approved or Live publishes a pool.",
  },
  {
    key: "settle",
    title: "Winner settled",
    detail: "Plays when you settle on Pulse or in the Arena.",
  },
  {
    key: "vote",
    title: "Fan lock-in",
    detail: "Off by default. Crowd votes would chirp every few seconds.",
  },
];

function SetTools() {
  const kit = useStudio((s) => s.stingers);
  const setStinger = useStudio((s) => s.setStinger);
  const [heard, setHeard] = useState<StingerKey | null>(null);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Set Tools</p>
        <h1 className="font-display text-3xl font-semibold">Sound kit</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Stingers stay in this browser. Preview once to allow sound. Nothing is uploaded.
        </p>
      </div>

      <Card>
        <ul className="space-y-2">
          {KIT.map((row) => {
            const armed = kit[row.key];
            return (
              <li
                key={row.key}
                className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-line p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{row.title}</p>
                  <p className="text-xs text-muted">{row.detail}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      void previewStinger(row.key).then(() => setHeard(row.key));
                    }}
                  >
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    variant={armed ? "default" : "outline"}
                    aria-pressed={armed}
                    onClick={() => setStinger(row.key, !armed)}
                  >
                    {armed ? "Armed" : "Off"}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-subtle">
          {heard ? `Previewed ${KIT.find((row) => row.key === heard)?.title}.` : "No preview yet."}
        </p>
      </Card>

      <Link to="/obs-overlay" className={linkOutline}>
        Browser source
      </Link>
    </div>
  );
}
