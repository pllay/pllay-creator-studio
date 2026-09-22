import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PoolSplit } from "@/components/pool-split";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStudio } from "@/lib/studio-store";
import { linkOutlineSm } from "@/lib/utils";

export const Route = createFileRoute("/_studio/predictions")({
  component: Predictions,
});

function Predictions() {
  const pools = useStudio((s) => s.pools);
  const createPool = useStudio((s) => s.createPool);
  const settlePool = useStudio((s) => s.settlePool);
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Predictions</p>
      <h1 className="font-display text-3xl font-semibold">Pools</h1>
      <p className="text-sm text-muted">
        Launch a sandbox pool. Approve a Pulse draft to publish one automatically. Settlement is creator-only.
      </p>
      <Card className="space-y-3">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Final circle" />
        <Label htmlFor="question">Question</Label>
        <Input
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Who takes the round?"
        />
        <Button
          disabled={!title.trim() || !question.trim()}
          onClick={() => {
            createPool(title, question);
            setTitle("");
            setQuestion("");
            toast.success("Pool is live in sandbox");
          }}
        >
          Create pool
        </Button>
      </Card>
      {pools.length === 0 ? (
        <p className="text-sm text-muted">No live pools.</p>
      ) : (
        <div className="space-y-3">
          {pools.map((p) => (
            <Card key={p.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{p.title}</p>
                  <p className="text-xs text-muted">{p.question}</p>
                </div>
                <Badge tone={p.status === "live" ? "ok" : "neutral"}>{p.status}</Badge>
              </div>
              <PoolSplit pool={p} />
              {p.status === "live" ? (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => settlePool(p.id, "a")}>
                    Settle {p.aLabel}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => settlePool(p.id, "b")}>
                    Settle {p.bLabel}
                  </Button>
                  <Link to="/fan" className={linkOutlineSm}>
                    Open as fan
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-ok">Winner {p.winner === "a" ? p.aLabel : p.bLabel}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
