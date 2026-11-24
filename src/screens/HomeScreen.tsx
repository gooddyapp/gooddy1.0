import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Scale,
  Sparkles,
  Flame,
  Utensils,
} from "lucide-react";
import { CycleRing } from "@/components/CycleRing";
import { EmptyState, Disclaimer } from "@/components/ui/Section";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { computeCycleSnapshot } from "@/lib/cycle";
import { cycleAssumptions, homeLead, showsCycle } from "@/lib/onboarding";
import { getPhaseContent } from "@/data/phaseContent";
import { formatDisplayDate, todayISO } from "@/lib/dates";
import { computeAchievements, nutritionTotals } from "@/lib/analytics";
import { PHASE_HEADLINES, PHASE_RING_INSIGHT, hormoneBadge } from "@/lib/phaseUi";
import { shouldShowCheckInCard } from "@/lib/checkIn";
import type { ISODate } from "@/types";
import { format as formatDate, parseISO } from "date-fns";
import { es as esLocale, fi as fiLocale, tr as trLocale } from "date-fns/locale";
import { useT } from "@/i18n";
import { usePage } from "@/i18n/pageCopy";

export function HomeScreen({
  onEditPeriod,
  onOpenTrack,
  onOpenCheckIn,
  onOpenBodyLog,
  onOpenSection,
}: {
  onEditPeriod: () => void;
  onOpenTrack: () => void;
  onOpenCheckIn?: () => void;
  onOpenBodyLog?: () => void;
  onOpenSection?: (tab: "cycle" | "nutrition" | "move" | "habits" | "mindfulness") => void;
}) {
  const t = useT();
  const copy = usePage();
  const selectedDate = useAppStore((s) => s.selectedDate);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const shiftSelectedDate = useAppStore((s) => s.shiftSelectedDate);
  const profile = useAppStore((s) => s.profile);
  const periods = useAppStore((s) => s.periods);
  const goals = useAppStore((s) => s.goals);
  const dailyLogs = useAppStore((s) => s.dailyLogs);
  const foodEntries = useAppStore((s) => s.foodEntries);
  const caffeineEntries = useAppStore((s) => s.caffeineEntries);
  const workouts = useAppStore((s) => s.workouts);
  const habits = useAppStore((s) => s.habits);
  const habitCompletions = useAppStore((s) => s.habitCompletions);
  const weightHistory = useAppStore((s) => s.weightHistory);
  const features = useAppStore((s) => s.features);
  const language = useAppStore((s) => s.language);
  const checkIn = useAppStore((s) => s.checkIn);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const onboardingGoals = useAppStore((s) => s.onboardingGoals);
  const cycleProfile = useAppStore((s) => s.cycleProfile);
  const addWeight = useAppStore((s) => s.addWeight);
  const [weightOpen, setWeightOpen] = useState(false);
  const [weightKg, setWeightKg] = useState("");
  const showFeelingCard = shouldShowCheckInCard({
    features,
    checkIn: checkIn ?? {
      lastPromptDate: null,
      lastCompletedDate: null,
      consecutiveSkips: 0,
      snoozeUntil: null,
    },
    dailyLogs,
    onboardingComplete,
  });

  const data = useMemo(
    () => ({
      language,
      profile,
      goals,
      features,
      periods,
      weightHistory,
      dailyLogs,
      foodEntries,
      customFoods: [],
      favoriteFoodIds: [],
      caffeineEntries,
      workouts,
      journalEntries: [],
      breathingSessions: [],
      habits,
      habitCompletions,
      selectedDate,
      onboardingComplete: true,
      onboardingStep: 0,
      onboardingGoals,
      cycleProfile,
      reminderPrefs: useAppStore.getState().reminderPrefs,
      checkIn: checkIn ?? {
        lastPromptDate: null,
        lastCompletedDate: null,
        consecutiveSkips: 0,
        snoozeUntil: null,
      },
      version: 1,
    }),
    [
      language,
      profile,
      goals,
      features,
      periods,
      weightHistory,
      dailyLogs,
      foodEntries,
      caffeineEntries,
      workouts,
      habits,
      habitCompletions,
      selectedDate,
      checkIn,
      onboardingGoals,
      cycleProfile,
    ],
  );

  const cycleOn = showsCycle(profile.gender);
  const snapshot = useMemo(
    () => computeCycleSnapshot(periods, selectedDate, cycleAssumptions(cycleProfile)),
    [periods, selectedDate, cycleProfile],
  );
  const lead = homeLead(onboardingGoals);
  const content = getPhaseContent(snapshot.phase, language);
  const nut = nutritionTotals(data, selectedDate);
  const log = dailyLogs[selectedDate];
  const water = log?.waterMl ?? 0;
  const steps = log?.steps ?? 0;
  const achievements = computeAchievements(data, selectedDate).slice(0, 3);
  const firstName = (profile.name || "there").split(" ")[0];
  const dateLocale = language === "tr" ? trLocale : language === "es" ? esLocale : language === "fi" ? fiLocale : undefined;
  const weekday = formatDate(parseISO(selectedDate), "EEEE", { locale: dateLocale }).toUpperCase();
  const dateLabel = formatDate(parseISO(selectedDate), "EEEE, d MMM", { locale: dateLocale });
  const insight = snapshot.phase
    ? language !== "en" && content?.mood
      ? content.mood
      : PHASE_RING_INSIGHT[snapshot.phase]
    : undefined;
  const headline = snapshot.phase
    ? language !== "en" && content
      ? content.name
      : PHASE_HEADLINES[snapshot.phase]
    : t("home.startPeriod");
  const phaseTint =
    snapshot.phase === "menstrual"
      ? "bg-menstrual-tint text-menstrual-ink"
      : snapshot.phase === "follicular"
        ? "bg-follicular-tint text-follicular-ink"
        : snapshot.phase === "ovulation"
          ? "bg-ovulation-tint text-ovulation-ink"
          : snapshot.phase === "luteal"
            ? "bg-luteal-tint text-luteal-ink"
            : "bg-card text-foreground";

  const achievementIcons = [Utensils, Scale, Flame];

  return (
    <div className="flex flex-1 flex-col">
      <header className="space-y-4 px-4 pb-2 pt-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
              {weekday}
            </p>
            <h1 className="mt-1 font-display text-title1 text-foreground">
              {t("home.hello")}, <em className="font-accent text-primary">{firstName}</em>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={copy("logWeight")}
              onClick={() => setWeightOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Scale size={18} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              aria-label={copy("quickLog")}
              onClick={onOpenTrack}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Pencil size={18} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            aria-label={copy("prevDay")}
            onClick={() => shiftSelectedDate(-1)}
            className="rounded-md p-2 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft size={18} />
          </button>
          <p className="min-w-[160px] text-center font-sans text-caption font-semibold text-foreground">
            {dateLabel}
          </p>
          <button
            type="button"
            aria-label={copy("nextDay")}
            onClick={() => shiftSelectedDate(1)}
            className="rounded-md p-2 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        {selectedDate !== todayISO() ? (
          <Button variant="secondary" className="h-9 w-full" onClick={() => setSelectedDate(todayISO())}>
            {copy("jumpToday")}
          </Button>
        ) : null}
      </header>

      <div className="flex flex-1 flex-col gap-5 px-4 pb-6">
        {showFeelingCard && onOpenCheckIn ? (
          <button
            type="button"
            onClick={onOpenCheckIn}
            className="rounded-pan border border-border bg-card p-4 text-left ring-1 ring-rose-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
              Check-in
            </p>
            <p className="mt-1 font-display text-title3 text-foreground">
              How are you feeling?
            </p>
            <p className="mt-1 font-sans text-caption text-muted-foreground">
              A quick tap helps tune tips to your phase.
            </p>
          </button>
        ) : null}

        {!showFeelingCard && onOpenBodyLog && !log?.overallMood ? (
          <button
            type="button"
            onClick={onOpenBodyLog}
            className="font-sans text-caption text-link underline underline-offset-2"
          >
            {copy("logMood")}
          </button>
        ) : null}

        {onboardingGoals.length > 0 && onOpenSection ? (
          <section>
            <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
              {t("flow.forYou")}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(lead.bodyLogFirst
                ? (["symptoms", "cycle", "nutrition", "move", "habits", "journal"] as const)
                : (["cycle", "nutrition", "move", "habits", "journal", "symptoms"] as const)
              )
                .filter((id) => {
                  if (id === "cycle" && !cycleOn) return false;
                  if (id === "habits" && !features.habits) return false;
                  if (id === "journal" && !features.mindfulness) return false;
                  const set = new Set(onboardingGoals);
                  if (set.has("exploring")) return true;
                  if (id === "cycle") return set.has("understand_cycle") || set.has("get_pregnant") || set.has("feel_better");
                  if (id === "symptoms") return set.has("track_symptoms") || set.has("get_pregnant");
                  if (id === "nutrition") return set.has("nutrition");
                  if (id === "move") return set.has("stay_active");
                  if (id === "habits") return set.has("habits") || set.has("feel_better");
                  return set.has("feel_better");
                })
                .map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      if (id === "symptoms") onOpenBodyLog?.();
                      else if (id === "cycle") onOpenSection("cycle");
                      else if (id === "nutrition") onOpenSection("nutrition");
                      else if (id === "move") onOpenSection("move");
                      else if (id === "habits") onOpenSection("habits");
                      else onOpenSection("mindfulness");
                    }}
                    className="rounded-pill bg-accent px-3 py-1.5 font-sans text-chip text-accent-foreground"
                  >
                    {id === "cycle"
                      ? t("flow.openCycle")
                      : id === "symptoms"
                        ? t("flow.openSymptoms")
                        : id === "nutrition"
                          ? t("flow.openNutrition")
                          : id === "move"
                            ? t("flow.openMove")
                            : id === "habits"
                              ? t("flow.openHabits")
                              : t("flow.openJournal")}
                  </button>
                ))}
            </div>
          </section>
        ) : null}

        {cycleOn ? (
        <>
        <section className="pt-2">
          <CycleRing snapshot={snapshot} insight={insight} />
          <div className="mt-5 flex justify-center">
            <Button
              variant="secondary"
              className="h-10 rounded-pill px-5"
              onClick={onEditPeriod}
            >
              <Pencil size={14} className="mr-2" />
              {t("home.editPeriod")}
            </Button>
          </div>
        </section>

        {content ? (
          <article className={`rounded-pan p-5 ${phaseTint}`}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-sans text-label uppercase tracking-[0.08em] opacity-80">
                {t("home.phaseInsights")}
              </p>
              {snapshot.cycleDay != null ? (
                <span className="rounded-pill bg-card/70 px-3 py-1 font-sans text-label uppercase tracking-[0.08em]">
                  {t("common.day")} {snapshot.cycleDay}
                </span>
              ) : null}
            </div>
            <h2 className="mt-3 font-display text-title2">{headline}</h2>
            <p className="mt-2 font-sans text-body opacity-90">{content.short}</p>
            <p className="mt-3 font-sans text-caption opacity-80">{content.hormones}</p>
          </article>
        ) : null}

        {content ? (
          <article className="rounded-pan border border-border bg-card p-5 ring-1 ring-rose-gold/40">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-rose-gold" aria-hidden="true" />
              <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
                {t("home.hormones")}
              </p>
            </div>
            <p className="mt-3 font-sans text-caption text-muted-foreground">
              {t("home.hormonesHint")}
            </p>
            <ul className="mt-4 space-y-3">
              {(
                [
                  [language === "tr" ? "Östrojen" : language === "es" ? "Estrógeno" : language === "fi" ? "Estrogeeni" : "Estrogen", content.hormonesDetail.estrogen.pattern, content.hormonesDetail.estrogen.associations],
                  ["LH", content.hormonesDetail.lh.pattern, content.hormonesDetail.lh.role],
                  [language === "tr" ? "Testosteron" : language === "es" ? "Testosterona" : language === "fi" ? "Testosteroni" : "Testosterone", content.hormonesDetail.testosterone.pattern, content.hormonesDetail.testosterone.associations],
                ] as const
              ).map(([name, pattern, body]) => (
                <li key={name} className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-sans text-body-strong text-foreground">{name}</p>
                    <p className="mt-0.5 font-sans text-caption text-muted-foreground">{body}</p>
                  </div>
                  <span className="shrink-0 rounded-pill bg-ovulation-tint px-2.5 py-1 font-sans text-label uppercase tracking-[0.08em] text-ovulation-ink">
                    {hormoneBadge(pattern, language)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-md bg-secondary/80 p-3">
              <p className="font-sans text-body-strong text-foreground">{t("home.bodyNeeds")}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 font-sans text-caption text-muted-foreground">
                {[
                  ...content.bodyNeeds.nutrition.slice(0, 1),
                  ...content.bodyNeeds.exercise.slice(0, 1),
                  ...content.bodyNeeds.hydration.slice(0, 1),
                ].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <Disclaimer>{t("cycle.estimateDisclaimer")}</Disclaimer>
          </article>
        ) : null}
        </>
        ) : (
          <article className="rounded-pan bg-card p-5 ring-1 ring-rose-gold/40">
            <h2 className="font-display text-title2">{t("home.maleLead")}</h2>
            <p className="mt-2 font-sans text-body text-muted-foreground">{t("flow.genderMaleBody")}</p>
          </article>
        )}

        <section>
          <div className="grid grid-cols-3 gap-2">
            {achievements.map((a, i) => {
              const Icon = achievementIcons[i] ?? Flame;
              const pct = a.target ? Math.min(100, Math.round((a.current / a.target) * 100)) : 0;
              return (
                <div key={a.id} className="rounded-pan border border-border bg-card p-3">
                  <Icon size={18} className="text-primary" strokeWidth={1.75} />
                  <p className="mt-2 font-display text-title2 tabular-nums text-foreground">
                    {a.current}
                    <span className="text-caption text-muted-foreground"> / {a.target}</span>
                  </p>
                  <p className="mt-1 font-sans text-[11px] leading-4 text-muted-foreground">
                    {a.id === "food-days"
                      ? t("home.achieveFood")
                      : a.id === "weight-logs"
                        ? t("home.achieveWeight")
                        : a.id === "week-consistency"
                          ? t("home.achieveWeek")
                          : a.id === "habit-month"
                            ? t("home.achieveHabits")
                            : a.id === "workouts-month"
                              ? t("home.achieveMove")
                              : a.title}
                  </p>
                  <div className="mt-2 h-1 overflow-hidden rounded-pill bg-secondary">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2">
          {lead.tiles.map((key) => {
            const m =
              key === "calories"
                ? { label: t("home.calories"), value: String(Math.round(nut.calories)) }
                : key === "water"
                  ? { label: t("home.water"), value: `${(water / 1000).toFixed(water >= 100 ? 1 : 0)}L` }
                  : { label: t("home.steps"), value: String(steps) };
            return (
              <div key={m.label} className="rounded-pan bg-secondary px-3 py-4 text-center">
                <p className="font-display text-title2 tabular-nums text-foreground">{m.value}</p>
                <p className="mt-1 font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
                  {m.label}
                </p>
              </div>
            );
          })}
        </section>
      </div>

      {weightOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-velvet/50 p-4 sm:items-center">
          <div className="w-full max-w-[390px] rounded-pan bg-card p-4">
            <h2 className="font-display text-title2">{copy("logWeight")}</h2>
            <label className="mt-3 block font-sans text-caption">
              {copy("weightKg")}
              <input
                type="number"
                min={0}
                step={0.1}
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </label>
            <div className="mt-4 flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  const n = Number(weightKg);
                  if (!Number.isFinite(n) || n <= 0) return;
                  addWeight(selectedDate, n);
                  setWeightKg("");
                  setWeightOpen(false);
                }}
              >
                Save
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => setWeightOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function PeriodEditor({
  onClose,
}: {
  onClose: () => void;
}) {
  const copy = usePage();
  const periods = useAppStore((s) => s.periods);
  const addPeriod = useAppStore((s) => s.addPeriod);
  const updatePeriod = useAppStore((s) => s.updatePeriod);
  const deletePeriod = useAppStore((s) => s.deletePeriod);
  const [start, setStart] = useState(todayISO());
  const [end, setEnd] = useState(todayISO());
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const save = () => {
    const err = editId ? updatePeriod(editId, start, end) : addPeriod(start, end);
    if (err) setError(err);
    else {
      setError(null);
      setEditId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-velvet/50 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-[390px] overflow-y-auto rounded-pan bg-card p-4 shadow-[0_8px_24px_-12px_rgba(28,10,16,0.25)]">
        <h2 className="font-display text-title2">{editId ? copy("editPeriodTitle") : copy("logPeriodTitle")}</h2>
        <p className="mt-1 font-sans text-caption text-muted-foreground">
          Estimates update when period history changes.
        </p>
        <label className="mt-4 block font-sans text-caption">
          Start
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value as ISODate)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
          />
        </label>
        <label className="mt-3 block font-sans text-caption">
          End
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value as ISODate)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
          />
        </label>
        {error ? <p className="mt-2 font-sans text-caption text-error">{error}</p> : null}
        <div className="mt-4 flex gap-2">
          <Button className="flex-1" onClick={save}>
            Save
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Done
          </Button>
        </div>
        <h3 className="mt-6 font-display text-title2">{copy("history")}</h3>
        {periods.length === 0 ? (
          <EmptyState>{copy("noPeriods")}</EmptyState>
        ) : (
          <ul className="mt-2 space-y-2">
            {[...periods].reverse().map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-md bg-secondary px-3 py-2"
              >
                <span className="font-sans text-caption">
                  {formatDisplayDate(p.startDate)} – {formatDisplayDate(p.endDate)}
                </span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    className="text-link underline"
                    onClick={() => {
                      setEditId(p.id);
                      setStart(p.startDate);
                      setEnd(p.endDate);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-error underline"
                    onClick={() => deletePeriod(p.id)}
                  >
                    Delete
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
