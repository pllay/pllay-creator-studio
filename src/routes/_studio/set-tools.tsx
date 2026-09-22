import { createFileRoute } from "@tanstack/react-router";
import { QuietPage } from "@/components/quiet-page";

export const Route = createFileRoute("/_studio/set-tools")({
  component: () => (
    <QuietPage kicker="Set Tools" title="Sound kit" body="Audio stingers stay local to overlay settings. Nothing loads from a missing table." />
  ),
});
