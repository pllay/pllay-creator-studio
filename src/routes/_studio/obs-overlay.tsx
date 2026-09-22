import { createFileRoute } from "@tanstack/react-router";
import { QuietPage } from "@/components/quiet-page";

export const Route = createFileRoute("/_studio/obs-overlay")({
  component: () => (
    <QuietPage
      kicker="OBS Overlay"
      title="Browser source"
      body="Use Overlay Control for the signed URL. This page is a preview stub, not a second overlay renderer."
    />
  ),
});
