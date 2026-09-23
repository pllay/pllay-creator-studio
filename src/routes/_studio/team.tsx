import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStudio, type SeatRole } from "@/lib/studio-store";
import { linkOutline } from "@/lib/utils";

export const Route = createFileRoute("/_studio/team")({
  component: Team,
});

const ROLES: { value: SeatRole; label: string }[] = [
  { value: "producer", label: "Producer" },
  { value: "mod", label: "Mod" },
];

function Team() {
  const seats = useStudio((s) => s.seats);
  const addSeat = useStudio((s) => s.addSeat);
  const removeSeat = useStudio((s) => s.removeSeat);
  const [name, setName] = useState("");
  const [role, setRole] = useState<SeatRole>("producer");
  const full = seats.length >= 4;
  const cleaned = name.trim();
  const duplicate =
    cleaned.toLowerCase() === "kinggunn" ||
    seats.some((seat) => seat.name.toLowerCase() === cleaned.toLowerCase());

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Team</p>
        <h1 className="font-display text-3xl font-semibold">Seats</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Seats stay in this browser. Adding one does not send an invite. You still settle every pool.
        </p>
      </div>

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
                  <p className="text-xs text-muted">{seat.role === "mod" ? "Mod" : "Producer"}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => removeSeat(seat.id)}>
                  Remove
                </Button>
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
          {full ? "4 seats is the preview cap." : `${seats.length} of 4 seats. No email is sent.`}
          {duplicate && cleaned ? " That name is already on the roster." : ""}
        </p>
      </Card>

      <Link to="/plans" className={linkOutline}>
        Plans
      </Link>
    </div>
  );
}
