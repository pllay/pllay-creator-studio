import { createFileRoute } from "@tanstack/react-router";
import { QuietPage } from "@/components/quiet-page";

export const Route = createFileRoute("/_studio/team")({
  component: () => (
    <QuietPage kicker="Team" title="Owner only" body="Team seats are Studio. No invite RPC is called from this preview." />
  ),
});
