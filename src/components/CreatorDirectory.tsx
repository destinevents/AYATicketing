"use client";

import { useState, useMemo } from "react";

const CREATORS = [
  { name: "Monica Joy Fernandez", handle: "@monicaaajoy", niche: "events", platform: "ig fb", nicheLabel: "Events & Community", gradient: "linear-gradient(135deg,#2B3228,#4E5C49)", emoji: "👩‍💼", followers: "6K+", views: "3M+", likes: "150K", location: "Baguio City", socials: [{ label: "IG", href: "https://instagram.com/monicaaajoy" }, { label: "TT", href: "#" }, { label: "FB", href: "#" }], profile: "https://monicajoy.destinevents.biz" },
  { name: "Baguio Foodie Finds", handle: "@baguiofoodiefi", niche: "food", platform: "ig tiktok", nicheLabel: "Food & Dining", gradient: "linear-gradient(135deg,#5C3B1E,#8B4A35)", emoji: "🍴", followers: "22K", views: "1.2M", likes: "88K", location: "Baguio City", socials: [{ label: "IG", href: "#" }, { label: "TT", href: "#" }], profile: "#" },
  { name: "Pine & Wander", handle: "@pineandwander", niche: "travel", platform: "ig youtube", nicheLabel: "Travel & Outdoors", gradient: "linear-gradient(135deg,#2B3228,#7A9B6A)", emoji: "🌲", followers: "14K", views: "580K", likes: "42K", location: "Baguio City", socials: [{ label: "IG", href: "#" }, { label: "YT", href: "#" }], profile: "#" },
  { name: "Cordillera Culture", handle: "@cordilleraculture", niche: "lifestyle", platform: "ig tiktok fb", nicheLabel: "Arts & Culture", gradient: "linear-gradient(135deg,#3D2B58,#7A5C9B)", emoji: "🏔️", followers: "31K", views: "2M+", likes: "190K", location: "Benguet", socials: [{ label: "IG", href: "#" }, { label: "TT", href: "#" }, { label: "FB", href: "#" }], profile: "#" },
  { name: "Baguio Builders PH", handle: "@baguiobuildersph", niche: "business", platform: "ig fb", nicheLabel: "Business", gradient: "linear-gradient(135deg,#1D2A3A,#2D5A8E)", emoji: "💼", followers: "8.5K", views: "320K", likes: "24K", location: "Baguio City", socials: [{ label: "IG", href: "#" }, { label: "FB", href: "#" }], profile: "#" },
  { name: "City of Pines Life", handle: "@cityofpineslife", niche: "lifestyle", platform: "ig tiktok", nicheLabel: "Lifestyle", gradient: "linear-gradient(135deg,#3A2228,#8B5A5A)", emoji: "🌸", followers: "18K", views: "900K", likes: "65K", location: "Baguio City", socials: [{ label: "IG", href: "#" }, { label: "TT", href: "#" }], profile: "#" },
  { name: "Highland Harvest", handle: "@highlandharvest.baguio", niche: "food", platform: "ig", nicheLabel: "Food & Sustainability", gradient: "linear-gradient(135deg,#2E3A1A,#7A9B3A)", emoji: "🥗", followers: "5.2K", views: "200K", likes: "18K", location: "La Trinidad", socials: [{ label: "IG", href: "#" }], profile: "#" },
  { name: "Baguio Arts Collective", handle: "@baguioartscollective", niche: "arts", platform: "ig fb", nicheLabel: "Arts & Culture", gradient: "linear-gradient(135deg,#2A2040,#6B5A8E)", emoji: "🎨", followers: "11K", views: "450K", likes: "38K", location: "Baguio City", socials: [{ label: "IG", href: "#" }, { label: "FB", href: "#" }], profile: "#" },
];

