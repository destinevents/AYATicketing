"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/events", label: "Events", icon: "📅" },
  { href: "/admin/attendees", label: "Attendees (CRM)", icon: "👥" },
  { href: "/admin/email", label: "Email Marketing", icon: "📧" },
  { href: "/admin/promo", label: "Promo Codes", icon: "🎟️" },
  { href: "/admin/sponsors", label: "Sponsors", icon: "🤝" },
  { href: "/admin/checkin", label: "Check-In", icon: "✅" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const navItems = (
    <>
      <div className="mb-8 px-2 font-display text-lg text-fog">
        <em className="italic text-gold-light">AYA</em> Admin
      </div>
      <nav className="flex-1 space-y-1">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                active ? "bg-gold/15 text-gold-light" : "text-fog/60 hover:bg-white/5 hover:text-fog"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-fog/10 pt-4">
        <Link
          href="/events"
          target="_blank"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-fog/60 transition-colors hover:bg-white/5 hover:text-fog"
        >
          🌐 View Public Site
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-fog/60 transition-colors hover:bg-white/5 hover:text-fog"
        >
          🚪 Log Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-fog/10 bg-pine-deep px-4 md:hidden">
        <span className="font-display text-base text-fog">
          <em className="italic text-gold-light">AYA</em> Admin
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
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile slide-in sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-fog/10 bg-pine-deep px-4 py-6 transition-transform duration-200 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navItems}
      </aside>

      {/* Desktop sidebar (always visible) */}
      <aside className="hidden h-screen w-60 flex-shrink-0 flex-col border-r border-fog/10 bg-pine-deep px-4 py-6 md:flex">
        {navItems}
      </aside>
    </>
  );
}
