import { useEffect } from "react";
import { useStudio } from "@/lib/studio-store";

export function LiveEngine() {
  const sessionLive = useStudio((s) => s.sessionLive);
  const mode = useStudio((s) => s.mode);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const s = useStudio.getState();
      if (!s.sessionLive || s.mode !== "AUTO_PUBLISH") s.goLive();
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!sessionLive || mode === "OFF") return;
    const id = window.setInterval(() => {
      const s = useStudio.getState();
      if (s.mode === "AUTO_PUBLISH" && !s.pools.some((p) => p.status === "live")) s.simulateMoment();
      s.crowdTick();
    }, 3500);
    return () => window.clearInterval(id);
  }, [sessionLive, mode]);

  return null;
}
