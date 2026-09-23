import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export const draftMoment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { label: string; detail: string }) => {
    const label = input.label.trim().slice(0, 120);
    const detail = input.detail.trim().slice(0, 240);
    if (!label) throw new Error("Nothing to draft");
    return { label, detail };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "AI is not available" };

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 80,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You write one live-stream interaction question. Do not pick a winner. Do not settle. One sentence under 140 characters ending in a question mark.",
          },
          { role: "user", content: `Frame: ${data.label}. ${data.detail}` },
        ],
      }),
    });
    if (!res.ok) return { ok: false as const, error: `AI error ${res.status}` };
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = (body.choices?.[0]?.message?.content ?? "").trim().replace(/\s+/g, " ").slice(0, 180);
    if (!text) return { ok: false as const, error: "AI returned nothing" };
    return { ok: true as const, text };
  });
