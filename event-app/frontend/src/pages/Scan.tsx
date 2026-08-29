import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { apiPost } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export default function Scan() {
  const { session } = useAuth();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    if (!session) return;
    const scanner = new Html5Qrcode("scan-region");
    scannerRef.current = scanner;
    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        async (decodedText) => {
          if (busyRef.current) return;
          busyRef.current = true;
          try {
            await apiPost("/api/tickets/checkin", { qr_secret: decodedText });
            setResult({ ok: true, message: "Admitted ✓" });
          } catch (e) {
            setResult({ ok: false, message: e instanceof Error ? e.message : "Invalid ticket" });
          } finally {
            setTimeout(() => (busyRef.current = false), 1500);
          }
        },
        () => {}
      )
      .catch(() => setResult({ ok: false, message: "Camera unavailable" }));

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [session]);

  if (!session) {
    return <p className="mx-auto max-w-md px-6 pt-16 text-center text-white/70">Staff sign-in required.</p>;
  }

  return (
    <div className="mx-auto max-w-md px-6 pt-16 text-center">
      <h1 className="font-display text-2xl font-bold">Door check-in</h1>
      <div id="scan-region" className="mx-auto mt-6 overflow-hidden rounded-2xl" />
      {result && (
        <p className={`mt-6 rounded-xl glass px-4 py-3 text-lg font-semibold ${result.ok ? "text-gold" : "text-red-400"}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}
