import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStudio, type SeatRole } from "@/lib/studio-store";
import { linkOutline } from "@/lib/utils";

export const Route = createFileRoute("/_studio/team")({
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search.code === "string" ? search.code : "",
  }),
  component: Team,
});

const ROLES: { value: SeatRole; label: string }[] = [
  { value: "producer", label: "Producer" },
  { value: "mod", label: "Mod" },
];

function Team() {
  const seats = useStudio((s) => s.seats);
  const addSeat = useStudio((s) => s.addSeat);
  const acceptInvite = useStudio((s) => s.acceptInvite);
  const removeSeat = useStudio((s) => s.removeSeat);
  const { code } = Route.useSearch();
  const [name, setName] = useState("");
  const [role, setRole] = useState<SeatRole>("producer");
  const full = seats.length >= 4;
  const cleaned = name.trim();
  const duplicate =
    cleaned.toLowerCase() === "kinggunn" ||
    seats.some((seat) => seat.name.toLowerCase() === cleaned.toLowerCase());
  const invited = code ? seats.find((seat) => seat.code === code) : undefined;

  function copyInvite(seatCode: string) {
    const url = `${window.location.origin}/team?code=${encodeURIComponent(seatCode)}`;
    void navigator.clipboard.writeText(url).then(() => toast.success("Invite link copied"));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Team</p>
        <h1 className="font-display text-3xl font-semibold">Seats</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Add a seat, then copy its invite. Accepting the link joins that seat. You still settle every pool.
        </p>
      </div>

      {invited ? (
        <Card className="space-y-3">
          <p className="text-sm font-medium">{invited.name}</p>
          <p className="text-sm text-muted">
            {invited.status === "joined" ? "This seat is already on the roster." : "This invite is waiting."}
          </p>
          {invited.status === "invited" ? (
            <Button onClick={() => acceptInvite(invited.code)}>Accept invite</Button>
          ) : null}
        </Card>
      ) : null}

      <Card className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">kinggunn</p>
          <p className="text-xs text-muted">Owner · cannot be removed</p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">Owner</p>
      </Card>

      {seats.length === 0 ? (
        <p className="text-sm text-muted">No seats yet.</p>
      ) : (
        <ul className="space-y-2">
          {seats.map((seat) => (
            <li key={seat.id}>
              <Card className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{seat.name}</p>
                  <p className="text-xs text-muted">
                    {seat.role === "mod" ? "Mod" : "Producer"} · {seat.status === "joined" ? "Joined" : "Invited"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="outline" onClick={() => copyInvite(seat.code)}>
                    Copy invite
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => removeSeat(seat.id)}>
                    Remove
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Card className="space-y-3">
        <Label htmlFor="seat-name">Add a seat</Label>
        <Input
          id="seat-name"
          value={name}
          maxLength={32}
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {ROLES.map((item) => (
            <Button
              key={item.value}
              size="sm"
              variant={role === item.value ? "default" : "outline"}
              aria-pressed={role === item.value}
              onClick={() => setRole(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <Button
          disabled={!cleaned || full || duplicate}
          onClick={() => {
            addSeat(cleaned, role);
            setName("");
          }}
        >
          Add seat
        </Button>
        <p className="text-xs text-subtle">
          {full ? "4 seats is the beta cap." : `${seats.length} of 4 seats.`}
          {duplicate && cleaned ? " That name is already on the roster." : ""}
        </p>
      </Card>

      <Link to="/plans" className={linkOutline}>
        Plans
      </Link>
    </div>
  );
}
