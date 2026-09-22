import { createFileRoute } from "@tanstack/react-router";
import { QuietPage } from "@/components/quiet-page";

export const Route = createFileRoute("/_studio/support")({
  component: () => (
    <QuietPage kicker="Support" title="Help" body="Pulse path: onboard a channel, Suggest, private session, confirm moments. Overlay Control no longer toasts on a missing username." />
  ),
});
