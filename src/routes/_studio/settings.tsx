import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { channelSlug, useStudio } from "@/lib/studio-store";
import { linkOutline } from "@/lib/utils";

export const Route = createFileRoute("/_studio/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const channel = useStudio((s) => s.channel);
  const session = useStudio((s) => s.sessionLive);
  const connectSource = useStudio((s) => s.connectSource);
  const reset = useStudio((s) => s.reset);
  const [draft, setDraft] = useState(channel);
  const [confirm, setConfirm] = useState(false);
  const slug = channelSlug(draft);

  useEffect(() => {
    setDraft(channel);
  }, [channel]);

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Settings</p>
        <h1 className="font-display text-3xl font-semibold">Studio</h1>
        <p className="mt-1 text-sm text-muted">Signed in as kinggunn. This browser only.</p>
      </div>

      <Card className="space-y-3">
        <Label htmlFor="channel">Channel</Label>
        <Input id="channel" value={draft} maxLength={32} onChange={(e) => setDraft(e.target.value)} />
        <p className="text-xs text-subtle">
          {slug ? `Overlay source saves as ${slug}.` : "Use letters or numbers."}
          {session ? " Session stays live." : ""}
        </p>
        <Button disabled={!slug || slug === channel} onClick={() => connectSource(draft)}>
          Save channel
        </Button>
      </Card>

      <Card className="space-y-3">
        <p className="text-sm font-medium">Clear sandbox</p>
        <p className="text-sm text-muted">
          Drops pools, moments, seats, and vision on this browser. The session stops. Your sign-in stays.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={confirm ? "default" : "outline"}
            onClick={() => {
              if (!confirm) {
                setConfirm(true);
                return;
              }
              reset();
              setConfirm(false);
            }}
          >
            {confirm ? "Confirm clear" : "Clear sandbox"}
          </Button>
          {confirm ? (
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
          ) : null}
        </div>
      </Card>

      <Link to="/pulse" className={linkOutline}>
        Pulse
      </Link>
    </div>
  );
}
