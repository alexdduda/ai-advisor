import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

type EventData = {
  event: { name: string; venue: string; starts_at: string; doors_at: string; description: string };
  going_count: number;
};

function useCountdown(target?: string) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!target) return null;
  const diff = Math.max(0, new Date(target).getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs };
}

export default function Home() {
  const { session } = useAuth();
  const [data, setData] = useState<EventData | null>(null);
  const [going, setGoing] = useState(false);
  const countdown = useCountdown(data?.event.starts_at);

  useEffect(() => {
    apiGet("/api/event").then(setData).catch(() => {});
  }, []);

  async function toggleGoing() {
    if (!session) return;
    const res = await apiPost("/api/feed/going");
    setGoing(res.going);
  }

  return (
    <div className="mx-auto max-w-md px-6 pt-16">
      <p className="text-sm uppercase tracking-[0.3em] text-white/60">Live at {data?.event.venue ?? "your campus"}</p>
      <h1 className="mt-2 font-display text-5xl font-bold leading-[0.95]">PRIMADONIS</h1>
      <p className="mt-3 text-white/70">{data?.event.description ?? "One night. One stage. Everyone you know."}</p>

      {countdown && (
        <div className="mt-8 grid grid-cols-4 gap-2 text-center">
          {[
            ["Days", countdown.days],
            ["Hrs", countdown.hours],
            ["Min", countdown.mins],
            ["Sec", countdown.secs],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-2xl card py-3">
              <div className="font-display text-2xl font-bold">{String(value).padStart(2, "0")}</div>
              <div className="text-[10px] uppercase tracking-wide text-white/50">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <Link
          to="/tickets"
          className="flex-1 rounded-xl bg-white py-3 text-center font-semibold text-ink"
        >
          Get tickets
        </Link>
        <button
          onClick={toggleGoing}
          className="rounded-xl border border-white/20 px-5 py-3 text-sm font-medium hover:bg-white/10"
        >
          {going ? "I'm going ✓" : "I'm going"}
        </button>
      </div>

      {typeof data?.going_count === "number" && (
        <p className="mt-4 text-sm text-white/50">{data.going_count} people already going</p>
      )}
    </div>
  );
}
