"use client";

import { useState } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed left-0 right-0 top-0 z-[200] flex h-14 items-center gap-8 border-b border-white/[0.12] bg-pine-deep/96 px-8 backdrop-blur-md">
      <div className="font-display text-[1.15rem] text-fog">
        <em className="italic text-gold-light">As You Are</em> Baguio
      </div>

      <div className="ml-auto hidden items-center gap-7 md:flex">
        <a href="#creators" className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-fog/60 transition-colors hover:text-fog">Creators</a>
        <a href="#smes" className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-fog/60 transition-colors hover:text-fog">SMEs</a>
        <a href="#emag" className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-fog/60 transition-colors hover:text-fog">eMagazine</a>
        <a href="#events" className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-fog/60 transition-colors hover:text-fog">Events</a>
        <a href="#join" className="rounded-sm bg-gold px-5 py-[7px] font-mono text-[0.58rem] font-medium uppercase tracking-[0.14em] text-pine-deep transition-colors hover:bg-gold-light">
          Join Community
        </a>
      </div>

      <button className="ml-auto flex flex-col gap-[5px] p-1 md:hidden" onClick={() => setOpen(!open)}>
        <span className="block h-[1.5px] w-[22px] bg-fog transition-all" />
        <span className="block h-[1.5px] w-[22px] bg-fog transition-all" />
        <span className="block h-[1.5px] w-[22px] bg-fog transition-all" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-14 flex flex-col gap-4 border-b border-white/[0.12] bg-pine-deep px-8 py-4 md:hidden">
          <a href="#creators" className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-fog/60" onClick={() => setOpen(false)}>Creators</a>
          <a href="#smes" className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-fog/60" onClick={() => setOpen(false)}>SMEs</a>
          <a href="#emag" className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-fog/60" onClick={() => setOpen(false)}>eMagazine</a>
          <a href="#events" className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-fog/60" onClick={() => setOpen(false)}>Events</a>
          <a href="#join" className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-gold-light" onClick={() => setOpen(false)}>Join Community</a>
        </div>
      )}
    </nav>
  );
}
