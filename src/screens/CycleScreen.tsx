import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { es as esLocale, fi as fiLocale, tr as trLocale } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { EmptyState, Disclaimer } from "@/components/ui/Section";
import { Button } from "@/components/ui/button";
import { MoodChip } from "@/components/MoodChip";
import { PhaseChip } from "@/components/PhaseChip";
import { BodyLogScreen } from "@/screens/BodyLogScreen";
import { PeriodEditor } from "@/screens/HomeScreen";
import { useAppStore } from "@/store/useAppStore";
import { useT } from "@/i18n";
import { chipLabel, usePage } from "@/i18n/pageCopy";
import {
  computeCycleSnapshot,
  isEstimatedOvulationDay,
  isInFertileWindow,
  isMenstruationDay,
  isPredictedPeriodDay,
  cyclePositionForDate,
  type CycleAssumptions,
} from "@/lib/cycle";
import { cycleAssumptions } from "@/lib/onboarding";
import { getPhaseContent } from "@/data/phaseContent";
import { PHASE_HEADLINES } from "@/lib/phaseUi";
import {
  familyForFeeling,
  familyForSymptom,
  MOOD_CHIP_ORDER,
} from "@/data/moodFamilies";
import {
  APPETITE_LEVELS,
  ENERGY_LEVELS,
  SLEEP_LEVELS,
  SYMPTOMS,
} from "@/data/labels";
import { appetiteByPhase } from "@/lib/analytics";
import {
  addISODays,
  daysInMonth,
  diffISODays,
  startOfMonthISO,
  subISODays,
  todayISO,
  weekdayIndex,
} from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { CyclePhase, Feeling, ISODate, Symptom } from "@/types";

const PHASE_DOT: Record<CyclePhase, string> = {
  menstrual: "bg-menstrual",
  follicular: "bg-follicular",
  ovulation: "bg-ovulation",
  luteal: "bg-luteal",
};

const PHASE_LEGEND: Record<CyclePhase, string> = {
  menstrual: "bg-menstrual-tint text-menstrual-ink",
  follicular: "bg-follicular-tint text-follicular-ink",
  ovulation: "bg-ovulation-tint text-ovulation-ink",
  luteal: "bg-luteal-tint text-luteal-ink",
};

const PHASE_CARD: Record<CyclePhase, string> = {
  menstrual: "bg-menstrual-tint text-menstrual-ink",
  follicular: "bg-follicular-tint text-follicular-ink",
  ovulation: "bg-ovulation-tint text-ovulation-ink",
  luteal: "bg-luteal-tint text-luteal-ink",
};

function dayCellClass(
  day: ISODate,
  periods: ReturnType<typeof useAppStore.getState>["periods"],
  assumptions?: CycleAssumptions,
): string {
  const today = todayISO();
  const snap = computeCycleSnapshot(periods, day, assumptions);
  const position = cyclePositionForDate(periods, day, assumptions);
  const phase = position?.phase ?? null;
  const menstruating = isMenstruationDay(periods, day);
  const ovulation =
    isEstimatedOvulationDay(snap, day) ||
    (position?.phase === "ovulation" &&
      position.phaseDay === Math.ceil(position.phaseLength / 2));
  const fertile = isInFertileWindow(snap, day);
  const predictedPeriod = isPredictedPeriodDay(periods, day, 90, assumptions);
  const future = diffISODays(day, today) > 0;
  const predicted = future || predictedPeriod;

  let base = "bg-secondary text-foreground font-semibold";
  if (menstruating) {
    base = "bg-menstrual text-silk font-bold";
  } else if (ovulation) {
    base = "bg-ovulation text-foreground font-bold";
  } else if (phase === "menstrual" || predictedPeriod) {
    base = "bg-menstrual-tint text-menstrual-ink font-semibold";
  } else if (fertile || phase === "ovulation") {
    base = "bg-ovulation-tint text-ovulation-ink font-semibold";
  } else if (phase === "follicular") {
    base = "bg-follicular-tint text-follicular-ink font-semibold";
  } else if (phase === "luteal") {
    base = "bg-luteal-tint text-luteal-ink font-semibold";
  }

  const dashed =
    predicted && !menstruating
      ? snap.phase === "follicular"
        ? "border border-dashed border-follicular-ink/30"
        : snap.phase === "ovulation" || fertile || ovulation
          ? "border border-dashed border-ovulation-ink/30"
          : snap.phase === "luteal"
            ? "border border-dashed border-luteal-ink/30"
            : predictedPeriod
              ? "border border-dashed border-menstrual-ink/30"
              : "border border-dashed border-input/30"
      : "";

  const todayRing = day === today ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "";
  return cn(base, dashed, todayRing);
}

