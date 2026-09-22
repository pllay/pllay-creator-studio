import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStudio, type AgentMode } from "@/lib/studio-store";

export const Route = createFileRoute("/_studio/pulse/onboarding")({
  component: Onboarding,
});

const STEPS = [
  "Connect",
  "Verify",
  "Live / replay",
  "Categories",
  "Frequency",
  "Topics",
  "Automation",
  "Test",
] as const;

const MODES: { value: AgentMode; label: string; help: string }[] = [
  { value: "OFF", label: "Off", help: "No AI-generated interactions." },
  { value: "SUGGEST", label: "Suggest", help: "Generates drafts only — you publish." },
  { value: "APPROVAL_REQUIRED", label: "Approval required", help: "Drafts route to your queue." },
  { value: "AUTO_PUBLISH", label: "Live", help: "Publishes one sandbox pool. You still settle." },
];

function Onboarding() {
  const studio = useStudio();
  const navigate = useNavigate();
  const [channel, setChannel] = useState(studio.channel);
  const step = studio.onboardingStep;
  const go = (n: number) => studio.setOnboardingStep(Math.max(0, Math.min(STEPS.length - 1, n)));

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <p className="text-xs text-muted">
        {STEPS.map((s, i) => (
          <span key={s} className={i <= step ? "text-fg" : ""}>
            {i > 0 ? " → " : ""}
            {s}
          </span>
        ))}
      </p>
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step]}</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 0 ? (
            <div className="space-y-3">
              <Label htmlFor="channel">Twitch channel</Label>
              <Input
                id="channel"
                value={channel}
                placeholder="your-channel-name"
                onChange={(e) => setChannel(e.target.value)}
              />
              <Button
                disabled={!channel.trim()}
                onClick={() => {
                  studio.connectSource(channel);
                  go(1);
                }}
              >
                Connect
              </Button>
            </div>
          ) : null}
          {step === 1 ? (
            <div className="space-y-3 text-sm text-muted">
              <p>Ownership stays pending until an admin confirms. You can keep setting policy.</p>
              <p className="font-mono text-fg">{studio.channel || "—"} · pending</p>
            </div>
          ) : null}
          {step === 2 ? (
            <p className="text-sm text-muted">Live and replay are both enabled for this sandbox source.</p>
          ) : null}
          {step === 3 ? (
            <p className="text-sm text-muted">Default categories: live_prediction, poll, audience_decision.</p>
          ) : null}
          {step === 4 ? (
            <p className="text-sm text-muted">Max 6 interactions per hour in the sandbox.</p>
          ) : null}
          {step === 5 ? (
            <p className="text-sm text-muted">Blocked topics stay empty unless you add them later in Settings.</p>
          ) : null}
          {step === 6 ? (
            <div className="grid gap-2">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => studio.setMode(m.value)}
                  className={`rounded-[var(--radius-md)] border p-3 text-left text-sm ${
                    studio.mode === m.value ? "border-accent bg-accent/10" : "border-line"
                  }`}
                >
                  <p className="font-medium">{m.label}</p>
                  <p className="text-xs text-muted">{m.help}</p>
                </button>
              ))}
            </div>
          ) : null}
          {step === 7 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted">Go live to auto-publish a sandbox pool. Settlement stays with you.</p>
              <Button
                onClick={() => {
                  studio.goLive();
                  void navigate({ to: "/pulse" });
                }}
              >
                Go live
              </Button>
            </div>
          ) : null}
          <div className="flex justify-between pt-2">
            <Button variant="ghost" disabled={step === 0} onClick={() => go(step - 1)}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button variant="outline" onClick={() => go(step + 1)} disabled={step === 0 && !studio.sourceConnected}>
                Next
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
