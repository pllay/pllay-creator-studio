import { createFileRoute } from "@tanstack/react-router";
import { OverlayCard, useStreamCard } from "@/components/overlay-card";
import { useStudio } from "@/lib/studio-store";

export const Route = createFileRoute("/overlay/$slug")({
  validateSearch: (search: Record<string, unknown>) => ({
    prediction: typeof search.prediction === "string" ? search.prediction : undefined,
  }),
  component: OverlayPreview,
});

function OverlayPreview() {
  const { slug } = Route.useParams();
  const { prediction } = Route.useSearch();
  const pools = useStudio((s) => s.pools);
  const stream = useStreamCard();
  const pool = (prediction ? pools.find((item) => item.id === prediction) : undefined) ?? stream.pool;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-end bg-transparent p-6 sm:p-8">
      <div className="w-full max-w-md">
        <OverlayCard slug={slug} pool={pool} sessionLive={stream.sessionLive} fanLock={stream.fanLock} />
      </div>
    </main>
  );
}
