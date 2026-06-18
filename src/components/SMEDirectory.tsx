"use client";

import { useState, useMemo } from "react";

const SMES = [
  { name: "Morning Dew Café", category: "food", location: "session road", logo: "☕", categoryLabel: "Food & Beverage", desc: "A cozy specialty coffee shop nestled along Session Road, known for Benguet highland single-origin brews and homemade pastries.", tags: ["Coffee", "Pastries", "Co-working"], locationLabel: "Session Road", href: "#" },
  { name: "Disenyo Digitals Collective", category: "tech", location: "bg west", logo: "✦", categoryLabel: "Tech & Digital", desc: "Award-winning AI-powered digital tools and creative systems for Filipino SMEs. DOST-PCIEERD and LGU Baguio Urban Innovation awardee.", tags: ["AI Tools", "Digital", "DOST Awardee"], locationLabel: "Baguio City", href: "https://disenyodigitals.com" },
  { name: "Destine Events", category: "events", location: "session road", logo: "🎪", categoryLabel: "Events & Hospitality", desc: "Experience and community engine behind Baguio's most intentional gatherings — from corporate summits to intimate founder dinners.", tags: ["Events", "Community", "Corporate"], locationLabel: "Baguio City", href: "https://destinevents.biz" },
  { name: "Pine Bloom Wellness", category: "wellness", location: "burnham", logo: "🌿", categoryLabel: "Wellness & Beauty", desc: "Holistic wellness studio offering yoga, aromatherapy, and organic skincare products crafted from Cordillera mountain botanicals.", tags: ["Yoga", "Skincare", "Organic"], locationLabel: "Burnham Area", href: "#" },
  { name: "Highland Threads", category: "retail", location: "session road", logo: "🧵", categoryLabel: "Retail & Fashion", desc: "Proudly Cordilleran fashion brand weaving indigenous textile patterns into contemporary streetwear. Women-led, community-woven.", tags: ["Fashion", "Indigenous", "Women-led"], locationLabel: "Session Road", href: "#" },
  { name: "Strawberry Fields Organic", category: "agri", location: "la trinidad", logo: "🍓", categoryLabel: "Agriculture & Organic", desc: "Family-owned organic farm in La Trinidad offering farm-to-table produce deliveries, agri-tourism experiences, and natural preserves.", tags: ["Organic", "Farm-to-Table", "Agri-tourism"], locationLabel: "La Trinidad", href: "#" },
  { name: "Frame & Fog Studios", category: "creative", location: "bg west", logo: "📸", categoryLabel: "Creative Services", desc: "Photography and videography studio specializing in brand campaigns, event coverage, and documentary storytelling in the Cordillera region.", tags: ["Photography", "Video", "Branding"], locationLabel: "BG West", href: "#" },
  { name: "Session Groceries", category: "food", location: "session road", logo: "🛒", categoryLabel: "Food & Retail", desc: "Curated grocery and specialty food store championing local Baguio and Cordillera food producers. Fresh, local, and proudly Igorot.", tags: ["Grocery", "Local Produce", "Igorot Products"], locationLabel: "Session Road", href: "#" },
];