function SleepTrend({
  logs,
  onLogSleep,
}: {
  logs: { date: ISODate; sleep: number | null }[];
  onLogSleep: () => void;
}) {
  const copy = usePage();
  const values = logs.map((l) => l.sleep);
  const hasData = values.some((v) => v != null);
  if (!hasData) {
    return (
      <div className="mt-3 rounded-md border border-dashed border-border bg-card px-4 py-6 text-center">
        <p className="font-sans text-body text-foreground">{copy("noSleepYet")}</p>
        <p className="mt-1 font-sans text-caption text-muted-foreground">
          {copy("noSleepHint")}
        </p>
        <button
          type="button"
          onClick={onLogSleep}
          className="mt-4 inline-flex h-8 items-center rounded-pill bg-brand-tint px-4 font-sans text-chip text-primary"
        >
          {copy("logSleep")}
        </button>
      </div>
    );
  }
  const max = 5;
  return (
    <div className="mt-3 flex h-28 items-end gap-1.5">
      {logs.map((l) => {
        const v = l.sleep;
        const h = v != null ? (v / max) * 100 : 0;
        const isToday = l.date === todayISO();
        const peak = v != null && v === Math.max(...values.filter((x): x is number => x != null));
        return (
          <div key={l.date} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-24 w-full items-end justify-center">
              {v != null ? (
                <div
                  className={cn(
                    "w-full max-w-[28px] rounded-t-sm",
                    isToday || peak ? "bg-chart-1" : "bg-chart-2",
                  )}
                  style={{ height: `${Math.max(h, 8)}%` }}
                />
              ) : (
                <div className="h-2 w-full max-w-[28px] rounded-sm bg-secondary" />
              )}
            </div>
            <span className="font-sans text-[10px] text-muted-foreground">
              {format(parseISO(l.date), "EEEEE")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function statDisplay(value: number | null | undefined, suffix = ""): string {
  if (value == null || Number.isNaN(value)) return "–";
  return `${value}${suffix}`;
}

export function CycleScreen() {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const periods = useAppStore((s) => s.periods);
  const t = useT();
  const copy = usePage();
  const language = useAppStore((s) => s.language);
  const dateLocale = language === "tr" ? trLocale : language === "es" ? esLocale : language === "fi" ? fiLocale : undefined;
  const cycleProfile = useAppStore((s) => s.cycleProfile);
  const assumptions = useMemo(() => cycleAssumptions(cycleProfile), [cycleProfile]);
  const dailyLogs = useAppStore((s) => s.dailyLogs);
  const getDailyLog = useAppStore((s) => s.getDailyLog);
  const setFeelings = useAppStore((s) => s.setFeelings);
  const setSymptoms = useAppStore((s) => s.setSymptoms);
  const setEnergy = useAppStore((s) => s.setEnergy);
  const setSleep = useAppStore((s) => s.setSleep);
  const setAppetite = useAppStore((s) => s.setAppetite);
  const store = useAppStore();
  const [monthCursor, setMonthCursor] = useState(startOfMonthISO(selectedDate));
  const [showPeriods, setShowPeriods] = useState(false);
  const [showBodyLog, setShowBodyLog] = useState(false);

  const snapshot = useMemo(
    () => computeCycleSnapshot(periods, selectedDate, assumptions),
    [periods, selectedDate, assumptions],
  );
  const content = getPhaseContent(snapshot.phase, language);
  const log = getDailyLog(selectedDate);
  const appetiteMap = useMemo(() => appetiteByPhase(store), [store]);
  const headline = snapshot.phase
    ? language === "en"
      ? PHASE_HEADLINES[snapshot.phase]
      : content?.name ?? t(`phases.${snapshot.phase}`)
    : null;

  const sleepWeek = useMemo(() => {
    const end = todayISO();
    return Array.from({ length: 7 }, (_, i) => {
      const date = subISODays(end, 6 - i);
      return { date, sleep: dailyLogs[date]?.sleep ?? null };
    });
  }, [dailyLogs]);

  const toggleFeeling = (id: Feeling) => {
    const next = log.feelings.includes(id)
      ? log.feelings.filter((f) => f !== id)
      : [...log.feelings, id];
    setFeelings(selectedDate, next);
  };

  const toggleSymptom = (id: Symptom) => {
    const next = log.symptoms.includes(id)
      ? log.symptoms.filter((s) => s !== id)
      : [...log.symptoms, id];
    setSymptoms(selectedDate, next);
  };

  const feelingLabel = (id: Feeling) => chipLabel(id, language);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-8">
        {/* 1. Current phase */}
        {content && snapshot.phase ? (
          <article className={cn("rounded-pan p-5", PHASE_CARD[snapshot.phase])}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-sans text-label uppercase tracking-[0.08em] opacity-80">
                {t("flow.phaseLabel")}
              </p>
              {snapshot.cycleDay != null ? (
                <span className="rounded-pill bg-card/70 px-3 py-1 font-sans text-label uppercase tracking-[0.08em]">
                  Day {snapshot.cycleDay}
                </span>
              ) : null}
            </div>
            <h2 className="mt-3 font-display text-title2">{headline}</h2>
            <p className="mt-2 font-sans text-body opacity-90">{content.short}</p>
            <p className="mt-2 font-sans text-caption opacity-80">{content.hormones}</p>
          </article>
        ) : (
          <EmptyState>{copy("unlockPhase")}</EmptyState>
        )}

        {/* 2. Self-care */}
        {content ? (
          <article className="rounded-pan border border-border bg-card p-4">
            <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
              {snapshot.phase ? t(`phases.${snapshot.phase}`) : ""}
            </p>
            <p className="mt-2 font-display italic text-body text-foreground">
              {content.mood}
            </p>
            <ul className="mt-3 space-y-2">
              {content.activities.slice(0, 6).map((a) => (
                <li key={a} className="flex items-start gap-2 font-sans text-caption text-foreground">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ovulation" aria-hidden="true" />
                  {a}
                </li>
              ))}
            </ul>
          </article>
        ) : null}

        {/* 3. How are you feeling */}
        <article className="rounded-pan border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
              {copy("feeling")}?
            </p>
            <button
              type="button"
              onClick={() => setShowBodyLog(true)}
              className="font-sans text-caption text-link underline"
            >
              {copy("fullLog")}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {MOOD_CHIP_ORDER.map((id) => (
              <MoodChip
                key={id}
                family={familyForFeeling(id)}
                selected={log.feelings.includes(id)}
                onClick={() => toggleFeeling(id)}
              >
                {feelingLabel(id)}
              </MoodChip>
            ))}
          </div>
        </article>

        {/* 4. Physical symptoms */}
        <article className="rounded-pan border border-border bg-card p-4">
          <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
            {copy("symptoms")}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SYMPTOMS.map((s) => (
              <MoodChip
                key={s.id}
                family={familyForSymptom(s.id)}
                selected={log.symptoms.includes(s.id)}
                onClick={() => toggleSymptom(s.id)}
              >
                {chipLabel(s.id, language)}
              </MoodChip>
            ))}
          </div>
        </article>

        {/* 5. Energy */}
        <article className="rounded-pan border border-border bg-card p-4">
          <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
            {copy("energyLevel")}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {ENERGY_LEVELS.map((e) => (
              <MoodChip
                key={e.id}
                family={e.id >= 4 ? "bright" : e.id <= 2 ? "low" : "neutral"}
                selected={log.energy === e.id}
                onClick={() => setEnergy(selectedDate, log.energy === e.id ? null : e.id)}
              >
                {chipLabel(`energy:${e.id}`, language)}
              </MoodChip>
            ))}
          </div>
        </article>

        {/* 6. Sleep */}
        <article className="rounded-pan border border-border bg-card p-4">
          <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
            {copy("sleepQuality")}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SLEEP_LEVELS.map((e) => (
              <MoodChip
                key={e.id}
                family={e.id >= 4 ? "calm" : e.id <= 2 ? "tense" : "neutral"}
                selected={log.sleep === e.id}
                onClick={() => setSleep(selectedDate, log.sleep === e.id ? null : e.id)}
              >
                {chipLabel(`sleep:${e.id}`, language)}
              </MoodChip>
            ))}
          </div>
        </article>

        {/* 7. Appetite */}
        <article className="rounded-pan border border-border bg-card p-4">
          <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
            {copy("appetite")}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {APPETITE_LEVELS.map((e) => (
              <MoodChip
                key={e.id}
                family={e.id >= 3 ? "bright" : e.id <= 1 ? "low" : "neutral"}
                selected={log.appetite === e.id}
                onClick={() => setAppetite(selectedDate, log.appetite === e.id ? null : e.id)}
              >
                {chipLabel(`appetite:${e.id}`, language)}
              </MoodChip>
            ))}
          </div>
          <div className="mt-3 font-sans text-caption text-muted-foreground">
            {(Object.keys(appetiteMap) as Array<keyof typeof appetiteMap>).map((phase) => {
              const vals = appetiteMap[phase];
              if (!vals.length) return null;
              const avg = vals.reduce<number>((a, b) => a + b, 0) / vals.length;
              return (
                <p key={phase}>
                  {t(`phases.${phase}`)} · {copy("appetite")} {avg.toFixed(1)} / 4 ({vals.length})
                </p>
              );
            })}
            {!Object.values(appetiteMap).some((v) => v.length) ? (
              <EmptyState>{copy("appetiteLater")}</EmptyState>
            ) : null}
          </div>
        </article>

        {/* 8. Cycle calendar */}
        <article className="rounded-pan border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
              {copy("cycleCalendar")}
            </p>
            <Button className="h-9 rounded-pill px-4" onClick={() => setShowPeriods(true)}>
              {copy("logPeriodTitle")}
            </Button>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label={copy("prevMonth")}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-foreground"
              onClick={() => setMonthCursor(startOfMonthISO(subISODays(monthCursor, 1)))}
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-center">
              <p className="font-display text-title3 text-foreground">
                {format(parseISO(monthCursor), "LLLL yyyy", { locale: dateLocale })}
              </p>
              <p className="mt-0.5 font-sans text-caption text-muted-foreground">
                {t("cycle.estimateDisclaimer")}
              </p>
            </div>
            <button
              type="button"
              aria-label={copy("nextMonth")}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-foreground"
              onClick={() => setMonthCursor(startOfMonthISO(addISODays(monthCursor, 32)))}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="font-sans text-body text-foreground">
              {snapshot.cycleDay != null
                ? copy("dayOf", { day: snapshot.cycleDay, length: snapshot.cycleLength })
                : t("home.startPeriod")}
            </p>
            <PhaseChip phase={snapshot.phase} cycleDay={snapshot.cycleDay} />
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1.5 text-center font-sans text-label uppercase text-muted-foreground">
            {Array.from({ length: 7 }).map((_, i) => {
              const label = format(new Date(2024, 0, 7 + i), "EEEEE", { locale: dateLocale });
              return <span key={i}>{label}</span>;
            })}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1.5">
            {Array.from({ length: weekdayIndex(monthCursor) }).map((_, i) => (
              <span key={`e-${i}`} className="h-11" />
            ))}
            {Array.from({ length: daysInMonth(monthCursor) }).map((_, i) => {
              const day = addISODays(monthCursor, i);
              const selected = day === selectedDate;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "flex h-11 items-center justify-center rounded-[14px] font-sans text-body tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    dayCellClass(day, periods, assumptions),
                    selected && day !== todayISO()
                      ? "outline outline-2 outline-offset-1 outline-ring"
                      : "",
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <ul className="mt-4 flex flex-wrap gap-2">
            {(
              ["menstrual", "follicular", "ovulation", "luteal"] as const
            ).map((phase) => (
              <li
                key={phase}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 font-sans text-caption",
                  PHASE_LEGEND[phase],
                )}
              >
                <span className={cn("h-3 w-3 rounded-[4px]", PHASE_DOT[phase])} aria-hidden="true" />
                {phase === "ovulation" ? t("cycle.legendOvulation") : t(`phases.${phase}`)}
              </li>
            ))}
          </ul>
          <p className="mt-3 font-sans text-caption text-muted-foreground">
            {t("cycle.calendarHint")}
          </p>
          <Button
            variant="secondary"
            className="mt-4 w-full"
            onClick={() => setShowPeriods(true)}
          >
            <Pencil size={14} className="mr-2" />
            {t("home.editPeriod")}
          </Button>
        </article>

        {/* 9. Period history */}
        <article className="rounded-pan border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
              {t("cycle.periods")}
            </p>
            <Button
              variant="secondary"
              className="h-8 px-3 text-caption"
              onClick={() => setShowPeriods(true)}
            >
              {t("periodEditor.add")}
            </Button>
          </div>
          {periods.length === 0 ? (
            <EmptyState>{copy("noPeriods")}</EmptyState>
          ) : (
            <ul className="mt-3 space-y-2">
              {[...periods]
                .reverse()
                .slice(0, 5)
                .map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-2 rounded-md bg-secondary px-3 py-2"
                  >
                    <span className="font-sans text-caption text-foreground">
                      {format(parseISO(p.startDate), "EEE d MMM", { locale: dateLocale })} → {format(parseISO(p.endDate), "EEE d MMM", { locale: dateLocale })}
                    </span>
                    <span className="font-sans text-caption text-muted-foreground">{copy("ended")}</span>
                  </li>
                ))}
            </ul>
          )}
        </article>

        {/* 10. Phase insights + recommendations */}
        {content && snapshot.phase ? (
          <article
            className={cn(
              "rounded-pan border p-4",
              PHASE_CARD[snapshot.phase],
              "border-transparent",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn("h-2.5 w-2.5 rounded-full", PHASE_DOT[snapshot.phase])}
                aria-hidden="true"
              />
              <h2 className="font-display text-title3">{copy("phaseInsights")}</h2>
            </div>
            <p className="mt-3 font-sans text-body">{content.short}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 font-sans text-caption">
              {content.recommendations.slice(0, 4).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <Disclaimer>
              {t("cycle.estimateDisclaimer")}
            </Disclaimer>
          </article>
        ) : (
          <article className="rounded-pan border border-border bg-card p-4">
            <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
              Cycle recommendations
            </p>
            <p className="mt-2 font-sans text-caption text-muted-foreground">
              Log your symptoms and emotions to get personalized cycle insights.
            </p>
          </article>
        )}

        {/* 11. Cycle stats (kept) */}
        <section>
            <h2 className="font-display text-title3 text-foreground">{t("cycle.insights")}</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(
              [
                [t("cycle.avgCycle"), snapshot.averageCycleLength, ""],
                [t("cycle.avgPeriod"), snapshot.averagePeriodLength, ""],
                [t("cycle.variability"), snapshot.cycleVariability, ""],
                [
                  t("cycle.nextPeriod"),
                  snapshot.nextPeriodStart
                    ? diffISODays(snapshot.nextPeriodStart, todayISO())
                    : null,
                  "d",
                ],
              ] as const
            ).map(([label, value, suffix]) => (
              <div key={label} className="rounded-pan border border-border bg-card p-4">
                <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
                  {label}
                </p>
                <p
                  className={cn(
                    "mt-2 font-display text-title2 tabular-nums",
                    value == null ? "text-ink-subtle" : "text-foreground",
                  )}
                >
                  {statDisplay(value, suffix)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 12. Sleep chart (added) */}
        <section>
          <h2 className="font-display text-title3 text-foreground">{copy("sleepWeek")}</h2>
          <SleepTrend
            logs={sleepWeek}
            onLogSleep={() => {
              setSleep(todayISO(), 3);
            }}
          />
        </section>
      </div>

      {showPeriods ? <PeriodEditor onClose={() => setShowPeriods(false)} /> : null}
      {showBodyLog ? <BodyLogScreen onClose={() => setShowBodyLog(false)} /> : null}
    </div>
  );
}
