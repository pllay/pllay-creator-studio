export type StingerKey = "open" | "settle" | "vote";

let ctx: AudioContext | null = null;
let unlocked = false;

function context() {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function tone(c: AudioContext, freq: number, at: number, dur: number, gain: number) {
  const osc = c.createOscillator();
  const amp = c.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(gain, at + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(amp);
  amp.connect(c.destination);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

function schedule(kind: StingerKey, c: AudioContext) {
  const t = c.currentTime;
  if (kind === "open") {
    tone(c, 523, t, 0.09, 0.06);
    tone(c, 784, t + 0.08, 0.14, 0.05);
    return;
  }
  if (kind === "settle") {
    tone(c, 392, t, 0.18, 0.06);
    tone(c, 262, t + 0.06, 0.22, 0.04);
    return;
  }
  tone(c, 1320, t, 0.045, 0.03);
}

export async function previewStinger(kind: StingerKey) {
  const c = context();
  unlocked = true;
  if (c.state === "suspended") await c.resume();
  schedule(kind, c);
}

export function playIfUnlocked(kind: StingerKey) {
  if (!unlocked || !ctx || ctx.state !== "running") return;
  schedule(kind, ctx);
}
