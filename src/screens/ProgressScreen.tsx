import { useMemo, useState } from "react";
import {
  Brain,
  CalendarDays,
  Coffee,
  Droplets,
  Dumbbell,
  Footprints,
  Moon,
  Utensils,
  Zap,
} from "lucide-react";
import { EmptyState, Disclaimer } from "@/components/ui/Section";
import { Chip } from "@/components/ui/Chip";
import { Meter } from "@/components/ui/Meter";
import { LineChart, PhaseBars, TrendChart } from "@/components/TrendChart";
import { useAppStore } from "@/store/useAppStore";
import {
  goalOverview,
  phaseGroupedStats,
  progressDailySeries,
  progressTotals,
  wellnessScore,
} from "@/lib/analytics";
import { ENERGY_LEVELS, SLEEP_LEVELS } from "@/data/labels";
import type { ProgressRange } from "@/types";
import { formatDisplayDate, todayISO } from "@/lib/dates";
import { useT } from "@/i18n";
import { chipLabel, usePage } from "@/i18n/pageCopy";
import { cn } from "@/lib/utils";

const RANGES: { id: ProgressRange; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "90d", label: "90D" },
  { id: "1y", label: "1Y" },
  { id: "all", label: "All" },
];

function ScoreRing({ score, size = 88 }: { score: number; size?: number }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score)) / 100;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-secondary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="stroke-primary"
          strokeDasharray={`${c * pct} ${c * (1 - pct)}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="font-display text-title1 tabular-nums text-foreground">{score}</p>
      </div>
    </div>
  );
}

function GoalRadar({ scores }: { scores: { label: string; score: number }[] }) {
  const t = useT();
  const copy = usePage();
  const n = scores.length;
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 78;
  const hasData = scores.some((s) => s.score > 0);

  const point = (i: number, value: number) => {
    const angle = -Math.PI / 2 + (i / n) * Math.PI * 2;
    const r = (Math.min(100, Math.max(0, value)) / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const dataPath = scores
    .map((s, i) => {
      const p = point(i, s.score);
      return `${i === 0 ? "M" : "L"}${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <article className="rounded-pan border border-border bg-card p-4">
      <h2 className="font-display text-title3 text-foreground">{t("progress.goals")}</h2>
      {!hasData ? (
        <div className="mt-3 rounded-md border border-dashed border-border bg-background px-4 py-6 text-center">
          <p className="font-sans text-body text-foreground">{copy("noGoals")}</p>
          <p className="mt-1 font-sans text-caption text-muted-foreground">
            {copy("noMealsHint")}
          </p>
        </div>
      ) : (
        <div className="relative mx-auto mt-2" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
            {rings.map((f) => (
              <polygon
                key={f}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="1"
                strokeDasharray="4 4"
                points={scores
                  .map((_, i) => {
                    const p = point(i, f * 100);
                    return `${p.x},${p.y}`;
                  })
                  .join(" ")}
              />
            ))}
            <path
              d={`${dataPath} Z`}
              fill="hsl(var(--chart-1) / 0.2)"
              stroke="hsl(var(--chart-1))"
              strokeWidth="2"
            />
            {scores.map((s, i) => {
              const p = point(i, s.score);
              return <circle key={s.label} cx={p.x} cy={p.y} r={3.5} className="fill-chart-1" />;
            })}
          </svg>
          {scores.map((s, i) => {
            const angle = -Math.PI / 2 + (i / n) * Math.PI * 2;
            const lx = cx + (maxR + 28) * Math.cos(angle);
            const ly = cy + (maxR + 28) * Math.sin(angle);
            return (
              <span
                key={s.label}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 font-sans text-[10px] text-muted-foreground"
                style={{ left: lx, top: ly }}
              >
                {s.label}
              </span>
            );
          })}
        </div>
      )}
    </article>
  );
}

