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
  hit: boolean;
  miss: boolean;
}

export type SeatRole = "producer" | "mod";

export const YOU_FAN = "you";

export const CROWD: { id: string; name: string }[] = [
  { id: "crowd:ash", name: "Ash" },
  { id: "crowd:rio", name: "Rio" },
  { id: "crowd:ken", name: "Ken" },
  { id: "crowd:lux", name: "Lux" },
];

export interface FanLock {
  poolId: string;
  side: Side;
  stake: number;
  name: string;
  fanId: string;
}

export interface Seat {
  id: string;
  name: string;
  role: SeatRole;
  code: string;
  status: "invited" | "joined";
}

export interface FanResult {
  id: string;
  fanId: string;
  poolId: string;
  question: string;
  side: Side;
  sideLabel: string;
  stake: number;
  hit: boolean;
  name: string;
}

export interface CrowdLock {
  fanId: string;
  name: string;
  poolId: string;
  side: Side;
  stake: number;
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
  fanLock: FanLock | null;
  fanResults: FanResult[];
  fanName: string;
  crowdLocks: CrowdLock[];
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
  lockIn: (poolId: string, side: Side, stake: number) => void;
  setFanName: (name: string) => void;
  applyRemoteFan: (name: string, results: FanResult[]) => void;
  settlePool: (poolId: string, winner: Side) => void;
  goLive: () => void;
  crowdTick: () => void;
  captureFrame: () => void;
  proposeVision: (id: string) => void;
  proposeVisionText: (id: string, description: string) => void;
  rewriteMoment: (id: string, description: string) => void;
  pullEvidence: () => void;
  setStinger: (key: StingerKey, armed: boolean) => void;
  addSeat: (name: string, role: SeatRole) => void;
  acceptInvite: (code: string) => void;
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
  stingers: { open: true, settle: true, vote: false, hit: true, miss: true },
  seats: [] as Seat[],
  fanLock: null as FanLock | null,
  fanResults: [] as FanResult[],
  fanName: "Fan",
  crowdLocks: [] as CrowdLock[],
};

export function fanDisplayName(value: string) {
  const text = value.trim().slice(0, 24);
  return text || "Fan";
}

