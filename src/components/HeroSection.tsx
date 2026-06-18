"use client";

import { useEffect } from "react";

export function HeroSection() {
  useEffect(() => {
    const container = document.getElementById("hero-particles");
    if (!container) return;
    for (let i = 0; i < 18; i++) {
      const p = document.createElement("div");
      const size = Math.random() * 6 + 3;
      p.style.cssText = `
        position:absolute;border-radius:50%;background:rgba(201,168,76,0.12);
        width:${size}px;height:${size}px;
        left:${Math.random() * 100}%;bottom:${Math.random() * 20}%;
        animation:heroFloat ${Math.random() * 12 + 8}s linear ${Math.random() * 8}s infinite;
      `;
      container.appendChild(p);
    }
  }, []);

  return (
    <>
      <style>{`
        @keyframes heroFloat {
          0%   { transform:translateY(0) rotate(0deg); opacity:0; }
          10%  { opacity:1; }
          90%  { opacity:0.6; }
          100% { transform:translateY(-80vh) rotate(360deg); opacity:0; }
        }
        @keyframes scrollpulse {
          0%,100% { opacity:0.4; transform:scaleY(1); }
          50%     { opacity:1; transform:scaleY(1.2); }
        }
      `}</style>

      <section id="home" className="relative flex min-h-screen items-center overflow-hidden bg-pine-deep pt-14">
        <div id="hero-particles" className="pointer-events-none absolute inset-0 overflow-hidden" />

        {/* Mountain silhouette */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0" style={{ height: "45%" }}>
          <svg viewBox="0 0 1440 300" preserveAspectRatio="none" className="block h-full w-full">
            <path d="M0,300 L0,200 L80,160 L180,220 L260,130 L380,180 L480,90 L560,140 L660,60 L740,110 L820,50 L900,100 L980,40 L1060,90 L1140,30 L1220,80 L1300,45 L1380,95 L1440,70 L1440,300 Z" fill="rgba(43,50,40,0.6)" />
            <path d="M0,300 L0,230 L120,200 L200,240 L300,180 L420,210 L500,160 L600,190 L700,130 L800,165 L880,120 L960,155 L1040,105 L1120,145 L1200,110 L1280,145 L1360,120 L1440,145 L1440,300 Z" fill="rgba(29,34,25,0.85)" />
          </svg>
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0" style={{ height: "30%", background: "linear-gradient(to top,rgba(240,237,230,0.07),transparent)" }} />

        <div className="relative z-10 mx-auto grid w-full max-w-[1100px] items-center gap-12 px-8 pb-28 pt-20 md:grid-cols-[1fr_380px] md:gap-20">
          {/* Left */}
          <div>
            <div className="mb-6 flex items-center gap-3 font-mono text-[0.58rem] uppercase tracking-[0.22em] text-gold-light">
              <span className="h-px w-7 flex-shrink-0 bg-gold" />
              Baguio City, Philippines &nbsp;·&nbsp; 600+ Members
            </div>
            <h1 className="mb-6 font-display font-light text-fog" style={{ fontSize: "clamp(3rem,7vw,5.5rem)", lineHeight: 1.05 }}>
              <em className="font-light italic text-gold-light">As You Are</em>
              <strong className="block font-normal text-fog">Baguio</strong>
            </h1>
            <p className="mb-10 leading-[1.75] text-fog/65" style={{ fontSize: "1.05rem", maxWidth: "460px" }}>
              A community platform for Baguio&apos;s creators, entrepreneurs, and ecosystem builders. Get discovered, connect with local SMEs, and be part of the stories shaping the City of Pines.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#join" className="rounded-sm bg-gold px-8 py-3.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-pine-deep transition-all hover:-translate-y-0.5 hover:bg-gold-light">
                Join the Community
              </a>
              <a href="#creators" className="rounded-sm border border-fog/25 px-7 py-3.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-fog/75 transition-colors hover:border-fog/60 hover:text-fog">
                Explore Creators
              </a>
            </div>
            {/* June 20 event CTA */}
            <div className="mt-8 flex items-center gap-4 rounded-md border border-gold/20 bg-white/[0.04] px-6 py-4">
              <div className="flex-shrink-0 text-center">
                <div className="font-display text-2xl leading-none text-gold-light">20</div>
                <div className="font-mono text-[0.5rem] uppercase tracking-[0.14em] text-gold/70">Jun</div>
              </div>
              <div className="flex-1">
                <div className="text-[0.82rem] font-medium leading-tight text-fog">AYA Builder&apos;s Circle — June Session</div>
                <div className="mt-0.5 font-mono text-[0.62rem] text-fog/50">3:30 PM – 5:00 PM · El Cielito Hotel Baguio</div>
              </div>
              <a href="#events" className="flex-shrink-0 rounded-sm bg-gold px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-pine-deep transition-colors hover:bg-gold-light">
                Register →
              </a>
            </div>
          </div>

          {/* Right: stat card */}
          <div className="hidden md:block">
            <div className="rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              {[
                { num: "600+", label: "Community Members", tag: "Active & growing" },
                { num: "40+",  label: "Featured Creators",  tag: "Content · Events · Media" },
                { num: "80+",  label: "Local SMEs Listed",  tag: "Food · Retail · Services" },
                { num: "1",    label: "eMagazine Issue Out", tag: "Monthly · Baguio Stories" },
              ].map((s, i, a) => (
                <div key={i} className={`py-[18px] ${i < a.length - 1 ? "border-b border-white/[0.08]" : ""}`}>
                  <div className="font-display text-[2.6rem] leading-none text-fog">{s.num}</div>
                  <div className="mt-1 text-[0.8rem] leading-[1.4] text-fog/55">
                    {s.label}
                    <br />
                    <span className="mt-1 inline-block rounded-full bg-gold/15 px-2 py-[2px] font-mono text-[0.52rem] uppercase tracking-[0.15em] text-gold-light">
                      {s.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
          <div
            className="h-10 w-px"
            style={{ background: "linear-gradient(to bottom,rgba(201,168,76,0.7),transparent)", animation: "scrollpulse 2s ease-in-out infinite" }}
          />
          <span className="font-mono text-[0.5rem] uppercase tracking-[0.2em] text-fog/40">Explore</span>
        </div>
      </section>
    </>
  );
}
