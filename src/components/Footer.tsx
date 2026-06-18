import Link from "next/link";

const NAV_LINKS = [
  { href: "/events", label: "Events" },
  { href: "/community", label: "Community" },
  { href: "/emagazine", label: "eMagazine" },
  { href: "/sme-directory", label: "SME Directory" },
];

export function Footer() {
  return (
    <footer className="bg-ink px-6 py-16 text-[0.78rem] text-fog/50">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {/* Brand */}
          <div className="sm:col-span-1">
            <div className="mb-3 font-display text-xl text-fog/80">
              <em className="italic text-gold-light">As You Are</em> Baguio
            </div>
            <p className="text-[0.75rem] leading-relaxed text-fog/40">
              A community platform for Baguio&apos;s creators, entrepreneurs, and ecosystem builders.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <div className="mb-4 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-fog/30">
              Navigate
            </div>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-fog/70"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="mb-4 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-fog/30">
              Contact
            </div>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="mailto:jenncastro@destinevents.biz"
                  className="transition-colors hover:text-fog/70"
                >
                  jenncastro@destinevents.biz
                </a>
              </li>
              <li>
                <a
                  href="https://destinevents.biz"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-fog/70"
                >
                  destinevents.biz
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-fog/10 pt-6">
          <span>© 2026 As You Are Baguio</span>
          <div className="flex flex-wrap items-center gap-1">
            <span>Powered by</span>
            <a
              href="https://destinevents.biz"
              target="_blank"
              rel="noreferrer"
              className="ml-1 underline decoration-transparent transition-colors hover:text-fog/70 hover:decoration-fog/40"
            >
              Destine Events
            </a>
            <span className="mx-1">·</span>
            <a
              href="https://disenyodigitals.com"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-transparent transition-colors hover:text-fog/70 hover:decoration-fog/40"
            >
              Built by Disenyo Digitals
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
