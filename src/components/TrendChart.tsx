import { cn } from "@/lib/utils";
import { usePage } from "@/i18n/pageCopy";
import { todayISO } from "@/lib/dates";
import type { ISODate } from "@/types";

export type ChartPoint = {
  date: ISODate;
  label: string;
  value: number | null;
};

export function TrendChart({
  title,
  points,
  unit,
  color = "chart-1",
  emptyTitle,
  emptyHint,
  onLog,
  logLabel,
  maxHint,
}: {
  title: string;
  points: ChartPoint[];
  unit?: string;
  color?: "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5" | "chart-6";
  emptyTitle: string;
  emptyHint: string;
  onLog?: () => void;
  logLabel?: string;
  maxHint?: number;
}) {
  const values = points.map((p) => p.value);
  const hasData = values.some((v) => v != null && v > 0);
  const nums = values.filter((v): v is number => v != null);
  const peak = nums.length ? Math.max(...nums) : 0;
  const max = Math.max(maxHint ?? 0, peak, 1);
  const today = todayISO();
  const latest = [...nums].reverse()[0];

  const fill: Record<typeof color, string> = {
    "chart-1": "bg-chart-1",
    "chart-2": "bg-chart-2",
    "chart-3": "bg-chart-3",
    "chart-4": "bg-chart-4",
    "chart-5": "bg-chart-5",
    "chart-6": "bg-chart-6",
  };

  return (
    <article className="rounded-pan border border-border bg-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-title3 text-foreground">{title}</h2>
        <p
          className={cn(
            "font-display text-title3 tabular-nums",
            latest == null ? "text-ink-subtle" : "text-foreground",
          )}
        >
          {latest == null ? "–" : Math.round(latest)}
          {latest != null && unit ? (
            <span className="ml-1 font-sans text-caption text-muted-foreground">{unit}</span>
          ) : null}
        </p>
      </div>

      {!hasData ? (
        <div className="mt-3 rounded-md border border-dashed border-border bg-background px-4 py-6 text-center">
          <p className="font-sans text-body text-foreground">{emptyTitle}</p>
          <p className="mt-1 font-sans text-caption text-muted-foreground">{emptyHint}</p>
          {onLog && logLabel ? (
            <button
              type="button"
              onClick={onLog}
              className="mt-4 inline-flex h-8 items-center rounded-pill bg-brand-tint px-4 font-sans text-chip text-primary"
            >
              {logLabel}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 flex h-32 items-end gap-1">
          {points.map((p) => {
            const v = p.value;
            const h = v != null && v > 0 ? Math.max(8, (v / max) * 100) : 0;
            const isToday = p.date === today;
            const isPeak = v != null && v === peak && peak > 0;
            return (
              <div key={p.date} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <div className="flex h-24 w-full items-end justify-center">
                  {v != null && v > 0 ? (
                    <div
                      className={cn(
                        "w-full max-w-[36px] rounded-t-sm transition-all",
                        isToday || isPeak ? "bg-chart-1" : fill[color],
                      )}
                      style={{ height: `${h}%` }}
                      title={`${v}${unit ? ` ${unit}` : ""}`}
                    />
                  ) : (
                    <div className="h-1.5 w-full max-w-[36px] rounded-sm bg-secondary" />
                  )}
                </div>
                <span
                  className={cn(
                    "truncate font-sans text-[10px]",
                    isToday ? "font-semibold text-primary" : "text-muted-foreground",
                  )}
                >
                  {p.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

export function LineChart({
  title,
  points,
  unit,
  emptyTitle,
  emptyHint,
}: {
  title: string;
  points: ChartPoint[];
  unit?: string;
  emptyTitle: string;
  emptyHint: string;
}) {
  const nums = points.filter((p) => p.value != null) as Array<ChartPoint & { value: number }>;
  if (nums.length < 2) {
    return (
      <article className="rounded-pan border border-border bg-card p-4">
        <h2 className="font-display text-title3 text-foreground">{title}</h2>
        <div className="mt-3 rounded-md border border-dashed border-border bg-background px-4 py-6 text-center">
          <p className="font-sans text-body text-foreground">{emptyTitle}</p>
          <p className="mt-1 font-sans text-caption text-muted-foreground">{emptyHint}</p>
        </div>
      </article>
    );
  }

  const min = Math.min(...nums.map((p) => p.value));
  const max = Math.max(...nums.map((p) => p.value));
  const span = Math.max(max - min, 0.1);
  const w = 320;
  const h = 120;
  const pad = 8;
  const coords = nums.map((p, i) => {
    const x = pad + (i / Math.max(nums.length - 1, 1)) * (w - pad * 2);
    const y = pad + (1 - (p.value - min) / span) * (h - pad * 2);
    return { x, y, ...p };
  });
  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
  const latest = nums[nums.length - 1]?.value;

  return (
    <article className="rounded-pan border border-border bg-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-title3 text-foreground">{title}</h2>
        <p className="font-display text-title3 tabular-nums text-foreground">
          {latest}
          {unit ? (
            <span className="ml-1 font-sans text-caption text-muted-foreground">{unit}</span>
          ) : null}
        </p>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-32 w-full" aria-hidden="true">
        <path
          d={path}
          fill="none"
          stroke="hsl(var(--chart-1))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.map((c) => (
          <circle
            key={c.date}
            cx={c.x}
            cy={c.y}
            r={c.date === todayISO() ? 5 : 3.5}
            className="fill-chart-1"
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between font-sans text-[10px] text-muted-foreground">
        <span>{nums[0]?.label}</span>
        <span>{nums[nums.length - 1]?.label}</span>
      </div>
    </article>
  );
}

export function PhaseBars({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: number | null; tone: string }[];
}) {
  const copy = usePage();
  const nums = rows.map((r) => r.value).filter((v): v is number => v != null);
  const max = Math.max(...nums, 1);
  const hasData = nums.length > 0;

  return (
    <article className="rounded-pan border border-border bg-card p-4">
      <h2 className="font-display text-title3 text-foreground">{title}</h2>
      {!hasData ? (
        <div className="mt-3 rounded-md border border-dashed border-border bg-background px-4 py-6 text-center">
          <p className="font-sans text-body text-foreground">{copy("noPhasePatterns")}</p>
          <p className="mt-1 font-sans text-caption text-muted-foreground">
            {copy("noPhasePatternsHint")}
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => {
            const pct = row.value != null ? Math.max(6, (row.value / max) * 100) : 0;
            return (
              <li key={row.label}>
                <div className="mb-1 flex justify-between gap-2">
                  <span className="font-sans text-caption text-foreground">{row.label}</span>
                  <span
                    className={cn(
                      "font-sans text-caption tabular-nums",
                      row.value == null ? "text-ink-subtle" : "text-muted-foreground",
                    )}
                  >
                    {row.value == null ? "–" : Math.round(row.value)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-pill bg-secondary">
                  <div
                    className={cn("h-full rounded-pill", row.tone)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
