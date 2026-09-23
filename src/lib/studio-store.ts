import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StingerKey } from "@/lib/stingers";

export type { StingerKey };

export type AgentMode = "OFF" | "SUGGEST" | "APPROVAL_REQUIRED" | "AUTO_PUBLISH";
export type Side = "a" | "b";

export interface DetectedMoment {
  id: string;
  description: string;
  confidence: number;
  status: "under_review" | "confirmed" | "rejected";
}

export interface VisionHit {
  id: string;
  label: string;
  detail: string;
  confidence: number;
  proposed: boolean;
}
export interface DraftReview {
  id: string;
  prompt: string;
  explanation: string;
  status: "pending" | "approved" | "rejected";
}

export interface StingerKit {
  open: boolean;
  settle: boolean;
  vote: boolean;
}

export type SeatRole = "producer" | "mod";

export interface Seat {
  id: string;
  name: string;
  role: SeatRole;
}

export interface Pool {
  id: string;
  title: string;
  question: string;
  status: "live" | "settled";
  aLabel: string;
  bLabel: string;
  aStake: number;
  bStake: number;
  aVotes: number;
  bVotes: number;
  winner: Side | null;
}

interface StudioState {
  demoBanner: boolean;
  channel: string;
  sourceConnected: boolean;
  onboarded: boolean;
  onboardingStep: number;
  mode: AgentMode;
  sessionLive: boolean;
  moments: DetectedMoment[];
  reviews: DraftReview[];
  pools: Pool[];
  vision: VisionHit[];
  stingers: StingerKit;
  seats: Seat[];
  dismissDemo: () => void;
  connectSource: (channel: string) => void;
  setOnboardingStep: (step: number) => void;
  setMode: (mode: AgentMode) => void;
  startSession: () => void;
  stopSession: () => void;
  simulateMoment: () => void;
  reviewMoment: (id: string, decision: "confirmed" | "rejected") => void;
  reviewDraft: (id: string, approve: boolean) => void;
  createPool: (title: string, question: string) => void;
  castVote: (poolId: string, side: Side, amount: number) => void;
  settlePool: (poolId: string, winner: Side) => void;
  goLive: () => void;
  crowdTick: () => void;
  captureFrame: () => void;
  proposeVision: (id: string) => void;
  pullEvidence: () => void;
  setStinger: (key: StingerKey, armed: boolean) => void;
  addSeat: (name: string, role: SeatRole) => void;
  removeSeat: (id: string) => void;
  reset: () => void;
}

function uid() {
  return crypto.randomUUID();
}

export function channelSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

export function draftPrompt(description: string) {
  const text = description.trim();
  if (!text) return "Who takes the next round?";
  return `Who takes the next round after: ${text.toLowerCase()}?`;
}

const VISION_FRAMES = [
  {
    label: "Kill feed spike",
    detail: "Four eliminations in 11 seconds. Interaction-worthy, not a settle.",
    confidence: 0.93,
  },
  {
    label: "Overtime locked",
    detail: "Score bug flipped. Outcome is still open.",
    confidence: 0.88,
  },
  {
    label: "1v1 utility empty",
    detail: "Player cam on both sides with no utility left.",
    confidence: 0.81,
  },
  {
    label: "Chat velocity spike",
    detail: "Chat is 6× baseline on a clutch line.",
    confidence: 0.76,
  },
  {
    label: "Bomb timer under 8s",
    detail: "Round clock is inside the plant window.",
    confidence: 0.9,
  },
];

const SAMPLE_MOMENTS = [
  {
    description: "Clutch 1v1 in final circle — interaction-worthy stakes",
    confidence: 0.91,
  },
  {
    description: "Comeback window after reverse sweep setup",
    confidence: 0.78,
  },
  {
    description: "Overtime starting — unresolved outcome",
    confidence: 0.86,
  },
];

function makePool(title: string, question: string): Pool {
  return {
    id: uid(),
    title,
    question,
    status: "live",
    aLabel: "Clutch",
    bLabel: "Fold",
    aStake: 0,
    bStake: 0,
    aVotes: 0,
    bVotes: 0,
    winner: null,
  };
}

const INITIAL = {
  demoBanner: true,
  channel: "",
  sourceConnected: false,
  onboarded: false,
  onboardingStep: 0,
  mode: "OFF" as AgentMode,
  sessionLive: false,
  moments: [] as DetectedMoment[],
  reviews: [] as DraftReview[],
  pools: [] as Pool[],
  vision: [] as VisionHit[],
  stingers: { open: true, settle: true, vote: false },
  seats: [] as Seat[],
};

