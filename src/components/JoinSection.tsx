"use client";

import { useState } from "react";

type JoinType = "creator" | "sme" | "community" | null;

export function JoinSection() {
  const [joinType, setJoinType] = useState<JoinType>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  }

  function handleJoin() {
    if (!name) { showToast("Please enter your name ✦"); return; }
    if (!email || !email.includes("@")) { showToast("Please enter a valid email ✦"); return; }
    showToast(`Welcome to AYA, ${name.split(" ")[0]}! We'll be in touch. 🌿`);
    setName("");
    setEmail("");
    setJoinType(null);
  }

  return (
    <section id="join" className="relative overflow-hidden bg-pine-deep px-8 py-24">
      {/* Watermark */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display font-light italic text-white/[0.02]"
        style={{ fontSize: "clamp(12rem,25vw,22rem)", letterSpacing: "-0.04em", whiteSpace: "nowrap" }}
      >
        AYA
      </div>

      <div className="relative z-10 mx-auto max-w-[700px] text-center">
        <div className="mb-6 flex items-center justify-center gap-3 font-mono text-[0.58rem] uppercase tracking-[0.22em] text-gold-light">
          Join the Movement
        </div>
        <h2 className="mb-6 font-display font-light text-fog" style={{ fontSize: "clamp(2.5rem,5vw,4rem)", lineHeight: 1.1 }}>
          You belong here,<br />
          <em className="italic text-gold-light">as you are.</em>
        </h2>
        <p className="mx-auto mb-10 max-w-[520px] text-[1rem] leading-[1.75] text-fog/60">
          Whether you&apos;re a creator looking to grow, an entrepreneur wanting to be discovered, or a community builder who wants to connect — AYA Baguio is your home. No performance required.
        </p>

        {/* Role selector */}
        <div className="mb-10 flex flex-wrap justify-center gap-6">
          {[
            { val: "creator" as JoinType, emoji: "🎨", label: "I'm a Creator", sub: "Get featured in the directory" },
            { val: "sme" as JoinType, emoji: "🏪", label: "I'm an SME", sub: "List my business" },
            { val: "community" as JoinType, emoji: "🌿", label: "I'm Community", sub: "Just want to connect" },
          ].map((btn) => (
            <button
              key={btn.val}
              onClick={() => setJoinType(btn.val)}
              className={`min-w-[150px] rounded-md border px-6 py-5 text-center transition-all ${
                joinType === btn.val ? "border-gold bg-gold/10" : "border-white/[0.12] hover:border-gold/40 hover:bg-white/[0.04]"
              }`}
            >
              <div className="mb-1.5 text-2xl">{btn.emoji}</div>
              <div className="font-display text-[0.95rem] font-normal text-fog">{btn.label}</div>
              <div className="mt-0.5 text-[0.72rem] text-fog/50">{btn.sub}</div>
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="mx-auto max-w-[500px]">
          <div className="mb-4 flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-w-[200px] flex-1 rounded border border-white/20 bg-white/[0.06] px-[18px] py-3 text-[0.88rem] text-fog outline-none placeholder:text-fog/40 focus:border-white/40"
            />
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-w-[200px] flex-1 rounded border border-white/20 bg-white/[0.06] px-[18px] py-3 text-[0.88rem] text-fog outline-none placeholder:text-fog/40 focus:border-white/40"
            />
          </div>
          <button
            onClick={handleJoin}
            className="w-full max-w-[340px] rounded-sm bg-gold px-6 py-4 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-pine-deep transition-colors hover:bg-gold-light"
          >
            Join the AYA Community →
          </button>
        </div>

        <p className="mt-4 text-[0.75rem] text-fog/30">Free to join. Rooted in faith, authenticity & community. ✦</p>
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded border border-gold/30 bg-pine px-6 py-3 text-[0.82rem] text-fog shadow-lg">
          {toast}
        </div>
      )}
    </section>
  );
}
