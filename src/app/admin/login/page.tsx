"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-pine-deep px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="font-display text-2xl text-fog">
            <em className="italic text-gold-light">AYA</em> Admin
          </div>
          <p className="mt-2 text-sm text-fog/50">Sign in to manage events & registrations</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-fog/10 bg-white/5 p-6">
          <div>
            <label className="mb-1.5 block font-mono text-[0.6rem] uppercase tracking-[0.1em] text-fog/50">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-fog/15 bg-white/5 px-4 py-2.5 text-sm text-fog outline-none focus:border-gold/50"
              placeholder="admin@destinevents.biz"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-[0.6rem] uppercase tracking-[0.1em] text-fog/50">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-fog/15 bg-white/5 px-4 py-2.5 text-sm text-fog outline-none focus:border-gold/50"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-md border border-terra/30 bg-terra/10 p-3 text-sm text-terra">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-gold px-6 py-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-pine-deep transition-colors hover:bg-gold-light disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-fog/30">
          Admin accounts are created in Supabase Dashboard → Authentication → Users
        </p>
      </div>
    </main>
  );
}
