import { useEffect, useRef } from "react";
import { playIfUnlocked, type StingerKey } from "@/lib/stingers";
import { useStudio, type Pool } from "@/lib/studio-store";

function signature(pool: Pool) {
  return `${pool.status}:${pool.aVotes}:${pool.bVotes}`;
}

export function StingerEngine() {
  const pools = useStudio((s) => s.pools);
  const kit = useStudio((s) => s.stingers);
  const seen = useRef<Map<string, string> | null>(null);
  const kitRef = useRef(kit);
  kitRef.current = kit;

  useEffect(() => {
    const next = new Map(pools.map((pool) => [pool.id, signature(pool)]));
    const prev = seen.current;
    seen.current = next;
    if (!prev) return;

    let open = false;
    let settle = false;
    let vote = false;
    let settledId: string | null = null;
    for (const [id, sig] of next) {
      const before = prev.get(id);
      if (!before) {
        if (sig.startsWith("live")) open = true;
        else if (sig.startsWith("settled")) {
          settle = true;
          settledId = id;
        }
        continue;
      }
      if (before.startsWith("live") && sig.startsWith("settled")) {
        settle = true;
        settledId = id;
      } else if (before !== sig && before.startsWith("live") && sig.startsWith("live")) vote = true;
    }
    const armed = kitRef.current;
    const pool = settledId ? pools.find((item) => item.id === settledId) : undefined;
    const lock = useStudio.getState().fanLock;
    const fanHit = pool && lock && lock.poolId === pool.id ? pool.winner === lock.side : null;
    const cue: StingerKey | null =
      settle && fanHit === true && armed.hit
        ? "hit"
        : settle && fanHit === false && armed.miss
          ? "miss"
          : settle && armed.settle
            ? "settle"
            : open && armed.open
              ? "open"
              : vote && armed.vote
                ? "vote"
                : null;
    if (cue) playIfUnlocked(cue);
  }, [pools]);

  return null;
}
