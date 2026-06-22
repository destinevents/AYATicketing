interface MetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: string;
  accent?: "gold" | "pine" | "terra" | "moss" | "sky" | "lavender";
}

const ACCENT_STYLES = {
  gold:     { bg: "bg-amber-50",    iconBg: "bg-amber-100",   border: "border-amber-200/60",  text: "text-amber-700" },
  pine:     { bg: "bg-emerald-50",  iconBg: "bg-emerald-100", border: "border-emerald-200/60",text: "text-emerald-700" },
  terra:    { bg: "bg-orange-50",   iconBg: "bg-orange-100",  border: "border-orange-200/60", text: "text-orange-700" },
  moss:     { bg: "bg-green-50",    iconBg: "bg-green-100",   border: "border-green-200/60",  text: "text-green-700" },
  sky:      { bg: "bg-sky-50",      iconBg: "bg-sky-100",     border: "border-sky-200/60",    text: "text-sky-700" },
  lavender: { bg: "bg-violet-50",   iconBg: "bg-violet-100",  border: "border-violet-200/60", text: "text-violet-700" },
};

export function MetricCard({ label, value, sublabel, icon, accent = "pine" }: MetricCardProps) {
  const s = ACCENT_STYLES[accent];
  return (
    <div className={`rounded-xl border ${s.border} ${s.bg} p-5`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-pine/60">{label}</span>
        {icon && (
          <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-base ${s.iconBg}`}>
            {icon}
          </span>
        )}
      </div>
      <div className="font-display text-3xl font-light text-pine">{value}</div>
      {sublabel && <div className="mt-1 font-mono text-[0.6rem] text-pine/50">{sublabel}</div>}
    </div>
  );
}
