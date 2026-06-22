"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

function NavIcon({ active }: { active: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" className="flex-shrink-0">
      <rect
        x="1" y="1" width="10" height="10" rx="2"
        fill={active ? "rgba(201,168,76,0.9)" : "none"}
        stroke={active ? "rgba(201,168,76,0.9)" : "rgba(240,237,230,0.25)"}
        strokeWidth="1.5"
      />
    </svg>
  );
}

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/attendees", label: "Attendees" },
  { href: "/admin/email", label: "Email marketing" },
  { href: "/admin/promo", label: "Promo codes" },
  { href: "/admin/sponsors", label: "Sponsors" },
  { href: "/admin/checkin", label: "Check-in" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    // Default to dark; only switch to light if user explicitly chose it
    const saved = localStorage.getItem("admin-theme");
    const isDark = saved !== "light";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("admin-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const navItems = (
    <>
      {/* Logo */}
      <div className="mb-8 px-3">
        <span className="font-display text-xl text-fog">
          <em className="italic text-gold-light">AYA</em>
        </span>
        <span className="ml-2 font-sans text-sm font-medium text-fog/60">Admin</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-0.5 px-2">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-white/10 font-medium text-fog"
                  : "text-fog/50 hover:bg-white/5 hover:text-fog/80"
              }`}
            >
              <NavIcon active={active} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom links */}
      <div className="mt-auto space-y-0.5 border-t border-fog/10 px-2 pt-4">
        {/* Dark / Light mode toggle */}
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-fog/50 transition-colors hover:bg-white/5 hover:text-fog/80"
        >
          <span className="text-base leading-none">{dark ? "☀️" : "🌙"}</span>
          {dark ? "Light mode" : "Dark mode"}
        </button>
        <Link
          href="/events"
          target="_blank"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-fog/40 transition-colors hover:bg-white/5 hover:text-fog/70"
        >
          <NavIcon active={false} />
          View public site
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-fog/40 transition-colors hover:bg-white/5 hover:text-fog/70"
        >
          <NavIcon active={false} />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-fog/10 bg-pine-deep px-4 md:hidden">
        <span className="font-display text-lg text-fog">
          <em className="italic text-gold-light">AYA</em>
          <span className="ml-1.5 text-sm font-normal text-fog/50">Admin</span>
        </span>
        <button
          onClick={() => setOpen(!open)}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5"
          aria-label="Toggle menu"
        >
          <span className={`block h-px w-5 bg-fog transition-all duration-200 ${open ? "translate-y-[5px] rotate-45" : ""}`} />
          <span className={`block h-px w-5 bg-fog transition-all duration-200 ${open ? "opacity-0" : ""}`} />
          <span className={`block h-px w-5 bg-fog transition-all duration-200 ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Mobile slide-in sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-pine-deep px-2 py-6 transition-transform duration-200 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navItems}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-56 flex-shrink-0 flex-col bg-pine-deep px-2 py-6 md:flex">
        {navItems}
      </aside>
    </>
  );
}
