import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { linkOutlineSm, linkPrimarySm } from "@/lib/utils";

export function QuietPage({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">{kicker}</p>
      <h1 className="font-display text-3xl font-semibold">{title}</h1>
      <p className="text-sm leading-relaxed text-muted">{body}</p>
      <Card>
        <p className="text-sm text-muted">This surface is stable. It does not call failing APIs.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/pulse" className={linkPrimarySm}>
            Pulse Studio
          </Link>
          <Link to="/" className={linkOutlineSm}>
            Dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}
