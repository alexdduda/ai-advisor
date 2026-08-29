import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await supabase.auth.signInWithOtp({ email });
    setSent(true);
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 pt-24 text-center">
      <h1 className="font-display text-3xl font-bold">Sign in</h1>
      <p className="mt-2 text-white/60">We'll email you a magic link. No password to remember.</p>
      {sent ? (
        <p className="mt-8 rounded-2xl glass px-6 py-4 text-gold">Check your inbox for the link.</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 w-full space-y-3">
          <input
            type="email"
            required
            placeholder="you@school.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 outline-none focus:border-magenta"
          />
          <button className="w-full rounded-xl bg-gradient-to-r from-violet to-magenta py-3 font-semibold shadow-lg shadow-magenta/30">
            Send magic link
          </button>
        </form>
      )}
    </div>
  );
}
