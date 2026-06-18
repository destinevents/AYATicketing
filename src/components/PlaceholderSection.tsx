interface PlaceholderSectionProps {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
}

export function PlaceholderSection({ eyebrow, title, description }: PlaceholderSectionProps) {
  return (
    <main className="min-h-[60vh] bg-fog-warm px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-3 flex items-center justify-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-gold">
          <span className="h-px w-7 bg-gold" />
          {eyebrow}
          <span className="h-px w-7 bg-gold" />
        </div>
        <h1 className="mb-4 font-display text-4xl font-light leading-tight text-pine md:text-5xl">{title}</h1>
        <p className="text-sm leading-relaxed text-muted md:text-base">{description}</p>
      </div>
    </main>
  );
}
