import { useEffect, useRef } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getFanBoard, saveFanBoard } from "@/lib/fan-board";
import { YOU_FAN, useStudio, type FanResult } from "@/lib/studio-store";

export function FanBoardSync() {
  const { user, isPending } = useCurrentUserState();
  const fanName = useStudio((s) => s.fanName);
  const results = useStudio((s) => s.fanResults);
  const ready = useRef(false);

  useEffect(() => {
    if (isPending || !user) return;
    let cancel = false;
    ready.current = false;
    void getFanBoard()
      .then((board) => {
        if (cancel) return;
        if (board.name || board.results.length > 0) {
          const remote: FanResult[] = board.results.map((row) => ({ ...row, fanId: YOU_FAN }));
          useStudio.getState().applyRemoteFan(board.name || useStudio.getState().fanName, remote);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancel) ready.current = true;
      });
    return () => {
      cancel = true;
    };
  }, [user, isPending]);

  useEffect(() => {
    if (!user || !ready.current) return;
    const handle = window.setTimeout(() => {
      const state = useStudio.getState();
      const mine = state.fanResults
        .filter((row) => row.fanId === YOU_FAN)
        .map((row) => ({
          id: row.id,
          poolId: row.poolId,
          question: row.question,
          side: row.side,
          sideLabel: row.sideLabel,
          stake: row.stake,
          hit: row.hit,
          name: row.name,
        }));
      void saveFanBoard({ data: { name: state.fanName || "Fan", results: mine } }).catch(() => undefined);
    }, 500);
    return () => window.clearTimeout(handle);
  }, [user, fanName, results]);

  return null;
}