export function CreatorDirectory() {
  const [query, setQuery] = useState("");
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("");

  const filtered = useMemo(() =>
    CREATORS.filter((c) => {
      const q = query.toLowerCase();
      return (
        (!q || c.name.toLowerCase().includes(q) || c.nicheLabel.toLowerCase().includes(q)) &&
        (!niche || c.niche === niche) &&
        (!platform || c.platform.includes(platform))
      );
    }), [query, niche, platform]);

  return (
    <section id="creators" className="bg-fog-warm px-8 py-24">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-12">
          <div className="mb-4 flex items-center gap-3 font-mono text-[0.58rem] uppercase tracking-[0.22em] text-gold">
            <span className="h-px w-6 flex-shrink-0 bg-gold" /> Creator Directory
          </div>
          <h2 className="font-display text-pine" style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, lineHeight: 1.15 }}>
            Baguio&apos;s <em className="font-light italic text-terra">Creative Voices</em>
          </h2>
          <p className="mt-3 max-w-[520px] text-[0.95rem] leading-[1.7] text-muted">
            Discover content creators, media personalities, and community builders rooted in Baguio City. Filter by niche, platform, or following size.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <div className="relative min-w-[220px] flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm opacity-45">🔍</span>
            <input type="text" placeholder="Search creators by name or niche…" value={query} onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded border border-pine/[0.12] bg-white px-4 py-[11px] pl-10 text-[0.88rem] text-ink outline-none transition-colors placeholder:text-muted focus:border-pine-mid" />
          </div>
          <select value={niche} onChange={(e) => setNiche(e.target.value)} className="min-w-[150px] rounded border border-pine/[0.12] bg-white px-4 py-[11px] text-[0.88rem] text-ink outline-none">
            <option value="">All Niches</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="food">Food & Dining</option>
            <option value="travel">Travel & Outdoors</option>
            <option value="events">Events & Hosting</option>
            <option value="business">Business & Finance</option>
            <option value="arts">Arts & Culture</option>
          </select>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="min-w-[150px] rounded border border-pine/[0.12] bg-white px-4 py-[11px] text-[0.88rem] text-ink outline-none">
            <option value="">All Platforms</option>
            <option value="ig">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="fb">Facebook</option>
            <option value="youtube">YouTube</option>
          </select>
        </div>

        <p className="mb-5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted">
          Showing {filtered.length} creator{filtered.length !== 1 ? "s" : ""}
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((c) => (
            <div key={c.handle} className="overflow-hidden rounded-lg border border-pine/[0.12] bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(43,50,40,0.1)]">
              <div className="relative h-[100px]" style={{ background: c.gradient }}>
                <div className="absolute bottom-[-28px] left-5 flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-fog-2 text-2xl">
                  {c.emoji}
                </div>
              </div>
              <div className="px-5 pb-5 pt-10">
                <div className="font-display text-[1.1rem] font-normal text-pine">{c.name}</div>
                <div className="mb-2.5 font-mono text-[0.6rem] tracking-[0.1em] text-muted">{c.handle}</div>
                <span className="mb-3 inline-block rounded-full bg-pine/[0.07] px-2.5 py-[3px] text-[0.72rem] text-pine-mid">{c.nicheLabel}</span>
                <div className="mb-3.5 flex gap-4">
                  {[{ val: c.followers, lbl: "Followers" }, { val: c.views, lbl: "Views" }, { val: c.likes, lbl: "Likes" }].map((s) => (
                    <div key={s.lbl} className="text-center">
                      <div className="font-display text-[1rem] font-normal text-pine">{s.val}</div>
                      <div className="text-[0.65rem] text-muted">{s.lbl}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  {c.socials.map((s) => (
                    <a key={s.label} href={s.href} className="rounded bg-fog-2 px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-pine-mid transition-colors hover:bg-pine hover:text-fog">{s.label}</a>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-pine/[0.08] px-5 py-3.5">
                <span className="text-[0.75rem] text-muted">📍 {c.location}</span>
                <a href={c.profile} className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-gold-light transition-colors hover:text-gold">View Profile →</a>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-12 text-center text-[0.88rem] text-muted">No creators found for that search. Try a different keyword or filter.</p>
        )}

        <div className="mt-12 flex flex-wrap items-center justify-between gap-8 rounded-lg bg-pine px-9 py-8">
          <div>
            <h3 className="font-display text-[1.4rem] font-normal text-fog">Are you a Baguio creator? <em className="italic text-gold-light">Get featured.</em></h3>
            <p className="mt-1 text-[0.85rem] text-fog/60">Join the directory and connect with 600+ community members and local businesses.</p>
          </div>
          <a href="#join" className="rounded-sm bg-gold px-8 py-3.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-pine-deep transition-all hover:-translate-y-0.5 hover:bg-gold-light">Apply to Get Featured</a>
        </div>
      </div>
    </section>
  );
}