export function fanStandings(results: FanResult[]) {
  const map = new Map<
    string,
    {
      fanId: string;
      name: string;
      crowd: boolean;
      hits: number;
      misses: number;
      stake: number;
      sideLabel: string;
      question: string;
    }
  >();
  for (const row of results) {
    const current = map.get(row.fanId);
    if (!current) {
      map.set(row.fanId, {
        fanId: row.fanId,
        name: row.name,
        crowd: row.fanId.startsWith("crowd:"),
        hits: row.hit ? 1 : 0,
        misses: row.hit ? 0 : 1,
        stake: row.stake,
        sideLabel: row.sideLabel,
        question: row.question,
      });
      continue;
    }
    if (row.hit) current.hits += 1;
    else current.misses += 1;
    current.stake += row.stake;
  }
  return [...map.values()].sort(
    (a, b) => b.hits - a.hits || a.misses - b.misses || a.name.localeCompare(b.name),
  );
}

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
      lockIn: (poolId, side, stake) => {
        const n = Math.max(1, Math.round(stake));
        const pool = get().pools.find((p) => p.id === poolId && p.status === "live");
        if (!pool) return;
        get().castVote(poolId, side, n);
        set({ fanLock: { poolId, side, stake: n, name: fanDisplayName(get().fanName), fanId: YOU_FAN } });
      },
      setFanName: (name) => {
        const cleaned = name.trim().slice(0, 24);
        if (!cleaned) {
          set({ fanName: "" });
          return;
        }
        const lock = get().fanLock;
        set({
          fanName: cleaned,
          fanResults: get().fanResults.map((row) => (row.fanId === YOU_FAN ? { ...row, name: cleaned } : row)),
          ...(lock ? { fanLock: { ...lock, name: cleaned } } : {}),
        });
      },
      applyRemoteFan: (name, remote) => {
        const shown = fanDisplayName(name);
        const localMine = get().fanResults.filter((row) => row.fanId === YOU_FAN);
        const others = get().fanResults.filter((row) => row.fanId !== YOU_FAN);
        const byId = new Map(remote.filter((row) => row.fanId === YOU_FAN).map((row) => [row.id, { ...row, name: shown }]));
        for (const row of localMine) if (!byId.has(row.id)) byId.set(row.id, { ...row, name: shown });
        const lock = get().fanLock;
        set({
          fanName: shown,
          fanResults: [...byId.values(), ...others].slice(0, 48),
          ...(lock && lock.fanId === YOU_FAN ? { fanLock: { ...lock, name: shown } } : {}),
        });
      },
      settlePool: (poolId, winner) => {
        const pool = get().pools.find((p) => p.id === poolId && p.status === "live");
        if (!pool) return;
        const lock = get().fanLock;
        const yours =
          lock && lock.poolId === pool.id
            ? [
                {
                  id: uid(),
                  fanId: YOU_FAN,
                  poolId,
                  question: pool.question,
                  side: lock.side,
                  sideLabel: lock.side === "a" ? pool.aLabel : pool.bLabel,
                  stake: lock.stake,
                  hit: lock.side === winner,
                  name: fanDisplayName(lock.name),
                },
              ]
            : [];
        const crowd = get()
          .crowdLocks.filter((row) => row.poolId === pool.id)
          .map((row) => ({
            id: uid(),
            fanId: row.fanId,
            poolId,
            question: pool.question,
            side: row.side,
            sideLabel: row.side === "a" ? pool.aLabel : pool.bLabel,
            stake: row.stake,
            hit: row.side === winner,
            name: row.name,
          }));
        set({
          pools: get().pools.map((p) =>
            p.id === poolId && p.status === "live" ? { ...p, status: "settled", winner } : p,
          ),
          fanResults: [...yours, ...crowd, ...get().fanResults].slice(0, 48),
          crowdLocks: get().crowdLocks.filter((row) => row.poolId !== pool.id),
        });
        if (get().mode === "AUTO_PUBLISH" && get().sessionLive) get().simulateMoment();
      },
      crowdTick: () => {
        const live = get().pools.find((p) => p.status === "live");
        if (!live || !get().sessionLive) return;
        if (live.aStake + live.bStake > 2400) return;
        const side: Side = Math.random() < 0.52 ? "a" : "b";
        const amount = [10, 15, 25, 50][Math.floor(Math.random() * 4)];
        const member = CROWD[get().crowdLocks.length % CROWD.length];
        get().castVote(live.id, side, amount);
        const existing = get().crowdLocks.find((row) => row.poolId === live.id && row.fanId === member.id);
        const crowdLocks = existing
          ? get().crowdLocks.map((row) =>
              row.poolId === live.id && row.fanId === member.id
                ? { ...row, side, stake: row.stake + amount }
                : row,
            )
          : [...get().crowdLocks, { fanId: member.id, name: member.name, poolId: live.id, side, stake: amount }];
        set({ crowdLocks: crowdLocks.slice(-32) });
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
        get().proposeVisionText(id, `${hit.label} — ${hit.detail}`);
      },
      proposeVisionText: (id, description) => {
        const hit = get().vision.find((v) => v.id === id);
        const text = description.trim().slice(0, 180);
        if (!hit || hit.proposed || !text) return;
        const moment: DetectedMoment = {
          id: uid(),
          description: text,
          confidence: hit.confidence,
          status: "under_review",
        };
        set({
          vision: get().vision.map((v) => (v.id === id ? { ...v, proposed: true } : v)),
          moments: [moment, ...get().moments].slice(0, 12),
        });
      },
      rewriteMoment: (id, description) => {
        const text = description.trim().slice(0, 180);
        if (!text) return;
        set({
          moments: get().moments.map((moment) =>
            moment.id === id && moment.status === "under_review" ? { ...moment, description: text } : moment,
          ),
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
        set({
          seats: [
            ...seats,
            { id: uid(), name: cleaned, role, code: uid().slice(0, 8), status: "invited" as const },
          ],
        });
      },
      acceptInvite: (code) => {
        const cleaned = code.trim();
        if (!cleaned) return;
        set({
          seats: get().seats.map((seat) =>
            seat.code === cleaned && seat.status === "invited" ? { ...seat, status: "joined" as const } : seat,
          ),
        });
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
          hit: typeof raw?.hit === "boolean" ? raw.hit : true,
          miss: typeof raw?.miss === "boolean" ? raw.miss : true,
        };
        const seats = (p.seats ?? [])
          .filter((seat) => seat && typeof seat.id === "string" && typeof seat.name === "string")
          .slice(0, 4)
          .map((seat) => ({
            id: seat.id,
            name: seat.name.slice(0, 32),
            role: seat.role === "mod" ? ("mod" as const) : ("producer" as const),
            code: typeof seat.code === "string" && seat.code.trim() ? seat.code.trim().slice(0, 16) : seat.id.slice(0, 8),
            status: seat.status === "invited" ? ("invited" as const) : ("joined" as const),
          }));
        const fanResults = (p.fanResults ?? [])
          .filter(
            (row) =>
              row &&
              typeof row.id === "string" &&
              typeof row.poolId === "string" &&
              typeof row.question === "string" &&
              (row.side === "a" || row.side === "b") &&
              typeof row.hit === "boolean",
          )
          .slice(0, 24)
          .map((row) => ({
            id: row.id,
            poolId: row.poolId,
            question: row.question.slice(0, 180),
            side: row.side,
            stake: typeof row.stake === "number" ? Math.max(1, Math.round(row.stake)) : 1,
            hit: row.hit,
            name: fanDisplayName(typeof row.name === "string" ? row.name : ""),
            fanId: typeof row.fanId === "string" && row.fanId.trim() ? row.fanId.trim().slice(0, 32) : YOU_FAN,
            sideLabel:
              typeof row.sideLabel === "string" && row.sideLabel.trim()
                ? row.sideLabel.trim().slice(0, 24)
                : row.side === "a"
                  ? "Clutch"
                  : "Fold",
          }));
        const crowdLocks = (p.crowdLocks ?? [])
          .filter(
            (row) =>
              row &&
              typeof row.fanId === "string" &&
              typeof row.poolId === "string" &&
              typeof row.name === "string" &&
              (row.side === "a" || row.side === "b"),
          )
          .slice(-32)
          .map((row) => ({
            fanId: row.fanId.slice(0, 32),
            name: row.name.slice(0, 24),
            poolId: row.poolId,
            side: row.side,
            stake: typeof row.stake === "number" ? Math.max(1, Math.round(row.stake)) : 1,
          }));
        const rawLock = p.fanLock;
        const fanLock =
          rawLock &&
          typeof rawLock.poolId === "string" &&
          (rawLock.side === "a" || rawLock.side === "b") &&
          typeof rawLock.stake === "number"
            ? {
                poolId: rawLock.poolId,
                side: rawLock.side,
                stake: Math.max(1, Math.round(rawLock.stake)),
                name: fanDisplayName(typeof rawLock.name === "string" ? rawLock.name : ""),
                fanId: YOU_FAN,
              }
            : null;
        const fanName = typeof p.fanName === "string" ? p.fanName.trim().slice(0, 24) : "Fan";
        return { ...current, ...p, pools, vision, stingers, seats, fanLock, fanResults, fanName, crowdLocks };
      },
    },
  ),
);
