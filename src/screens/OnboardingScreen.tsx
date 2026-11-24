import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/Chip";
import { CycleRing } from "@/components/CycleRing";
import { useAppStore } from "@/store/useAppStore";
import { LANGUAGES, translate, useT, type TranslationKey } from "@/i18n";
import { ACTIVITY_LEVEL_KEYS } from "@/i18n/activityLevels";
import { WEIGHT_OBJECTIVE_KEYS } from "@/i18n/weightObjectives";
import { DIETARY_PREFERENCE_KEYS } from "@/i18n/dietaryPreferences";
import { ACTIVITY_LEVELS, DIETARY_PREFERENCES, WEIGHT_OBJECTIVES } from "@/data/labels";
import { computeCycleSnapshot } from "@/lib/cycle";
import { formatDisplayDate, todayISO } from "@/lib/dates";
import { ageFromBirthday, MIN_SIGNUP_AGE } from "@/lib/age";
import {
  CYCLE_STATUSES,
  LAST_PERIOD_CHOICES,
  ONBOARDING_GOALS,
  cycleAssumptions,
  experienceFor,
  inferLastPeriodStart,
  type ExperienceId,
} from "@/lib/onboarding";
import { previewPeriodReminder, requestNotificationPermission } from "@/lib/reminders";
import type {
  ActivityLevel,
  AppLanguage,
  CycleStatus,
  DietaryPreference,
  ISODate,
  LastPeriodChoice,
  OnboardingGoal,
  WeightObjective,
} from "@/types";
import { cn } from "@/lib/utils";
import { LegalSheet } from "@/components/LegalSheet";
import type { LegalKind } from "@/content/legal";
import { supabaseConfigured } from "@/lib/supabase";
import { signInOrUp } from "@/lib/cloud";

const QUESTION_STEPS = 4;

const GOAL_KEY: Record<OnboardingGoal, TranslationKey> = {
  understand_cycle: "flow.goalUnderstand",
  feel_better: "flow.goalFeel",
  track_symptoms: "flow.goalSymptoms",
  habits: "flow.goalHabits",
  nutrition: "flow.goalNutrition",
  stay_active: "flow.goalActive",
  get_pregnant: "flow.goalPregnant",
  exploring: "flow.goalExplore",
};

const PERIOD_KEY: Record<LastPeriodChoice, TranslationKey> = {
  now: "flow.periodNow",
  weeks_1_2: "flow.periodWeeks12",
  weeks_3_4: "flow.periodWeeks34",
  longer: "flow.periodLonger",
  unsure: "flow.periodUnsure",
  exact: "flow.periodExact",
};

const STATUS_KEY: Record<CycleStatus, TranslationKey> = {
  typical: "flow.statusTypical",
  irregular: "flow.statusIrregular",
  unknown_length: "flow.statusUnknown",
  hormonal: "flow.statusHormonal",
  no_period: "flow.statusNone",
};

const EXP_KEY: Record<ExperienceId, TranslationKey> = {
  cycle: "flow.expCycle",
  symptoms: "flow.expSymptoms",
  nutrition: "flow.expNutrition",
  movement: "flow.expMovement",
  habits: "flow.expHabits",
  journal: "flow.expJournal",
  learn: "flow.expLearn",
};