export function SMEDirectory() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  const filtered = useMemo(() =>
    SMES.filter((s) => {
      const q = query.toLowerCase();
      return (
        (!q || s.name.toLowerCase().includes(q)) &&
        (!category || s.category === category) &&
        (!location || s.location.includes(location))
      );
    }), [query, category, location]);

  return (
    <section id="smes" className="bg-pine px-8 py-24">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-12">
          <div className="mb-4 flex items-center gap-3 font-mono text-[0.58rem] uppercase tracking-[0.22em] text-gold-light">
            <span className="h-px w-6 flex-shrink-0 bg-gold-light" /> SME Directory
          </div>
          <h2 className="font-display text-fog" style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, lineHeight: 1.15 }}>
            Baguio&apos;s <em className="font-light italic text-gold-light">Local Businesses</em>
          </h2>
          <p className="mt-3 max-w-[520px] text-[0.95rem] leading-[1.7] text-fog/60">
            From cafés and boutiques to service providers — discover and support the entrepreneurs building the Baguio economy.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <div className="relative min-w-[220px] flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-fog/50 opacity-45">🔍</span>
            <input type="text" placeholder="Search businesses…" value={query} onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded border border-white/[0.12] bg-white/[0.06] px-4 py-[11px] pl-10 text-[0.88rem] text-fog outline-none placeholder:text-fog/40 transition-colors focus:border-white/40" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="min-w-[150px] rounded border border-white/[0.12] bg-white/[0.06] px-4 py-[11px] text-[0.88rem] text-fog outline-none">
            <option value="">All Categories</option>
            <option value="food">Food & Beverage</option>
            <option value="retail">Retail & Fashion</option>
            <option value="wellness">Wellness & Beauty</option>
            <option value="tech">Tech & Digital</option>
            <option value="events">Events & Hospitality</option>
            <option value="agri">Agriculture & Organic</option>
            <option value="creative">Creative Services</option>
          </select>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="min-w-[150px] rounded border border-white/[0.12] bg-white/[0.06] px-4 py-[11px] text-[0.88rem] text-fog outline-none">
            <option value="">All Locations</option>
            <option value="session road">Session Road Area</option>
            <option value="burnham">Burnham Park Area</option>
            <option value="bg west">BG West</option>
            <option value="la trinidad">La Trinidad</option>
          </select>
        </div>

        <p className="mb-5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-fog/40">
          Showing {filtered.length} business{filtered.length !== 1 ? "es" : ""}
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <div key={s.name} className="group relative overflow-hidden rounded-lg border border-white/[0.12] bg-white/[0.05] p-6 transition-all duration-200 hover:translate-x-1 hover:bg-white/[0.08]">
              <div className="absolute left-0 top-0 h-full w-[3px] origin-bottom scale-y-0 bg-gold transition-transform duration-300 group-hover:scale-y-100" />
              <div className="mb-3.5 flex items-start gap-3.5">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-white/[0.08] text-[1.3rem]">{s.logo}</div>
                <div>
                  <div className="font-display text-[1.05rem] font-normal leading-[1.3] text-fog">{s.name}</div>
                  <div className="mt-0.5 text-[0.72rem] text-fog/50">{s.categoryLabel}</div>
                </div>
              </div>
              <p className="mb-4 text-[0.82rem] leading-[1.65] text-fog/60">{s.desc}</p>
              <div className="mb-3.5 flex flex-wrap gap-1.5">
                {s.tags.map((t) => (
                  <span key={t} className="rounded border border-white/15 px-2 py-[3px] font-mono text-[0.65rem] tracking-[0.06em] text-fog/50">{t}</span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[0.72rem] text-fog/40">📍 {s.locationLabel}</span>
                <a href={s.href} className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-gold-light transition-colors hover:text-gold">Visit →</a>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-12 text-center text-[0.88rem] text-fog/40">No businesses found. Try a different keyword or filter.</p>
        )}

        <div className="mt-12 flex flex-wrap items-center justify-between gap-8 rounded-lg border border-white/10 bg-white/[0.05] px-9 py-8">
          <div>
            <h3 className="font-display text-[1.4rem] font-normal text-fog">Own a Baguio business? <em className="italic text-gold-light">Get listed.</em></h3>
            <p className="mt-1 text-[0.85rem] text-fog/55">Join the SME directory and reach the AYA community of 600+ members, creators, and fellow entrepreneurs.</p>
          </div>
          <a href="#join" className="rounded-sm bg-gold px-8 py-3.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-pine-deep transition-all hover:-translate-y-0.5 hover:bg-gold-light">List My Business</a>
        </div>
      </div>
    </section>
  );
}
