import { useEffect } from "react";
import { useStudio } from "@/lib/studio-store";

export function LiveEngine() {
  const sessionLive = useStudio((s) => s.sessionLive);
  const mode = useStudio((s) => s.mode);

  useEffect(() => {
    let cancel = false;
    let started = false;
    const boot = () => {
      if (cancel || started) return;
      started = true;
      const s = useStudio.getState();
      if (!s.sessionLive || s.mode !== "AUTO_PUBLISH") s.goLive();
    };
    if (useStudio.persist.hasHydrated()) boot();
    const unsub = useStudio.persist.onFinishHydration(boot);
    return () => {
      cancel = true;
      unsub();
    };
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
