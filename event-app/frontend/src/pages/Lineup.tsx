import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

type Slot = { id: string; artist_name: string; bio?: string; stage?: string; set_start: string; set_end?: string };

export default function Lineup() {
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    apiGet("/api/event").then((d) => setSlots(d.lineup)).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-md px-6 pt-16">
      <h1 className="font-display text-3xl font-bold">Lineup</h1>
      <div className="mt-6 space-y-3">
        {slots.map((slot) => (
          <div key={slot.id} className="rounded-2xl card p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg font-semibold">{slot.artist_name}</h2>
              <span className="text-xs text-gold">
                {new Date(slot.set_start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </span>
            </div>
            {slot.stage && <p className="text-xs uppercase tracking-wide text-white/40">{slot.stage}</p>}
            {slot.bio && <p className="mt-2 text-sm text-white/60">{slot.bio}</p>}
          </div>
        ))}
        {slots.length === 0 && <p className="text-white/50">Lineup drops soon.</p>}
      </div>
    </div>
  );
}
