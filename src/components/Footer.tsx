export function Footer() {
  return (
    <footer className="bg-ink px-8 py-12 text-[0.78rem] text-fog/45">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-display text-[1rem] font-normal text-fog/60">
            <em className="italic text-gold-light">As You Are</em> Baguio
          </div>
          <div className="mt-1 text-[0.72rem]">Community platform for creators & SMEs in Baguio City, Philippines</div>
        </div>
        <div className="text-right">
          Powered by{" "}
          <a href="https://destinevents.biz" target="_blank" rel="noreferrer" className="underline decoration-transparent transition-colors hover:text-fog/60">
            Destine Events
          </a>
          {" "}&nbsp;·&nbsp;{" "}
          Built by{" "}
          <a href="https://disenyodigitals.com" target="_blank" rel="noreferrer" className="underline decoration-transparent transition-colors hover:text-fog/60">
            Disenyo Digitals
          </a>
          {" "}&nbsp;·&nbsp; © 2026 As You Are Baguio
        </div>
      </div>
    </footer>
  );
}
