import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStudio } from "@/lib/studio-store";
import { linkOutlineSm, linkPrimarySm } from "@/lib/utils";

export const Route = createFileRoute("/_studio/overlay-control")({
  component: OverlayControl,
});

function OverlayControl() {
  const channel = useStudio((s) => s.channel);
  const pools = useStudio((s) => s.pools);
  const slug = channel || "studio";
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  const url = origin ? `${origin}/overlay/${encodeURIComponent(slug)}` : "Generating overlay URL…";

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Overlay</p>
      <h1 className="font-display text-3xl font-semibold">Overlay Control</h1>
      <p className="text-sm text-muted">
        Generate OBS overlay URLs. Missing profile or secret no longer fails this page.
      </p>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="size-4 text-accent" />
            Live stream overlay
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted">Add this URL as a Browser Source in OBS.</p>
          <div className="flex items-center gap-2">
            <code className="block min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded-[var(--radius-sm)] border border-line bg-bg px-3 py-2 font-mono text-xs">
              {url}
            </code>
            <Button
              size="sm"
              variant="outline"
              aria-label="Copy overlay URL"
              disabled={!origin}
              onClick={() => {
                void navigator.clipboard.writeText(url);
                toast.success("Overlay URL copied");
              }}
            >
              <Copy className="size-3.5" />
            </Button>
          </div>
          <Link to="/obs-overlay" className={`${linkPrimarySm} mt-3`}>
            Preview browser source
          </Link>
        </CardContent>
      </Card>
      <Card>
        <p className="text-sm font-medium">Prediction overlays</p>
        {pools.length === 0 ? (
          <p className="mt-1 text-sm text-muted">
            No active predictions.{" "}
            <Link to="/predictions" className="text-fg underline decoration-line">
              Launch a pool
            </Link>{" "}
            to generate per-prediction overlay URLs.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {pools.map((p) => {
              const predUrl = origin
                ? `${origin}/overlay/${encodeURIComponent(slug)}?prediction=${p.id}`
                : "";
              return (
                <div key={p.id} className="flex items-center gap-2">
                  <code className="block min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded-[var(--radius-sm)] border border-line bg-bg px-2 py-1.5 font-mono text-[10px]">
                    {predUrl || p.title}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={!predUrl}
                    aria-label={`Copy ${p.title} overlay`}
                    onClick={() => {
                      void navigator.clipboard.writeText(predUrl);
                      toast.success(`${p.title} URL copied`);
                    }}
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
        <Link to="/predictions" className={`${linkOutlineSm} mt-3`}>
          Predictions
        </Link>
      </Card>
    </div>
  );
}