const CREATING_KEYS: TranslationKey[] = [
  "flow.creating1",
  "flow.creating2",
  "flow.creating3",
  "flow.creating4",
  "flow.creating5",
];

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function OnboardingScreen() {
  const t = useT();
  const step = useAppStore((s) => s.onboardingStep);
  const setOnboardingStep = useAppStore((s) => s.setOnboardingStep);
  const profile = useAppStore((s) => s.profile);
  const goals = useAppStore((s) => s.onboardingGoals);
  const cycle = useAppStore((s) => s.cycleProfile);
  const periods = useAppStore((s) => s.periods);
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const setOnboardingGoals = useAppStore((s) => s.setOnboardingGoals);
  const updateCycleProfile = useAppStore((s) => s.updateCycleProfile);
  const addWeight = useAppStore((s) => s.addWeight);
  const recalculateGoalsFromProfile = useAppStore((s) => s.recalculateGoalsFromProfile);
  const updateReminderPrefs = useAppStore((s) => s.updateReminderPrefs);
  const features = useAppStore((s) => s.features);
  const updateFeatures = useAppStore((s) => s.updateFeatures);
  const acceptConsent = useAppStore((s) => s.acceptConsent);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const [error, setError] = useState<string | null>(null);
  const [exactDate, setExactDate] = useState<ISODate>(cycle.lastPeriodStart ?? todayISO());
  const [length, setLength] = useState(cycle.cycleLength ?? 28);
  const [heightCm, setHeightCm] = useState(profile.heightCm != null ? String(profile.heightCm) : "");
  const [weightKg, setWeightKg] = useState("");
  const [email, setEmail] = useState(profile.email);
  const [name, setName] = useState(profile.name);
  const [healthOk, setHealthOk] = useState(Boolean(profile.healthConsentAt));
  const [birthday, setBirthday] = useState(profile.birthday ?? "");
  const [tooYoung, setTooYoung] = useState(false);
  const [marketing, setMarketing] = useState(profile.marketingOptIn);
  const [legal, setLegal] = useState<LegalKind | null>(null);
  const [password, setPassword] = useState("");
  const [haveAccount, setHaveAccount] = useState(false);
  const [creatingMsg, setCreatingMsg] = useState(0);
  const [creatingReady, setCreatingReady] = useState(false);

  const goalSet = new Set(goals);
  const showFertile = cycle.cycleStatus !== "hormonal" && cycle.cycleStatus !== "no_period";
  const snapshot = useMemo(
    () => computeCycleSnapshot(periods, todayISO(), cycleAssumptions(cycle)),
    [periods, cycle],
  );

  const go = (next: number) => {
    setError(null);
    setOnboardingStep(next);
  };

  const toggleGoal = (id: OnboardingGoal) => {
    const current = useAppStore.getState().onboardingGoals;
    const next = current.includes(id) ? current.filter((g) => g !== id) : [...current, id];
    setOnboardingGoals(next);
  };

  const savePeriod = () => {
    if (cycle.lastPeriodChoice === "exact" && !exactDate) {
      setError(t("flow.periodNeedDate"));
      return false;
    }
    const choice = cycle.lastPeriodChoice ?? "unsure";
    const inferred = inferLastPeriodStart(choice, exactDate);
    updateCycleProfile({
      lastPeriodChoice: choice,
      lastPeriodStart: inferred.start,
      lastPeriodEstimated: inferred.estimated,
    });
    return true;
  };

  const saveCycle = () => {
    const unknown = cycle.cycleStatus === "unknown_length" || cycle.cycleStatus === "no_period";
    updateCycleProfile({
      configured: true,
      cycleLength: unknown ? null : length,
      periodLength: 5,
    });
    const err = useAppStore.getState().commitCycleAnchor();
    if (err) {
      setError(err);
      return false;
    }
    return true;
  };

  const saveWellness = () => {
    const patch: { heightCm?: number | null } = {};
    if (heightCm.trim()) {
      const h = Number(heightCm);
      if (!Number.isFinite(h) || h < 100 || h > 250) {
        setError(t("onboarding.heightRequired"));
        return false;
      }
      patch.heightCm = h;
    }
    if (weightKg.trim()) {
      const w = Number(weightKg);
      if (!Number.isFinite(w) || w < 30 || w > 300) {
        setError(t("onboarding.weightRequired"));
        return false;
      }
      addWeight(todayISO(), w);
    }
    updateProfile(patch);
    recalculateGoalsFromProfile();
    return true;
  };

  const continueFrom = () => {
    setError(null);
    if (step === 0) {
      const age = ageFromBirthday(birthday);
      if (!birthday || age == null) {
        setTooYoung(false);
        setError(t("flow.birthdayRequired"));
        return;
      }
      if (age < MIN_SIGNUP_AGE) {
        setTooYoung(true);
        setError(null);
        return;
      }
      setTooYoung(false);
      updateProfile({ birthday, age, ageConfirmedAt: new Date().toISOString() });
    }
    if (step === 1 && goals.length === 0) {
      setError(t("flow.goalsNeedOne"));
      return;
    }
    if (step === 1 && profile.gender === "male") {
      updateCycleProfile({
        cycleStatus: "no_period",
        configured: true,
        lastPeriodChoice: "unsure",
        lastPeriodStart: null,
        lastPeriodEstimated: false,
      });
      useAppStore.getState().commitCycleAnchor();
      go(4);
      return;
    }
    if (step === 2 && !savePeriod()) return;
    if (step === 3 && !saveCycle()) return;
    if (step === 4 && !saveWellness()) return;
    go(step + 1);
  };

  useEffect(() => {
    if (step !== 5) return;
    let cancelled = false;
    const state = useAppStore.getState();
    const anchorError = state.commitCycleAnchor();
    const ready = state.onboardingGoals.length > 0 && !anchorError && state.cycleProfile.configured;
    if (!ready) {
      setCreatingReady(false);
      const language = useAppStore.getState().language;
      setError(anchorError ?? translate(language, "flow.creatingError"));
      return;
    }
    setCreatingReady(true);
    setError(null);
    setCreatingMsg(0);
    const timers = CREATING_KEYS.map((_, i) =>
      window.setTimeout(() => {
        if (!cancelled) setCreatingMsg(i);
      }, i * 650),
    );
    const done = window.setTimeout(() => {
      if (!cancelled) setOnboardingStep(6);
    }, 3400);
    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(done);
    };
  }, [step, setOnboardingStep]);

  const saveAccount = async () => {
    if (!name.trim()) {
      setError(t("onboarding.nameRequired"));
      return;
    }
    if (!isValidEmail(email)) {
      setError(t("onboarding.emailInvalid"));
      return;
    }
    const age = ageFromBirthday(birthday);
    if (age == null || age < MIN_SIGNUP_AGE) {
      setTooYoung(age != null && age < MIN_SIGNUP_AGE);
      setError(age == null ? t("flow.birthdayRequired") : null);
      return;
    }
    if (!healthOk) {
      setError(t("flow.healthConsent"));
      return;
    }
    updateProfile({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      marketingOptIn: marketing,
      ageConfirmedAt: new Date().toISOString(),
    });
    acceptConsent();
    if (supabaseConfigured) {
      if (password.length < 8) {
        setError(t("flow.passwordShort"));
        return;
      }
      const result = await signInOrUp(
        email.trim().toLowerCase(),
        password,
        haveAccount ? "sign-in" : "sign-up",
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.needsConfirmation) {
        setError(t("flow.confirmEmail"));
        setHaveAccount(true);
        return;
      }
    }
    go(8);
  };

  const finishReminders = async (enable: boolean) => {
    if (!enable) {
      updateReminderPrefs({ permission: "dismissed" });
      completeOnboarding();
      return;
    }
    const permission = await requestNotificationPermission();
    const granted = permission === "granted";
    const prefs = useAppStore.getState().reminderPrefs;
    updateReminderPrefs({
      permission: granted ? "granted" : permission === "denied" ? "denied" : "dismissed",
    });
    if (prefs.dailyLog) {
      updateFeatures({ dailyCheckIn: true, checkInAskAfterHour: prefs.dailyLogHour });
    }
    if (permission === "denied") {
      setError(t("flow.permissionDenied"));
      return;
    }
    completeOnboarding();
  };

  const questionIndex = step >= 1 && step <= 4 ? step : 0;
  const phaseKey =
    snapshot.phase === "menstrual"
      ? "flow.phaseBlurbMenstrual"
      : snapshot.phase === "follicular"
        ? "flow.phaseBlurbFollicular"
        : snapshot.phase === "ovulation"
          ? "flow.phaseBlurbOvulation"
          : snapshot.phase === "luteal"
            ? "flow.phaseBlurbLuteal"
            : null;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-background px-4 py-8 text-foreground">
      <p className="font-sans text-label uppercase text-muted-foreground">{t("consent.brand")}</p>
      {questionIndex > 0 ? (
        <>
          <p className="mt-2 font-sans text-caption text-muted-foreground">
            {t("onboarding.stepOf", { current: questionIndex, total: QUESTION_STEPS })}
          </p>
          <div className="mt-2 h-1 overflow-hidden rounded-pill bg-secondary">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(questionIndex / QUESTION_STEPS) * 100}%` }}
            />
          </div>
        </>
      ) : null}

      {step === 0 ? (
        <>
          <h1 className="mt-4 font-display text-title1">{t("flow.welcomeTitle")}</h1>
          <p className="mt-2 font-sans text-body text-muted-foreground">{t("flow.welcomeBody")}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <Chip
                key={lang.id}
                selected={language === lang.id}
                onClick={() => setLanguage(lang.id as AppLanguage)}
              >
                {lang.nativeName}
              </Chip>
            ))}
          </div>
          <h2 className="mt-8 font-display text-title2">{t("flow.genderTitle")}</h2>
          <p className="mt-2 font-sans text-body text-muted-foreground">{t("flow.genderBody")}</p>
          <div className="mt-4 flex flex-col gap-2">
            {(["female", "male"] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => updateProfile({ gender: id })}
                className={cn(
                  "rounded-pan border px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  profile.gender === id ? "border-primary bg-accent" : "border-border bg-card",
                )}
              >
                <span className="font-sans text-body-strong">{t(id === "female" ? "flow.genderFemale" : "flow.genderMale")}</span>
                <span className="mt-1 block font-sans text-caption text-muted-foreground">
                  {t(id === "female" ? "flow.genderFemaleBody" : "flow.genderMaleBody")}
                </span>
              </button>
            ))}
          </div>
          <label className="mt-6 block font-sans text-caption">
            {t("flow.birthday")}
            <input
              type="date"
              value={birthday}
              max={todayISO()}
              onChange={(e) => {
                setBirthday(e.target.value);
                setTooYoung(false);
                setError(null);
              }}
              className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 font-sans text-body"
            />
            <span className="mt-1 block text-muted-foreground">{t("flow.birthdayHint")}</span>
          </label>
          {tooYoung ? (
            <p className="mt-4 rounded-md bg-secondary px-3 py-3 font-sans text-body text-foreground">{t("flow.tooYoung")}</p>
          ) : null}
        </>
      ) : null}

      {step === 1 ? (
        <>
          <h1 className="mt-4 font-display text-title1">{t("flow.featuresTitle")}</h1>
          <p className="mt-2 font-sans text-body text-muted-foreground">{t("flow.featuresBody")}</p>
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => updateFeatures({ mindfulness: !features.mindfulness })}
              className={cn(
                "rounded-pan border px-4 py-3 text-left",
                features.mindfulness ? "border-primary bg-accent" : "border-border bg-card",
              )}
            >
              <span className="font-sans text-body-strong">{t("settings.mindfulness")}</span>
              <span className="mt-1 block font-sans text-caption text-muted-foreground">{t("flow.featureMindBody")}</span>
            </button>
            <button
              type="button"
              onClick={() => updateFeatures({ habits: !features.habits })}
              className={cn(
                "rounded-pan border px-4 py-3 text-left",
                features.habits ? "border-primary bg-accent" : "border-border bg-card",
              )}
            >
              <span className="font-sans text-body-strong">{t("settings.habits")}</span>
              <span className="mt-1 block font-sans text-caption text-muted-foreground">{t("flow.featureHabitsBody")}</span>
            </button>
          </div>
          <h2 className="mt-8 font-display text-title2">{t("flow.goalsTitle")}</h2>
          <p className="mt-2 font-sans text-body text-muted-foreground">{t("flow.goalsBody")}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {ONBOARDING_GOALS.filter((id) =>
              profile.gender === "male" ? id !== "understand_cycle" && id !== "track_symptoms" && id !== "get_pregnant" : true,
            ).map((id) => (
              <Chip key={id} selected={goalSet.has(id)} onClick={() => toggleGoal(id)}>
                {t(GOAL_KEY[id])}
              </Chip>
            ))}
          </div>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <h1 className="mt-4 font-display text-title1">{t("flow.periodTitle")}</h1>
          <p className="mt-2 font-sans text-body text-muted-foreground">{t("flow.periodBody")}</p>
          <div className="mt-6 flex flex-col gap-2">
            {LAST_PERIOD_CHOICES.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  const inferred = inferLastPeriodStart(id, exactDate);
                  updateCycleProfile({
                    lastPeriodChoice: id,
                    lastPeriodStart: inferred.start,
                    lastPeriodEstimated: inferred.estimated,
                  });
                  if (inferred.start) setExactDate(inferred.start);
                }}
                className={cn(
                  "rounded-md border px-3 py-3 text-left font-sans text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  cycle.lastPeriodChoice === id
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border bg-card text-foreground",
                )}
              >
                {t(PERIOD_KEY[id])}
              </button>
            ))}
          </div>
          {cycle.lastPeriodChoice === "exact" || cycle.lastPeriodStart ? (
            <label className="mt-4 block font-sans text-caption">
              {t("flow.periodDate")}
              <input
                type="date"
                value={exactDate}
                max={todayISO()}
                onChange={(e) => {
                  const value = e.target.value as ISODate;
                  setExactDate(value);
                  updateCycleProfile({
                    lastPeriodChoice: cycle.lastPeriodChoice === "now" ? "now" : "exact",
                    lastPeriodStart: value || null,
                    lastPeriodEstimated: false,
                  });
                }}
                className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 font-sans text-body"
              />
            </label>
          ) : null}
        </>
      ) : null}

      {step === 3 ? (
        <>
          <h1 className="mt-4 font-display text-title1">{t("flow.cycleTitle")}</h1>
          <p className="mt-2 font-sans text-body text-muted-foreground">{t("flow.cycleBody")}</p>
          {cycle.cycleStatus !== "unknown_length" && cycle.cycleStatus !== "no_period" ? (
            <div className="mt-6 flex items-center justify-between rounded-pan bg-card px-4 py-4">
              <button
                type="button"
                className="h-11 w-11 rounded-pill bg-secondary font-sans text-title3"
                onClick={() => setLength((n) => Math.max(15, n - 1))}
                aria-label="-"
              >
                −
              </button>
              <p className="font-display text-title1 tabular-nums">{t("flow.cycleDays", { count: length })}</p>
              <button
                type="button"
                className="h-11 w-11 rounded-pill bg-secondary font-sans text-title3"
                onClick={() => setLength((n) => Math.min(60, n + 1))}
                aria-label="+"
              >
                +
              </button>
            </div>
          ) : (
            <p className="mt-6 font-sans text-caption text-muted-foreground">{t("flow.cycleUnknown")}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {CYCLE_STATUSES.map((id) => (
              <Chip
                key={id}
                selected={cycle.cycleStatus === id}
                onClick={() => updateCycleProfile({ cycleStatus: id })}
              >
                {t(STATUS_KEY[id])}
              </Chip>
            ))}
          </div>
        </>
      ) : null}

      {step === 4 ? (
        <>
          <h1 className="mt-4 font-display text-title1">{t("flow.wellnessTitle")}</h1>
          <p className="mt-2 font-sans text-body text-muted-foreground">{t("flow.wellnessBody")}</p>
          <p className="mt-6 font-sans text-body-strong">{t("onboarding.activity")}</p>
          <p className="mt-1 font-sans text-caption text-muted-foreground">{t("settings.activityChanges")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ACTIVITY_LEVELS.map((o) => (
              <Chip
                key={o.id}
                selected={profile.activityLevel === o.id}
                onClick={() => updateProfile({ activityLevel: o.id as ActivityLevel })}
              >
                {t(ACTIVITY_LEVEL_KEYS[o.id])}
              </Chip>
            ))}
          </div>
          <p className="mt-4 font-sans text-body-strong">{t("onboarding.diet")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {DIETARY_PREFERENCES.map((o) => (
              <Chip
                key={o.id}
                selected={profile.dietaryPreference === o.id}
                onClick={() => updateProfile({ dietaryPreference: o.id as DietaryPreference })}
              >
                {t(DIETARY_PREFERENCE_KEYS[o.id])}
              </Chip>
            ))}
          </div>
          <p className="mt-4 font-sans text-body-strong">{t("onboarding.weightGoal")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {WEIGHT_OBJECTIVES.map((o) => (
              <Chip
                key={o.id}
                selected={profile.weightObjective === o.id}
                onClick={() => updateProfile({ weightObjective: o.id as WeightObjective })}
              >
                {t(WEIGHT_OBJECTIVE_KEYS[o.id])}
              </Chip>
            ))}
          </div>
          <label className="mt-4 block font-sans text-caption">
            {t("flow.heightOptional")}
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 font-sans text-body"
            />
          </label>
          <label className="mt-3 block font-sans text-caption">
            {t("flow.weightOptional")}
            <input
              type="number"
              step={0.1}
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 font-sans text-body"
            />
          </label>
        </>
      ) : null}

      {step === 5 ? (
        <div className="mt-10 flex flex-1 flex-col">
          <h1 className="font-display text-title1">{t("flow.creatingTitle")}</h1>
          <p className="mt-2 font-sans text-body text-muted-foreground">{t("flow.creatingBody")}</p>
          <div className="mt-8 h-1 overflow-hidden rounded-pill bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-700"
              style={{ width: creatingReady ? `${((creatingMsg + 1) / CREATING_KEYS.length) * 100}%` : "8%" }}
            />
          </div>
          <p className="mt-4 font-sans text-body text-foreground">
            {creatingReady ? t(CREATING_KEYS[creatingMsg]) : null}
          </p>
        </div>
      ) : null}

      {step === 6 ? (
        <>
          <h1 className="mt-4 font-display text-title1">{t("flow.planTitle")}</h1>
          <p className="mt-2 font-sans text-body text-muted-foreground">{t("flow.planBody")}</p>
          {profile.gender === "male" ? (
            <p className="mt-6 font-sans text-body text-muted-foreground">{t("flow.genderMaleBody")}</p>
          ) : (
          <div className="mt-6">
            <CycleRing snapshot={snapshot} size={220} />
          </div>
          )}
          {profile.gender === "male" ? null : (
          <section className="mt-4 rounded-pan bg-card p-4">
            <p className="font-sans text-label uppercase text-muted-foreground">{t("flow.yourCycle")}</p>
            <ul className="mt-3 space-y-2 font-sans text-caption">
              <li>
                {t("flow.phaseLabel")}: {snapshot.phase ? t(`phases.${snapshot.phase}`) : t("flow.noPhase")}
              </li>
              <li>
                {t("flow.cycleDay")}: {snapshot.cycleDay ?? "—"}
              </li>
              <li>
                {t("flow.nextPeriod")}:{" "}
                {snapshot.nextPeriodStart ? formatDisplayDate(snapshot.nextPeriodStart) : t("flow.noDate")}
              </li>
              <li>
                {t("flow.cycleLength")}:{" "}
                {cycle.cycleStatus === "unknown_length" || cycle.cycleLength == null
                  ? t("flow.cycleUnknown")
                  : t("flow.cycleDays", { count: snapshot.cycleLength })}
              </li>
              {showFertile && snapshot.fertileWindowStart && snapshot.fertileWindowEnd ? (
                <li>
                  {t("flow.fertile")}: {formatDisplayDate(snapshot.fertileWindowStart)} –{" "}
                  {formatDisplayDate(snapshot.fertileWindowEnd)}
                </li>
              ) : null}
            </ul>
            {phaseKey ? <p className="mt-3 font-sans text-body">{t(phaseKey)}</p> : null}
            <p className="mt-3 font-sans text-caption text-muted-foreground">{t("flow.estimateNote")}</p>
            {showFertile && snapshot.fertileWindowStart ? (
              <p className="mt-2 font-sans text-caption text-muted-foreground">{t("flow.fertileNote")}</p>
            ) : null}
            {cycle.cycleStatus === "irregular" ? (
              <p className="mt-2 font-sans text-caption text-muted-foreground">{t("flow.irregularNote")}</p>
            ) : null}
            {cycle.lastPeriodEstimated ? (
              <p className="mt-2 font-sans text-caption text-muted-foreground">{t("flow.periodBody")}</p>
            ) : null}
          </section>
          )}
          <section className="mt-4 rounded-pan border border-border bg-card p-4">
            <p className="font-sans text-label uppercase text-muted-foreground">{t("flow.yourGoals")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {goals.map((id) => (
                <Chip key={id} selected>
                  {t(GOAL_KEY[id])}
                </Chip>
              ))}
            </div>
          </section>
          <section className="mt-4 rounded-pan border border-border bg-card p-4">
            <p className="font-sans text-label uppercase text-muted-foreground">{t("flow.yourExperience")}</p>
            <ul className="mt-3 space-y-1 font-sans text-body">
              {experienceFor(goals).map((id) => (
                <li key={id}>{t(EXP_KEY[id])}</li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      {step === 7 ? (
        <>
          <h1 className="mt-4 font-display text-title1">{t("flow.accountTitle")}</h1>
          <p className="mt-2 font-sans text-body text-muted-foreground">{t("flow.accountBody")}</p>
          <label className="mt-6 block font-sans text-caption">
            {t("consent.name")}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 font-sans text-body"
              autoComplete="name"
            />
          </label>
          {supabaseConfigured ? (
            <label className="mt-4 block font-sans text-caption">
              {t("flow.password")}
              <input
                type="password"
                value={password}
                autoComplete={haveAccount ? "current-password" : "new-password"}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 font-sans text-body"
              />
              <span className="mt-1 block text-muted-foreground">{t("flow.passwordHint")}</span>
            </label>
          ) : null}
          {supabaseConfigured ? (
            <button
              type="button"
              className="mt-3 font-sans text-caption text-link underline"
              onClick={() => setHaveAccount((v) => !v)}
            >
              {haveAccount ? t("flow.needAccount") : t("flow.haveAccount")}
            </button>
          ) : (
            <p className="mt-4 font-sans text-caption text-muted-foreground">{t("flow.cloudMissing")}</p>
          )}
          <label className="mt-4 block font-sans text-caption">
            {t("onboarding.email")}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 font-sans text-body"
              autoComplete="email"
            />
          </label>
          <label className="mt-3 flex items-start gap-2 font-sans text-caption">
            <input type="checkbox" checked={healthOk} onChange={(e) => setHealthOk(e.target.checked)} />
            <span>{t("flow.healthConsent")}</span>
          </label>
          <label className="mt-3 flex items-start gap-2 font-sans text-caption">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
            />
            <span>{t("flow.marketing")}</span>
          </label>
          <div className="mt-4 flex gap-4">
            <button type="button" className="font-sans text-caption text-link underline" onClick={() => setLegal("terms")}>
              {t("flow.terms")}
            </button>
            <button type="button" className="font-sans text-caption text-link underline" onClick={() => setLegal("privacy")}>
              {t("flow.privacy")}
            </button>
            <button type="button" className="font-sans text-caption text-link underline" onClick={() => setLegal("support")}>
              {t("settings.viewSupport")}
            </button>
          </div>
          <p className="mt-3 font-sans text-caption text-muted-foreground">{t("flow.localNote")}</p>
        </>
      ) : null}

      {step === 8 ? (
        <NotifyStep
          preview={previewPeriodReminder(snapshot)}
          onEnable={() => void finishReminders(true)}
          onLater={() => void finishReminders(false)}
        />
      ) : null}

      {error ? <p className="mt-4 font-sans text-caption text-error">{error}</p> : null}

      {step !== 5 && step !== 8 ? (
        <div className="mt-8 flex gap-2 pb-6">
          {step > 0 && step !== 5 ? (
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => go(step === 6 ? 4 : step === 4 && profile.gender === "male" ? 1 : step - 1)}
            >
              {t("onboarding.back")}
            </Button>
          ) : null}
          {step === 0 ? (
            <Button
              className="flex-1"
              onClick={() => {
                if (!profile.gender) {
                  setError(t("flow.genderNeed"));
                  return;
                }
                go(1);
              }}
            >
              {t("flow.welcomeCta")}
            </Button>
          ) : null}
          {step === 1 ? (
            <Button variant="secondary" onClick={() => { setOnboardingGoals(["exploring"]); go(2); }}>
              {t("onboarding.skip")}
            </Button>
          ) : null}
          {step === 2 ? (
            <Button
              variant="secondary"
              onClick={() => {
                updateCycleProfile({ lastPeriodChoice: "unsure", lastPeriodStart: null, lastPeriodEstimated: false });
                go(3);
              }}
            >
              {t("onboarding.skip")}
            </Button>
          ) : null}
          {step === 3 ? (
            <Button
              variant="secondary"
              onClick={() => {
                updateCycleProfile({ cycleStatus: "unknown_length", cycleLength: null, configured: true });
                useAppStore.getState().commitCycleAnchor();
                go(4);
              }}
            >
              {t("onboarding.skip")}
            </Button>
          ) : null}
          {step === 4 ? (
            <Button variant="secondary" onClick={() => go(5)}>
              {t("onboarding.skip")}
            </Button>
          ) : null}
          {step >= 1 && step <= 4 ? (
            <Button className="flex-1" onClick={continueFrom}>
              {t("onboarding.continue")}
            </Button>
          ) : null}
          {step === 6 ? (
            <Button className="flex-1" onClick={() => go(7)}>
              {t("flow.savePlan")}
            </Button>
          ) : null}
          {step === 7 ? (
            <Button className="flex-1" onClick={saveAccount}>
              {t("flow.savePlan")}
            </Button>
          ) : null}
        </div>
      ) : null}

      {legal ? <LegalSheet kind={legal} onClose={() => setLegal(null)} /> : null}
    </div>
  );
}

function NotifyStep({
  preview,
  onEnable,
  onLater,
}: {
  preview: string;
  onEnable: () => void;
  onLater: () => void;
}) {
  const t = useT();
  const prefs = useAppStore((s) => s.reminderPrefs);
  const updateReminderPrefs = useAppStore((s) => s.updateReminderPrefs);
  const goals = useAppStore((s) => s.onboardingGoals);
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    const set = new Set(goals);
    const exploringOnly = set.size === 1 && set.has("exploring");
    updateReminderPrefs({
      dailyLog: true,
      periodUpcoming: !exploringOnly,
      ovulation: set.has("get_pregnant"),
      phaseChanges: set.has("understand_cycle") || set.has("get_pregnant"),
      luteal: set.has("feel_better"),
      hydration: set.has("nutrition") || set.has("feel_better"),
      movement: set.has("stay_active"),
      journaling: set.has("feel_better"),
      habits: set.has("habits"),
    });
  }, [goals, updateReminderPrefs]);

  const row = (label: string, key: keyof typeof prefs, value: boolean) => (
    <label className="flex items-center justify-between gap-3 py-2 font-sans text-body">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => updateReminderPrefs({ [key]: e.target.checked })}
      />
    </label>
  );

  return (
    <>
      <h1 className="mt-4 font-display text-title1">{t("flow.notifyTitle")}</h1>
      <p className="mt-2 font-sans text-body text-muted-foreground">{t("flow.notifyBody")}</p>
      <div className="mt-4 rounded-pan bg-card p-4 ring-1 ring-rose-gold/50">
        <p className="font-sans text-label uppercase text-muted-foreground">gooddy</p>
        <p className="mt-2 font-sans text-body">{preview}</p>
      </div>
      <p className="mt-6 font-sans text-body-strong">{t("flow.dailyTitle")}</p>
      {row(t("flow.dailyLog"), "dailyLog", prefs.dailyLog)}
      <label className="mt-1 block font-sans text-caption">
        {t("flow.dailyTime")}
        <input
          type="time"
          value={`${String(prefs.dailyLogHour).padStart(2, "0")}:00`}
          onChange={(e) => {
            const hour = Number(e.target.value.slice(0, 2));
            if (Number.isFinite(hour)) updateReminderPrefs({ dailyLogHour: hour });
          }}
          className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 font-sans text-body"
        />
      </label>
      {useAppStore.getState().profile.gender === "male" ? null : (
        <>
      <p className="mt-4 font-sans text-body-strong">{t("flow.cycleReminders")}</p>
      {row(t("flow.remindPeriod"), "periodUpcoming", prefs.periodUpcoming)}
      {row(t("flow.remindOvulation"), "ovulation", prefs.ovulation)}
      {row(t("flow.remindPhase"), "phaseChanges", prefs.phaseChanges)}
      {row(t("flow.remindLuteal"), "luteal", prefs.luteal)}
        </>
      )}
      <p className="mt-4 font-sans text-body-strong">{t("flow.wellnessReminders")}</p>
      {row(t("flow.remindWater"), "hydration", prefs.hydration)}
      {row(t("flow.remindMove"), "movement", prefs.movement)}
      {row(t("flow.remindJournal"), "journaling", prefs.journaling)}
      {row(t("flow.remindHabits"), "habits", prefs.habits)}
      <div className="mt-6 flex flex-col gap-2 pb-6">
        <Button onClick={onEnable}>{t("flow.enable")}</Button>
        <Button variant="secondary" onClick={onLater}>
          {t("flow.later")}
        </Button>
      </div>
    </>
  );
}
