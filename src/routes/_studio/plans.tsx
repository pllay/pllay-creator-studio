import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_studio/plans")({
  component: Plans,
});

function Plans() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Plans</p>
      <h1 className="font-display text-3xl font-semibold">Free during beta</h1>
      <p className="text-sm text-muted">
        Full Pro + Studio toolkit while we are in beta. No card. Paid plans only after you earn here.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <p className="font-display text-lg font-semibold">Pro</p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            <li>Advanced analytics</li>
            <li>Priority support</li>
          </ul>
        </Card>
        <Card>
          <p className="font-display text-lg font-semibold">Studio</p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            <li>Everything in Pro</li>
            <li>Creator API</li>
            <li>Team seats</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
