import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { OverlayCard } from "@/components/overlay-card";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/lib/studio-store";
import { linkOutline, linkPrimary } from "@/lib/utils";

export const Route = createFileRoute("/_studio/obs-overlay")({
  component: ObsOverlay,
});

function ObsOverlay() {
  const channel = useStudio((s) => s.channel);
  const sessionLive = useStudio((s) => s.sessionLive);
  const pools = useStudio((s) => s.pools);
  const slug = channel || "studio";
  const current = pools.find((p) => p.status === "live") ?? pools[0];
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  const url = origin ? `${origin}/overlay/${encodeURIComponent(slug)}?token=sandbox` : "";

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">OBS Overlay</p>
          <h1 className="font-display text-3xl font-semibold">Browser source</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            The same lower third OBS composites. The checker is empty space. Settle stays in Pulse.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={!url}
          onClick={() => {
            void navigator.clipboard.writeText(url);
            toast.success("Overlay URL copied");
          }}
        >
          <Copy className="size-3.5" />
          Copy URL
        </Button>
      </div>

      <div
        className="flex min-h-72 items-end overflow-hidden rounded-[var(--radius-lg)] border border-line p-3 sm:aspect-video sm:min-h-80 sm:p-8"
        style={{
          backgroundColor: "var(--color-bg)",
          backgroundImage:
            "linear-gradient(45deg, var(--color-elevated) 25%, transparent 25%), linear-gradient(-45deg, var(--color-elevated) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--color-elevated) 75%), linear-gradient(-45deg, transparent 75%, var(--color-elevated) 75%)",
          backgroundSize: "24px 24px",
          backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0",
        }}
      >
        <div className="mx-auto w-full max-w-md">
          <OverlayCard slug={slug} pool={current} sessionLive={sessionLive} />
        </div>
      </div>

      <p className="truncate font-mono text-xs text-subtle">{url || "Preparing the browser source…"}</p>

      <div className="flex flex-wrap gap-2">
        <Link to="/overlay/$slug" params={{ slug }} search={{ prediction: undefined }} className={linkPrimary}>
          Open source
        </Link>
        <Link to="/overlay-control" className={linkOutline}>
          Per-prediction URLs
        </Link>
      </div>
    </div>
  );
}