export function poolTotal(p: Pool) {
  return p.aStake + p.bStake;
}

export function creatorShare(p: Pool) {
  return Math.round(poolTotal(p) * 0.15);
}

export function winnerShare(p: Pool) {
  return poolTotal(p) - creatorShare(p);
}

export function houseRecord(pools: Pool[]) {
  let a = 0;
  let b = 0;
  for (const p of pools) {
    if (p.status !== "settled" || !p.winner) continue;
    if (p.winner === "a") a += 1;
    else b += 1;
  }
  return { a, b };
}

export const useStudio = create<StudioState>()(
  persist(
    (set, get) => ({
      ...INITIAL,
      dismissDemo: () => set({ demoBanner: false }),
      connectSource: (channel) => {
        const name = channelSlug(channel);
        if (!name) return;
        set({ channel: name, sourceConnected: true });
      },
      setOnboardingStep: (onboardingStep) => set({ onboardingStep }),
      setMode: (mode) => set({ mode }),
      startSession: () => {
        if (!get().sourceConnected) return;
        set({ sessionLive: true, onboarded: true });
      },
      stopSession: () => set({ sessionLive: false }),
      goLive: () => {
        const channel = get().channel.trim() || "studio";
        set({
          channel,
          sourceConnected: true,
          onboarded: true,
          onboardingStep: 7,
          mode: "AUTO_PUBLISH",
          sessionLive: true,
        });
        if (!get().pools.some((p) => p.status === "live")) get().simulateMoment();
      },
      simulateMoment: () => {
        const { mode, sessionLive, sourceConnected } = get();
        if (!sourceConnected || !sessionLive || mode === "OFF") return;
        const sample = SAMPLE_MOMENTS[Math.floor(Math.random() * SAMPLE_MOMENTS.length)];
        const moment: DetectedMoment = {
          id: uid(),
          description: sample.description,
          confidence: sample.confidence,
          status: mode === "AUTO_PUBLISH" ? "confirmed" : "under_review",
        };
        if (mode === "AUTO_PUBLISH") {
          if (get().pools.some((p) => p.status === "live")) {
            set({ moments: [moment, ...get().moments].slice(0, 12) });
            return;
          }
          const prompt = draftPrompt(moment.description);
          set({
            moments: [moment, ...get().moments].slice(0, 12),
            reviews: [
              {
                id: uid(),
                prompt,
                explanation: "Auto-published from the live session. Settlement stays with you.",
                status: "approved" as const,
              },
              ...get().reviews,
            ],
            pools: [makePool("Pulse live", prompt), ...get().pools].slice(0, 20),
          });
          return;
        }
        set({
          moments: [...get().moments.filter((m) => m.status === "under_review"), moment].slice(-12),
        });
      },
      reviewMoment: (id, decision) => {
        const moments = get().moments.map((m) => (m.id === id ? { ...m, status: decision } : m));
        let reviews = get().reviews;
        if (decision === "confirmed") {
          const m = get().moments.find((x) => x.id === id);
          reviews = [
            {
              id: uid(),
              prompt: m ? draftPrompt(m.description) : draftPrompt(""),
              explanation: "Drafted from a confirmed moment. Evidence window is the current session.",
              status: "pending" as const,
            },
            ...reviews,
          ];
        }
        set({ moments, reviews });
      },
      reviewDraft: (id, approve) => {
        const reviews = get().reviews.map((r) =>
          r.id === id ? { ...r, status: (approve ? "approved" : "rejected") as DraftReview["status"] } : r,
        );
        let pools = get().pools;
        if (approve) {
          const draft = get().reviews.find((r) => r.id === id);
          if (draft) pools = [makePool("Pulse moment", draft.prompt), ...pools].slice(0, 20);
        }
        set({ reviews, pools });
      },
      createPool: (title, question) => {
        const t = title.trim();
        const q = question.trim();
        if (!t || !q) return;
        set({ pools: [makePool(t, q), ...get().pools].slice(0, 20) });
      },
      castVote: (poolId, side, amount) => {
        const n = Math.max(1, Math.round(amount));
        set({
          pools: get().pools.map((p) => {
            if (p.id !== poolId || p.status !== "live") return p;
            if (side === "a") return { ...p, aStake: p.aStake + n, aVotes: p.aVotes + 1 };
            return { ...p, bStake: p.bStake + n, bVotes: p.bVotes + 1 };
          }),
        });
      },
      settlePool: (poolId, winner) => {
        set({
          pools: get().pools.map((p) =>
            p.id === poolId && p.status === "live" ? { ...p, status: "settled", winner } : p,
          ),
        });
        if (get().mode === "AUTO_PUBLISH" && get().sessionLive) get().simulateMoment();
      },
      crowdTick: () => {
        const live = get().pools.find((p) => p.status === "live");
        if (!live || !get().sessionLive) return;
        if (live.aStake + live.bStake > 2400) return;
        const side: Side = Math.random() < 0.52 ? "a" : "b";
        const amount = [10, 15, 25, 50][Math.floor(Math.random() * 4)];
        get().castVote(live.id, side, amount);
      },
      captureFrame: () => {
        const { sourceConnected, sessionLive, vision } = get();
        if (!sourceConnected || !sessionLive) return;
        const frame = VISION_FRAMES[vision.length % VISION_FRAMES.length];
        const hit: VisionHit = { id: uid(), ...frame, proposed: false };
        set({ vision: [hit, ...vision].slice(0, 8) });
      },
      proposeVision: (id) => {
        const hit = get().vision.find((v) => v.id === id);
        if (!hit || hit.proposed) return;
        const moment: DetectedMoment = {
          id: uid(),
          description: `${hit.label} — ${hit.detail}`,
          confidence: hit.confidence,
          status: "under_review",
        };
        set({
          vision: get().vision.map((v) => (v.id === id ? { ...v, proposed: true } : v)),
          moments: [moment, ...get().moments].slice(0, 12),
        });
      },
      pullEvidence: () => {
        if (!get().sourceConnected || !get().sessionLive) {
          const channel = get().channel.trim() || "studio";
          set({ channel, sourceConnected: true, sessionLive: true, onboarded: true });
        }
        get().captureFrame();
        const newest = get().vision[0];
        if (newest && !newest.proposed) get().proposeVision(newest.id);
      },
      setStinger: (key, armed) => set({ stingers: { ...get().stingers, [key]: armed } }),
      addSeat: (name, role) => {
        const cleaned = name.trim().slice(0, 32);
        if (!cleaned || cleaned.toLowerCase() === "kinggunn") return;
        const seats = get().seats;
        if (seats.length >= 4) return;
        if (seats.some((seat) => seat.name.toLowerCase() === cleaned.toLowerCase())) return;
        set({ seats: [...seats, { id: uid(), name: cleaned, role }] });
      },
      removeSeat: (id) => set({ seats: get().seats.filter((seat) => seat.id !== id) }),
      reset: () => set({ ...INITIAL }),
    }),
    {
      name: "pllay-creator-studio",
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<StudioState>;
        const pools = (p.pools ?? []).map((pool) => ({
          ...pool,
          aLabel: pool.aLabel ?? "Clutch",
          bLabel: pool.bLabel ?? "Fold",
          aStake: pool.aStake ?? 0,
          bStake: pool.bStake ?? 0,
          aVotes: pool.aVotes ?? 0,
          bVotes: pool.bVotes ?? 0,
          winner: pool.winner ?? null,
          status: pool.status === "settled" ? ("settled" as const) : ("live" as const),
        }));
        const vision = (p.vision ?? [])
          .filter((hit) => hit && typeof hit.label === "string" && typeof hit.id === "string")
          .slice(0, 8)
          .map((hit) => ({
            id: hit.id,
            label: hit.label,
            detail: typeof hit.detail === "string" ? hit.detail : "",
            confidence: typeof hit.confidence === "number" ? hit.confidence : 0,
            proposed: hit.proposed === true,
          }));
        const raw = p.stingers;
        const stingers: StingerKit = {
          open: typeof raw?.open === "boolean" ? raw.open : true,
          settle: typeof raw?.settle === "boolean" ? raw.settle : true,
          vote: raw?.vote === true,
        };
        const seats = (p.seats ?? [])
          .filter((seat) => seat && typeof seat.id === "string" && typeof seat.name === "string")
          .slice(0, 4)
          .map((seat) => ({
            id: seat.id,
            name: seat.name.slice(0, 32),
            role: seat.role === "mod" ? ("mod" as const) : ("producer" as const),
          }));
        return { ...current, ...p, pools, vision, stingers, seats };
      },
    },
  ),
);
