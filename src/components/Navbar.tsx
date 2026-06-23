"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Creators", href: "/#creators" },
  { label: "SMEs", href: "/#smes" },
  { label: "eMagazine", href: "/#emag" },
  { label: "Events", href: "/events" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-fog/10 bg-pine-deep/95 backdrop-blur-md">
      <div className="flex h-[72px] w-full items-center px-6 md:px-10">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/images/logos/aya-baguio.jpg"
            alt="AYA Baguio"
            className="h-9 w-9 rounded-md object-contain"
            style={{ background: 'transparent' }}
          />
          <span className="font-display text-xl text-fog">
            <em className="italic text-gold-light">As You Are</em> Baguio
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="ml-auto hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-fog/60 transition-colors hover:text-fog"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#join"
            className="rounded-sm bg-gold px-6 py-2 font-mono text-[0.65rem] font-medium uppercase tracking-[0.14em] text-pine-deep transition-colors hover:bg-gold-light"
          >
            Join Community
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="ml-auto flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label="Toggle menu"
        >
          <span className={`block h-px w-6 bg-fog transition-all ${open ? "translate-y-[5px] rotate-45" : ""}`} />
          <span className={`block h-px w-6 bg-fog transition-all ${open ? "opacity-0" : ""}`} />
          <span className={`block h-px w-6 bg-fog transition-all ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-fog/10 bg-pine-deep px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-fog/70 transition-colors hover:bg-white/5 hover:text-fog"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#join"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-sm bg-gold px-6 py-3 text-center font-mono text-[0.65rem] font-medium uppercase tracking-[0.14em] text-pine-deep transition-colors hover:bg-gold-light"
            >
              Join Community
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
