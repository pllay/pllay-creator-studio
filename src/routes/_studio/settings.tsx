import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { useStudio } from "@/lib/studio-store";

export const Route = createFileRoute("/_studio/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const channel = useStudio((s) => s.channel);
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Settings</p>
      <h1 className="font-display text-3xl font-semibold">Studio</h1>
      <Card>
        <p className="text-xs uppercase tracking-wider text-subtle">Signed in</p>
        <p className="mt-1 font-medium">kinggunn</p>
        <p className="mt-3 text-xs uppercase tracking-wider text-subtle">Pulse source</p>
        <p className="mt-1 font-mono text-sm">{channel || "None"}</p>
      </Card>
    </div>
  );
}
