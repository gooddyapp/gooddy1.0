export function Meter({
  label,
  value,
  target,
  unit = "",
  score,
}: {
  label: string;
  value: number;
  target: number;
  unit?: string;
  score?: number;
}) {
  const pct = score ?? (target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0);
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-sans text-body-strong text-foreground">{label}</span>
        <span className="font-sans text-caption tabular text-muted-foreground">
          {Math.round(value)}
          {unit} / {target}
          {unit} · {pct}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-pill bg-secondary">
        <div
          className="h-full rounded-pill bg-primary transition-all"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}
