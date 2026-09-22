import { createFileRoute } from "@tanstack/react-router";
import { PoolSplit } from "@/components/pool-split";
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
  const sessionLive = useStudio((s) => s.sessionLive);
  const pools = useStudio((s) => s.pools);
  const current =
    pools.find((p) => p.id === prediction) ?? pools.find((p) => p.status === "live") ?? pools[0];

  return (
    <main className="flex min-h-dvh flex-col items-center justify-end bg-transparent p-6 sm:p-8">
      <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-line bg-surface/90 p-4">
        <div className="flex items-center justify-between">
          <p className="font-display text-sm font-semibold tracking-[0.18em]">PLLAY</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
            {slug} · {sessionLive ? "live" : "idle"}
          </p>
        </div>
        {current ? (
          <>
            <p className="mt-3 font-display text-2xl font-semibold">{current.question}</p>
            <div className="mt-3">
              <PoolSplit pool={current} compact />
            </div>
            {current.status === "settled" ? (
              <p className="mt-2 text-xs text-ok">
                Settled · {current.winner === "a" ? current.aLabel : current.bLabel}
              </p>
            ) : (
              <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-subtle">Open · 15% creator</p>
            )}
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">No approved interaction yet.</p>
        )}
      </div>
    </main>
  );
}
