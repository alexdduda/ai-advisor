import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../contexts/AuthContext";
import { apiGet, apiPost } from "../lib/api";

type Tier = { id: string; name: string; price_cents: number; currency: string; quantity_total: number; quantity_sold: number };
type Ticket = {
  id: string;
  status: string;
  qr_secret: string;
  ticket_tiers: { name: string; price_cents: number; currency: string };
};

const money = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);

export default function Tickets() {
  const { session } = useAuth();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [busyTierId, setBusyTierId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet("/api/event").then((d) => setTiers(d.tiers)).catch(() => {});
  }, []);

  useEffect(() => {
    if (session) apiGet("/api/tickets/mine").then(setMyTickets).catch(() => {});
  }, [session]);

  async function buy(tierId: string) {
    setError(null);
    setBusyTierId(tierId);
    try {
      const { checkout_url } = await apiPost("/api/tickets/checkout", { tier_id: tierId });
      window.location.href = checkout_url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusyTierId(null);
    }
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-6 pt-16 text-center">
        <p className="text-white/70">Sign in to buy a ticket.</p>
        <a href="/login" className="mt-4 inline-block rounded-xl bg-gradient-to-r from-violet to-magenta px-6 py-3 font-semibold">
          Sign in
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 pt-16">
      <h1 className="font-display text-3xl font-bold">Tickets</h1>

      {myTickets.length > 0 && (
        <div className="mt-6 space-y-4">
          {myTickets.map((t) => (
            <div key={t.id} className="rounded-2xl glass p-5 text-center">
              <p className="text-sm uppercase tracking-wide text-white/50">{t.ticket_tiers.name}</p>
              {t.status === "paid" || t.status === "checked_in" ? (
                <>
                  <div className="mx-auto mt-4 w-fit rounded-xl bg-white p-3">
                    <QRCodeSVG value={t.qr_secret} size={160} />
                  </div>
                  <p className={`mt-3 text-sm ${t.status === "checked_in" ? "text-white/40" : "text-gold"}`}>
                    {t.status === "checked_in" ? "Checked in" : "Show this at the door"}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm text-white/50">
                  {t.status === "pending_etransfer" ? "Waiting on e-Transfer confirmation" : "Payment pending"}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 space-y-3">
        {tiers.map((tier) => {
          const soldOut = tier.quantity_sold >= tier.quantity_total;
          return (
            <div key={tier.id} className="flex items-center justify-between rounded-2xl glass p-4">
              <div>
                <p className="font-semibold">{tier.name}</p>
                <p className="text-sm text-white/50">{money(tier.price_cents, tier.currency)}</p>
              </div>
              <button
                disabled={soldOut || busyTierId === tier.id}
                onClick={() => buy(tier.id)}
                className="rounded-xl bg-gradient-to-r from-violet to-magenta px-4 py-2 text-sm font-semibold disabled:opacity-40"
              >
                {soldOut ? "Sold out" : busyTierId === tier.id ? "..." : "Buy"}
              </button>
            </div>
          );
        })}
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </div>
  );
}
