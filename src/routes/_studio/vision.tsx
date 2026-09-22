import { createFileRoute } from "@tanstack/react-router";
import { QuietPage } from "@/components/quiet-page";

export const Route = createFileRoute("/_studio/vision")({
  component: () => (
    <QuietPage
      kicker="Vision AI"
      title="Evidence pipeline"
      body="Vision is not wired into Pulse propose. This page does not call the vision function, so it cannot crash the studio."
    />
  ),
});
