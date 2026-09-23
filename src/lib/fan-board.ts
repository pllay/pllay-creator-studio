import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export type SavedFanResult = {
  id: string;
  poolId: string;
  question: string;
  side: "a" | "b";
  sideLabel: string;
  stake: number;
  hit: boolean;
  name: string;
};

function cleanName(value: string) {
  const text = value.trim().slice(0, 24);
  return text || "Fan";
}

function cleanResults(input: SavedFanResult[]) {
  return input.slice(0, 24).flatMap((row) => {
    if (!row || typeof row.id !== "string" || typeof row.poolId !== "string" || typeof row.question !== "string") {
      return [];
    }
    if (row.side !== "a" && row.side !== "b") return [];
    return [
      {
        id: row.id.slice(0, 64),
        poolId: row.poolId.slice(0, 64),
        question: row.question.slice(0, 180),
        side: row.side,
        sideLabel: typeof row.sideLabel === "string" && row.sideLabel.trim() ? row.sideLabel.trim().slice(0, 24) : row.side === "a" ? "Clutch" : "Fold",
        stake: typeof row.stake === "number" ? Math.max(1, Math.round(row.stake)) : 1,
        hit: row.hit === true,
        name: cleanName(typeof row.name === "string" ? row.name : ""),
      },
    ];
  });
}

export const getFanBoard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ name: string; results: string }>`
      select name, results from fan_board where user_id = ${context.userId}
    `;
    const row = rows[0];
    if (!row) return { name: "", results: [] as SavedFanResult[] };
    try {
      const parsed = JSON.parse(row.results) as SavedFanResult[];
      return { name: cleanName(row.name), results: cleanResults(Array.isArray(parsed) ? parsed : []) };
    } catch {
      return { name: cleanName(row.name), results: [] as SavedFanResult[] };
    }
  });

export const saveFanBoard = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { name: string; results: SavedFanResult[] }) => ({
    name: cleanName(typeof input?.name === "string" ? input.name : ""),
    results: cleanResults(Array.isArray(input?.results) ? input.results : []),
  }))
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      insert into fan_board (user_id, name, results)
      values (${context.userId}, ${data.name}, ${JSON.stringify(data.results)})
      on conflict (user_id) do update
      set name = excluded.name, results = excluded.results, updated_at = now()
    `;
    return { ok: true as const };
  });
