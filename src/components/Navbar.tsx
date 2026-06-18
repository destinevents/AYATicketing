import Link from "next/link";

const NAV_LINKS = [
  { href: "/#home", label: "Home" },
  { href: "/#community", label: "Community" },
  { href: "/#emagazine", label: "eMagazine" },
  { href: "/#sme-directory", label: "SME Directory" },
  { href: "/#events", label: "Events" },
];

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 h-[72px] border-b border-fog/10 bg-pine-deep/95 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center gap-8 px-6">
        <Link href="/" className="font-display text-xl text-fog">
          <em className="italic text-gold-light">As You Are</em> Baguio
        </Link>
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
            href="/events#upcoming"
            className="rounded-sm bg-gold px-6 py-2 font-mono text-[0.65rem] font-medium uppercase tracking-[0.14em] text-pine-deep transition-colors hover:bg-gold-light"
          >
            Get Tickets
          </Link>
        </div>
      </div>
    </nav>
  );
}
