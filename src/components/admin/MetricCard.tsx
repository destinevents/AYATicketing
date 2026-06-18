interface MetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: string;
}

export function MetricCard({ label, value, sublabel, icon }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-pine/10 bg-white p-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="font-display text-3xl text-pine">{value}</div>
      {sublabel && <div className="mt-1 text-xs text-muted">{sublabel}</div>}
    </div>
  );
}