export function ProgressScreen() {
  const t = useT();
  const copy = usePage();
  const language = useAppStore((s) => s.language);
  const [range, setRange] = useState<ProgressRange>("7d");
  const selectedDate = useAppStore((s) => s.selectedDate);
  const store = useAppStore();
  const setSteps = useAppStore((s) => s.setSteps);
  const addWater = useAppStore((s) => s.addWater);
  const setSleep = useAppStore((s) => s.setSleep);
  const setEnergy = useAppStore((s) => s.setEnergy);

  const totals = useMemo(
    () => progressTotals(store, range, selectedDate),
    [store, range, selectedDate],
  );
  const wellness = useMemo(() => wellnessScore(store, selectedDate), [store, selectedDate]);
  const goalsToday = useMemo(() => goalOverview(store, selectedDate), [store, selectedDate]);
  const series = useMemo(
    () => progressDailySeries(store, range, selectedDate),
    [store, range, selectedDate],
  );
  const phaseStats = useMemo(
    () => phaseGroupedStats(store, range === "today" ? "30d" : range),
    [store, range],
  );
  const weights = [...store.weightHistory].sort((a, b) => a.date.localeCompare(b.date));
  const rangeLabel =
    range === "7d" ? "7" : range === "today" ? copy("today") : range.toUpperCase();

  const dash = (v: string | number | null | undefined) =>
    v == null || v === "" ? "–" : String(v);

  const avgCards = [
    {
      label: copy("avgCalories"),
      value: totals.avgCalories != null ? `${Math.round(totals.avgCalories)}` : null,
      unit: "kcal",
      icon: Utensils,
      tone: "text-chart-1",
    },
    {
      label: copy("avgWater"),
      value: totals.avgWater != null ? `${(totals.avgWater / 1000).toFixed(1)}` : null,
      unit: "L",
      icon: Droplets,
      tone: "text-chart-3",
    },
    {
      label: copy("avgSteps"),
      value: totals.avgSteps != null ? String(totals.avgSteps) : null,
      unit: "",
      icon: Footprints,
      tone: "text-chart-4",
    },
    {
      label: copy("avgWorkout"),
      value: totals.avgWorkoutMin != null ? String(totals.avgWorkoutMin) : null,
      unit: "min",
      icon: Dumbbell,
      tone: "text-chart-2",
    },
    {
      label: copy("avgSleep"),
      value: totals.avgSleep != null ? String(totals.avgSleep) : null,
      unit: "/5",
      icon: Moon,
      tone: "text-chart-6",
    },
    {
      label: copy("avgEnergy"),
      value: totals.avgEnergy != null ? String(totals.avgEnergy) : null,
      unit: "/5",
      icon: Brain,
      tone: "text-chart-5",
    },
    {
      label: copy("avgCaffeine"),
      value: totals.avgCaffeine != null ? String(totals.avgCaffeine) : null,
      unit: "mg",
      icon: Coffee,
      tone: "text-chart-2",
    },
    {
      label: copy("daysTracked"),
      value: totals.trackedDays > 0 ? String(totals.trackedDays) : null,
      unit: copy("days"),
      icon: Zap,
      tone: "text-primary",
    },
  ];

  const totalTiles = [
    { label: copy("totalCal"), value: totals.calories > 0 ? Math.round(totals.calories) : null },
    { label: copy("totalSteps"), value: totals.steps > 0 ? totals.steps : null },
    { label: copy("workoutMin"), value: totals.workoutMinutes > 0 ? totals.workoutMinutes : null },
    { label: copy("totalProtein"), value: totals.protein > 0 ? `${Math.round(totals.protein)}g` : null },
    { label: copy("totalWater"), value: totals.water > 0 ? `${(totals.water / 1000).toFixed(1)}L` : null },
    { label: copy("workoutsCount"), value: totals.workouts > 0 ? totals.workouts : null },
  ];

  const weightPoints = weights.map((w) => ({
    date: w.date,
    label: formatDisplayDate(w.date),
    value: w.kg,
  }));

  const phaseEnergyRows = phaseStats.map((p) => ({
    label: t(`phases.${p.phase}`),
    value: p.avgEnergy,
    tone:
      p.phase === "menstrual"
        ? "bg-menstrual"
        : p.phase === "follicular"
          ? "bg-follicular"
          : p.phase === "ovulation"
            ? "bg-ovulation"
            : "bg-luteal",
  }));

  const phaseStepsRows = phaseStats.map((p) => ({
    label: t(`phases.${p.phase}`),
    value: p.avgSteps,
    tone:
      p.phase === "menstrual"
        ? "bg-menstrual"
        : p.phase === "follicular"
          ? "bg-follicular"
          : p.phase === "ovulation"
            ? "bg-ovulation"
            : "bg-luteal",
  }));

  return (
    <div className="flex flex-1 flex-col">
      <header className="px-4 pb-2 pt-8 text-center">
        <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
          {t("progress.eyebrow")}
        </p>
        <h1 className="mt-1 font-display text-title1 text-foreground">{copy("trends")}</h1>
        <p className="mt-1 font-sans text-caption text-muted-foreground">
          Tracking for {wellness.trackedDays} days · {totals.trackedDays} entries in range
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6">
        <div className="flex flex-wrap justify-center gap-2">
          {RANGES.map((r) => (
            <Chip key={r.id} selected={range === r.id} onClick={() => setRange(r.id)}>
              {r.label}
            </Chip>
          ))}
        </div>

        {/* 1. Wellness score */}
        <article className="flex items-center gap-4 rounded-pan border border-border bg-card p-4 ring-1 ring-rose-gold/40">
          <ScoreRing score={wellness.score} />
          <div className="min-w-0 flex-1">
            <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
              {rangeLabel} wellness score
            </p>
            <p className="mt-1 font-sans text-body text-foreground">{wellness.message}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-secondary px-2.5 py-1 font-sans text-caption text-foreground">
                <Zap size={12} className="text-primary" />
                {wellness.streak} day streak
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-secondary px-2.5 py-1 font-sans text-caption text-foreground">
                <CalendarDays size={12} className="text-chart-3" />
                {wellness.trackedDays} days tracked
              </span>
            </div>
          </div>
        </article>
        <Disclaimer>
          This score reflects goal-tracking activity, not a medical assessment of your health.
        </Disclaimer>

        {/* 2. Totals */}
        <article className="rounded-pan border border-border bg-card p-4">
          <h2 className="font-display text-title3 text-foreground">{rangeLabel} totals</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {totalTiles.map((tile) => (
              <div key={tile.label} className="rounded-md bg-secondary px-2 py-3 text-center">
                <p
                  className={cn(
                    "font-display text-title3 tabular-nums",
                    tile.value == null ? "text-ink-subtle" : "text-foreground",
                  )}
                >
                  {dash(tile.value)}
                </p>
                <p className="mt-1 font-sans text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  {tile.label}
                </p>
              </div>
            ))}
          </div>
        </article>

        {/* 3. Averages grid */}
        <div className="grid grid-cols-2 gap-2">
          {avgCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-pan border border-border bg-card p-4">
                <Icon size={18} className={cn(card.tone)} strokeWidth={1.75} />
                <p className="mt-3 font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
                  {card.label}
                </p>
                <p
                  className={cn(
                    "mt-1 font-display text-title2 tabular-nums",
                    card.value == null ? "text-ink-subtle" : "text-foreground",
                  )}
                >
                  {dash(card.value)}
                  {card.value != null && card.unit ? (
                    <span className="ml-1 font-sans text-caption text-muted-foreground">
                      {card.unit}
                    </span>
                  ) : null}
                </p>
              </div>
            );
          })}
        </div>

        {/* 4. Graphs (added) */}
        <GoalRadar
          scores={goalsToday.map((g) => ({ label: g.label, score: g.score }))}
        />

        <TrendChart
          title={copy("calorieTrend")}
          unit="kcal"
          color="chart-1"
          maxHint={store.goals.calories}
          points={series.map((p) => ({
            date: p.date,
            label: p.label,
            value: p.calories,
          }))}
          emptyTitle={copy("noMeals")}
          emptyHint={copy("noMealsHint")}
        />

        <TrendChart
          title={copy("macroTrend")}
          unit="g"
          color="chart-2"
          maxHint={store.goals.proteinG}
          points={series.map((p) => ({
            date: p.date,
            label: p.label,
            value: p.protein,
          }))}
          emptyTitle={copy("noMacros")}
          emptyHint={copy("noMacrosHint")}
        />

        <TrendChart
          title="Steps"
          color="chart-4"
          maxHint={store.goals.steps}
          points={series.map((p) => ({
            date: p.date,
            label: p.label,
            value: p.steps,
          }))}
          emptyTitle={copy("noSteps")}
          emptyHint={copy("noStepsHint")}
          onLog={() => setSteps(todayISO(), store.goals.steps)}
          logLabel={copy("logSteps")}
        />

        <TrendChart
          title="Water"
          unit="ml"
          color="chart-3"
          maxHint={store.goals.waterMl}
          points={series.map((p) => ({
            date: p.date,
            label: p.label,
            value: p.waterMl,
          }))}
          emptyTitle={copy("noWater")}
          emptyHint={copy("noWaterHint")}
          onLog={() => addWater(todayISO(), 250)}
          logLabel={copy("logWater")}
        />

        <TrendChart
          title="Sleep"
          unit="/5"
          color="chart-2"
          maxHint={5}
          points={series.map((p) => ({
            date: p.date,
            label: p.label,
            value: p.sleep,
          }))}
          emptyTitle={copy("noSleep")}
          emptyHint={copy("noSleepHint")}
          onLog={() => setSleep(todayISO(), 3)}
          logLabel={copy("logSleep")}
        />

        <TrendChart
          title={copy("energyLabels")}
          unit="/5"
          color="chart-5"
          maxHint={5}
          points={series.map((p) => ({
            date: p.date,
            label: p.label,
            value: p.energy,
          }))}
          emptyTitle={copy("noEnergy")}
          emptyHint={copy("noEnergyHint")}
          onLog={() => setEnergy(todayISO(), 3)}
          logLabel={copy("logEnergy")}
        />

        <TrendChart
          title={copy("caffeineTrend")}
          unit="mg"
          color="chart-6"
          maxHint={store.goals.caffeineMg}
          points={series.map((p) => ({
            date: p.date,
            label: p.label,
            value: p.caffeineMg,
          }))}
          emptyTitle={copy("noCaffeine")}
          emptyHint={copy("noCaffeineHint")}
        />

        <TrendChart
          title={copy("workoutTrend")}
          unit="min"
          color="chart-2"
          points={series.map((p) => ({
            date: p.date,
            label: p.label,
            value: p.workoutMin,
          }))}
          emptyTitle={copy("noWorkoutTrend")}
          emptyHint={copy("noWorkoutHint")}
        />

        <LineChart
          title="Weight"
          unit="kg"
          points={weightPoints}
          emptyTitle={copy("noWeight")}
          emptyHint={copy("noWeightHint")}
        />

        {/* 5. Goals */}
        <article className="rounded-pan border border-border bg-card p-4">
          <h2 className="font-display text-title3 text-foreground">{t("progress.goals")}</h2>
          <div className="mt-3 space-y-3">
            {goalsToday.map((g) => (
              <Meter key={g.id} label={g.label} value={g.score} target={100} score={g.score} />
            ))}
          </div>
          <p className="mt-2 font-sans text-caption text-muted-foreground">
            Calorie completion rewards being near your target — not eating less.
          </p>
        </article>

        {/* 6. Phase insights */}
        <article className="rounded-pan border border-border bg-card p-4">
          <h2 className="font-display text-title3 text-foreground">{t("progress.byPhase")}</h2>
          <Disclaimer>
            Patterns describe your logged history. They do not prove hormonal causes.
          </Disclaimer>
          <div className="mt-3 space-y-3">
            {phaseStats.map((p) => (
              <div key={p.phase} className="rounded-md bg-secondary p-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      p.phase === "menstrual"
                        ? "bg-menstrual"
                        : p.phase === "follicular"
                          ? "bg-follicular"
                          : p.phase === "ovulation"
                            ? "bg-ovulation"
                            : "bg-luteal",
                    )}
                  />
                  <p className="font-sans text-body-strong">{t(`phases.${p.phase}`)}</p>
                  <p className="ml-auto font-sans text-caption text-muted-foreground">
                    {p.sampleDays > 0 ? `${p.sampleDays} ${t("progress.daysTracked")}` : "–"}
                  </p>
                </div>
                {p.sampleDays === 0 ? (
                  <EmptyState>{copy("notEnoughPhase")}</EmptyState>
                ) : (
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                    {(
                      [
                        ["Cal", p.avgCalories],
                        ["Steps", p.avgSteps],
                        ["Sleep", p.avgSleep],
                        ["Energy", p.avgEnergy],
                      ] as const
                    ).map(([label, value]) => (
                      <div key={label}>
                        <p className="font-sans text-label uppercase text-muted-foreground">
                          {label}
                        </p>
                        <p
                          className={cn(
                            "mt-1 font-display text-title3 tabular-nums",
                            value == null ? "text-ink-subtle" : "text-foreground",
                          )}
                        >
                          {value == null
                            ? "–"
                            : label === "Steps" && value >= 1000
                              ? `${(value / 1000).toFixed(1)}k`
                              : value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {p.sampleDays > 0 ? (
                  <ul className="mt-2 font-sans text-caption text-muted-foreground">
                    <li>
                      {t("progress.topMood")}:{" "}
                      {p.topMood ? chipLabel(p.topMood, language) : "–"}
                    </li>
                    <li>
                      {t("progress.topSymptom")}:{" "}
                      {p.topSymptom ? chipLabel(p.topSymptom, language) : "–"}
                    </li>
                    <li>{t("progress.workouts")}: {p.workouts || "–"}</li>
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </article>

        <PhaseBars title={copy("energyByPhase")} rows={phaseEnergyRows} />
        <PhaseBars title={copy("stepsByPhase")} rows={phaseStepsRows} />

        {/* 7. Weight list */}
        <article className="rounded-pan border border-border bg-card p-4">
          <h2 className="font-display text-title3 text-foreground">{t("progress.weight")}</h2>
          {weights.length === 0 ? (
            <EmptyState>{copy("noWeightLong")}</EmptyState>
          ) : (
            <ul className="mt-2 space-y-1 font-sans text-caption">
              {weights
                .slice()
                .reverse()
                .slice(0, 12)
                .map((w) => (
                  <li key={w.id}>
                    {formatDisplayDate(w.date)} · {w.kg} kg
                    {w.note ? ` · ${w.note}` : ""}
                  </li>
                ))}
            </ul>
          )}
        </article>

        {(totals.avgSleep != null || totals.avgEnergy != null) && (
          <p className="font-sans text-caption text-muted-foreground">
            {copy("sleepLabels")}: {SLEEP_LEVELS.map((s) => chipLabel(`sleep:${s.id}`, language)).join(" · ")} · {copy("energyLabels")}:{" "}
            {ENERGY_LEVELS.map((e) => chipLabel(`energy:${e.id}`, language)).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}
