import { useState } from "react";
import { Section, EmptyState, Disclaimer } from "@/components/ui/Section";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/Chip";
import { useAppStore } from "@/store/useAppStore";
import {
  ACTIVITY_LEVELS,
  DIETARY_PREFERENCES,
  WEIGHT_OBJECTIVES,
} from "@/data/labels";
import { todayISO } from "@/lib/dates";
import { ageFromBirthday, MIN_SIGNUP_AGE } from "@/lib/age";
import { LANGUAGES, useT } from "@/i18n";
import { usePage } from "@/i18n/pageCopy";
import { ACTIVITY_LEVEL_KEYS } from "@/i18n/activityLevels";
import { WEIGHT_OBJECTIVE_KEYS } from "@/i18n/weightObjectives";
import { DIETARY_PREFERENCE_KEYS } from "@/i18n/dietaryPreferences";
import type { AppLanguage, CycleStatus, OnboardingGoal } from "@/types";
import { CYCLE_STATUSES, ONBOARDING_GOALS } from "@/lib/onboarding";
import type { TranslationKey } from "@/i18n";
import type { Theme } from "@/App";
import { CloudAccount } from "@/components/CloudAccount";
import { LegalSheet } from "@/components/LegalSheet";
import type { LegalKind } from "@/content/legal";

export function SettingsScreen({
  theme,
  onThemeChange,
}: {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}) {
  const t = useT();
  const copy = usePage();
  const profile = useAppStore((s) => s.profile);
  const goals = useAppStore((s) => s.goals);
  const features = useAppStore((s) => s.features);
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const updateGoals = useAppStore((s) => s.updateGoals);
  const updateFeatures = useAppStore((s) => s.updateFeatures);
  const recalculateGoalsFromProfile = useAppStore((s) => s.recalculateGoalsFromProfile);
  const addWeight = useAppStore((s) => s.addWeight);
  const updateWeight = useAppStore((s) => s.updateWeight);
  const deleteWeight = useAppStore((s) => s.deleteWeight);
  const weightHistory = useAppStore((s) => s.weightHistory);
  const latestWeight = useAppStore((s) => s.latestWeight);
  const deleteAllData = useAppStore((s) => s.deleteAllData);
  const acceptConsent = useAppStore((s) => s.acceptConsent);
  const onboardingGoals = useAppStore((s) => s.onboardingGoals);
  const setOnboardingGoals = useAppStore((s) => s.setOnboardingGoals);
  const cycleProfile = useAppStore((s) => s.cycleProfile);
  const updateCycleProfile = useAppStore((s) => s.updateCycleProfile);
  const commitCycleAnchor = useAppStore((s) => s.commitCycleAnchor);
  const reminderPrefs = useAppStore((s) => s.reminderPrefs);
  const updateReminderPrefs = useAppStore((s) => s.updateReminderPrefs);

  const [weightKg, setWeightKg] = useState(String(latestWeight() ?? ""));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [ageError, setAgeError] = useState<string | null>(null);
  const [legal, setLegal] = useState<LegalKind | null>(null);

  return (
    <div className="flex flex-1 flex-col">
      <header className="px-4 pb-2 pt-8">
        <p className="font-sans text-label uppercase text-muted-foreground">{t("settings.eyebrow")}</p>
        <h1 className="font-display text-title1 text-foreground">{t("settings.title")}</h1>
      </header>
      <div className="flex flex-1 flex-col gap-4 px-4 pb-6">
        <Section title={t("settings.appearance")}>
          <div className="flex gap-2">
            <Chip selected={theme === "light"} onClick={() => onThemeChange("light")}>
              {t("settings.silk")}
            </Chip>
            <Chip selected={theme === "dark"} onClick={() => onThemeChange("dark")}>
              {t("settings.velvet")}
            </Chip>
          </div>
        </Section>

        <Section title={t("settings.language")}>
          <p className="mb-3 font-sans text-caption text-muted-foreground">{t("settings.languageHint")}</p>
          <div className="flex flex-wrap gap-2">
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
        </Section>

        <Section title={t("settings.gender")}>
          <p className="mb-3 font-sans text-caption text-muted-foreground">{t("settings.genderHint")}</p>
          <div className="flex flex-wrap gap-2">
            <Chip
              selected={profile.gender !== "male"}
              onClick={() => {
                updateProfile({ gender: "female" });
                recalculateGoalsFromProfile();
              }}
            >
              {t("flow.genderFemale")}
            </Chip>
            <Chip
              selected={profile.gender === "male"}
              onClick={() => {
                updateProfile({ gender: "male" });
                recalculateGoalsFromProfile();
              }}
            >
              {t("flow.genderMale")}
            </Chip>
          </div>
        </Section>

        <Section title={t("settings.features")}>
          <p className="font-sans text-caption text-muted-foreground">{t("settings.featuresHint")}</p>
          <div className="mt-3 space-y-4">
            <label className="flex items-start justify-between gap-3 font-sans text-caption">
              <span>
                <span className="block text-body-strong text-foreground">{t("settings.mindfulness")}</span>
                <span className="mt-1 block text-muted-foreground">{t("flow.featureMindBody")}</span>
              </span>
              <input
                type="checkbox"
                checked={features.mindfulness}
                onChange={(e) => updateFeatures({ mindfulness: e.target.checked })}
              />
            </label>
            <label className="flex items-start justify-between gap-3 font-sans text-caption">
              <span>
                <span className="block text-body-strong text-foreground">{t("settings.habits")}</span>
                <span className="mt-1 block text-muted-foreground">{t("flow.featureHabitsBody")}</span>
              </span>
              <input
                type="checkbox"
                checked={features.habits}
                onChange={(e) => updateFeatures({ habits: e.target.checked })}
              />
            </label>
          </div>
          <Disclaimer>{t("settings.featuresDisclaimer")}</Disclaimer>
        </Section>

        <Section title={t("settings.checkIn")}>
          <label className="flex items-center justify-between gap-3 font-sans text-caption">
            <span>{t("settings.checkIn")}</span>
            <div className="flex gap-2">
              <Chip
                selected={features.dailyCheckIn !== false}
                onClick={() => updateFeatures({ dailyCheckIn: true })}
              >
                {t("settings.checkInOn")}
              </Chip>
              <Chip
                selected={features.dailyCheckIn === false}
                onClick={() => updateFeatures({ dailyCheckIn: false })}
              >
                {t("settings.checkInOff")}
              </Chip>
            </div>
          </label>
          {features.dailyCheckIn !== false ? (
            <label className="mt-4 block font-sans text-caption">
              {t("settings.checkInAskAfter")}
              <select
                value={features.checkInAskAfterHour ?? ""}
                onChange={(e) =>
                  updateFeatures({
                    checkInAskAfterHour:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">{t("settings.checkInAnyTime")}</option>
                {Array.from({ length: 24 }, (_, h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-muted-foreground">
                {t("settings.checkInDefault")}
              </span>
            </label>
          ) : null}
        </Section>

        <Section title={t("settings.personal")}>
          <label className="block font-sans text-caption">
            {t("settings.email")}
            <input
              type="email"
              autoComplete="email"
              value={profile.email}
              onChange={(e) => updateProfile({ email: e.target.value.trim() })}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
            />
          </label>
          <label className="mt-3 block font-sans text-caption">
            {t("settings.name")}
            <input
              value={profile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
            />
          </label>
          <label className="mt-3 block font-sans text-caption">
            {t("settings.birthday")}
            <input
              type="date"
              max={todayISO()}
              value={profile.birthday ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                if (!value) {
                  setAgeError(null);
                  updateProfile({ birthday: null, age: null });
                  return;
                }
                const n = ageFromBirthday(value);
                if (n == null) {
                  setAgeError(t("flow.birthdayRequired"));
                  return;
                }
                if (n < MIN_SIGNUP_AGE) {
                  setAgeError(t("flow.tooYoung"));
                  return;
                }
                setAgeError(null);
                updateProfile({
                  birthday: value,
                  age: n,
                  ageConfirmedAt: profile.ageConfirmedAt ?? new Date().toISOString(),
                });
                recalculateGoalsFromProfile();
              }}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
            />
            {profile.age != null && profile.age >= MIN_SIGNUP_AGE ? (
              <span className="mt-1 block text-muted-foreground">{t("settings.yearsOld", { age: profile.age })}</span>
            ) : null}
            {ageError ? <span className="mt-1 block text-foreground">{ageError}</span> : null}
          </label>
        </Section>

        <Section title={t("settings.body")}>
          <label className="block font-sans text-caption">
            {t("settings.height")}
            <input
              type="number"
              min={100}
              max={250}
              value={profile.heightCm ?? ""}
              onChange={(e) =>
                updateProfile({
                  heightCm: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
            />
          </label>
          <label className="mt-3 block font-sans text-caption">
            {t("settings.addWeight")}
            <div className="mt-1 flex gap-2">
              <input
                type="number"
                min={30}
                max={300}
                step={0.1}
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              />
              <Button
                className="shrink-0"
                onClick={() => {
                  const kg = Number(weightKg);
                  if (!Number.isFinite(kg) || kg <= 0) return;
                  addWeight(todayISO(), kg);
                  recalculateGoalsFromProfile();
                }}
              >
                {t("common.save")}
              </Button>
            </div>
          </label>
          <ul className="mt-3 space-y-1">
            {[...weightHistory]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 8)
              .map((w) => (
                <li key={w.id} className="flex justify-between gap-2 font-sans text-caption">
                  <span>
                    {w.date}: {w.kg} kg
                  </span>
                  <span className="flex gap-2">
                    <button
                      type="button"
                      className="text-link underline"
                      onClick={() => {
                        const raw = window.prompt(copy("weightKg"), String(w.kg));
                        if (raw == null) return;
                        const kg = Number(raw);
                        if (Number.isFinite(kg)) {
                          updateWeight(w.id, { kg });
                          recalculateGoalsFromProfile();
                        }
                      }}
                    >
                      {t("common.edit")}
                    </button>
                    <button
                      type="button"
                      className="text-error underline"
                      onClick={() => deleteWeight(w.id)}
                    >
                      {t("common.delete")}
                    </button>
                  </span>
                </li>
              ))}
          </ul>
          {!weightHistory.length ? <EmptyState>{copy("noWeightHistory")}</EmptyState> : null}
        </Section>

        <Section title={t("settings.weightObjective")}>
          <div className="flex flex-wrap gap-2">
            {WEIGHT_OBJECTIVES.map((o) => (
              <Chip
                key={o.id}
                selected={profile.weightObjective === o.id}
                onClick={() => {
                  updateProfile({ weightObjective: o.id });
                  recalculateGoalsFromProfile();
                }}
              >
                {t(WEIGHT_OBJECTIVE_KEYS[o.id])}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title={t("settings.activity")}>
          <p className="mb-3 font-sans text-caption text-muted-foreground">{t("settings.activityChanges")}</p>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_LEVELS.map((o) => (
              <Chip
                key={o.id}
                selected={profile.activityLevel === o.id}
                onClick={() => {
                  updateProfile({ activityLevel: o.id });
                  recalculateGoalsFromProfile();
                }}
              >
                {t(ACTIVITY_LEVEL_KEYS[o.id])}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title={t("settings.diet")}>
          <div className="flex flex-wrap gap-2">
            {DIETARY_PREFERENCES.map((o) => (
              <Chip
                key={o.id}
                selected={profile.dietaryPreference === o.id}
                onClick={() => {
                  updateProfile({ dietaryPreference: o.id });
                  recalculateGoalsFromProfile();
                }}
              >
                {t(DIETARY_PREFERENCE_KEYS[o.id])}
              </Chip>
            ))}
          </div>
          <label className="mt-3 block font-sans text-caption">
            {t("settings.restrictions")}
            <input
              value={profile.dietaryRestrictions.join(", ")}
              onChange={(e) =>
                updateProfile({
                  dietaryRestrictions: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
            />
          </label>
        </Section>

        <Section title={t("flow.settingsGoals")}>
          <div className="flex flex-wrap gap-2">
            {ONBOARDING_GOALS.map((id) => (
              <Chip
                key={id}
                selected={onboardingGoals.includes(id)}
                onClick={() => {
                  const next = onboardingGoals.includes(id)
                    ? onboardingGoals.filter((g) => g !== id)
                    : [...onboardingGoals, id];
                  setOnboardingGoals(next);
                }}
              >
                {t(`flow.${({
                  understand_cycle: "goalUnderstand",
                  feel_better: "goalFeel",
                  track_symptoms: "goalSymptoms",
                  habits: "goalHabits",
                  nutrition: "goalNutrition",
                  stay_active: "goalActive",
                  get_pregnant: "goalPregnant",
                  exploring: "goalExplore",
                } as Record<OnboardingGoal, string>)[id]}` as TranslationKey)}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title={t("flow.settingsCycle")}>
          <label className="block font-sans text-caption">
            {t("flow.periodDate")}
            <input
              type="date"
              value={cycleProfile.lastPeriodStart ?? ""}
              onChange={(e) => {
                updateCycleProfile({
                  configured: true,
                  lastPeriodChoice: "exact",
                  lastPeriodStart: e.target.value || null,
                  lastPeriodEstimated: false,
                });
                commitCycleAnchor();
              }}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
            />
          </label>
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              className="h-11 w-11 rounded-pill bg-secondary"
              onClick={() =>
                updateCycleProfile({
                  configured: true,
                  cycleLength: Math.max(15, (cycleProfile.cycleLength ?? 28) - 1),
                  cycleStatus: cycleProfile.cycleStatus === "unknown_length" ? "typical" : cycleProfile.cycleStatus,
                })
              }
            >
              −
            </button>
            <p className="font-display text-title3">
              {cycleProfile.cycleLength == null
                ? t("flow.cycleUnknown")
                : t("flow.cycleDays", { count: cycleProfile.cycleLength })}
            </p>
            <button
              type="button"
              className="h-11 w-11 rounded-pill bg-secondary"
              onClick={() =>
                updateCycleProfile({
                  configured: true,
                  cycleLength: Math.min(60, (cycleProfile.cycleLength ?? 28) + 1),
                  cycleStatus: cycleProfile.cycleStatus === "unknown_length" ? "typical" : cycleProfile.cycleStatus,
                })
              }
            >
              +
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {CYCLE_STATUSES.map((id) => (
              <Chip
                key={id}
                selected={cycleProfile.cycleStatus === id}
                onClick={() => {
                  updateCycleProfile({
                    configured: true,
                    cycleStatus: id as CycleStatus,
                    cycleLength: id === "unknown_length" || id === "no_period" ? null : cycleProfile.cycleLength ?? 28,
                  });
                  commitCycleAnchor();
                }}
              >
                {t(`flow.${({
                  typical: "statusTypical",
                  irregular: "statusIrregular",
                  unknown_length: "statusUnknown",
                  hormonal: "statusHormonal",
                  no_period: "statusNone",
                } as Record<CycleStatus, string>)[id]}` as TranslationKey)}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title={t("flow.settingsReminders")}>
          {(
            [
              ["dailyLog", "flow.dailyLog"],
              ["periodUpcoming", "flow.remindPeriod"],
              ["ovulation", "flow.remindOvulation"],
              ["phaseChanges", "flow.remindPhase"],
              ["luteal", "flow.remindLuteal"],
              ["hydration", "flow.remindWater"],
              ["movement", "flow.remindMove"],
              ["journaling", "flow.remindJournal"],
              ["habits", "flow.remindHabits"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="mt-2 flex items-center justify-between font-sans text-caption">
              {t(label)}
              <input
                type="checkbox"
                checked={Boolean(reminderPrefs[key])}
                onChange={async (e) => {
                  const on = e.target.checked;
                  updateReminderPrefs({ [key]: on });
                  if (on && reminderPrefs.permission !== "granted" && typeof Notification !== "undefined") {
                    const permission = await Notification.requestPermission();
                    updateReminderPrefs({
                      permission: permission === "granted" ? "granted" : permission === "denied" ? "denied" : "dismissed",
                    });
                  }
                  if (key === "dailyLog") {
                    updateFeatures({ dailyCheckIn: on, checkInAskAfterHour: reminderPrefs.dailyLogHour });
                  }
                }}
              />
            </label>
          ))}
          <label className="mt-3 block font-sans text-caption">
            {t("flow.dailyTime")}
            <input
              type="time"
              value={`${String(reminderPrefs.dailyLogHour).padStart(2, "0")}:00`}
              onChange={(e) => {
                const hour = Number(e.target.value.slice(0, 2));
                if (Number.isFinite(hour)) {
                  updateReminderPrefs({ dailyLogHour: hour });
                  updateFeatures({ checkInAskAfterHour: hour });
                }
              }}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
            />
          </label>
        </Section>

        <Section title={t("settings.goals")}>
          <p className="mb-2 font-sans text-caption text-muted-foreground">{t("settings.activityChanges")}</p>
          <p className="mb-3 font-sans text-caption text-muted-foreground">{t("settings.goalBasis")}</p>
          {(
            [
              ["calories", t("settings.calories")],
              ["proteinG", t("settings.protein")],
              ["carbsG", t("settings.carbs")],
              ["fatG", t("settings.fat")],
              ["steps", t("settings.steps")],
              ["waterMl", t("settings.water")],
              ["caffeineMg", t("settings.caffeine")],
              ["exerciseMinutesPerWeek", t("settings.exercise")],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="mt-2 block font-sans text-caption">
              {label}
              <input
                type="number"
                value={goals[key]}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (!Number.isFinite(n)) return;
                  const patch: Record<string, number | boolean> = { [key]: n };
                  if (key === "calories") patch.caloriesManual = true;
                  if (key === "proteinG" || key === "carbsG" || key === "fatG")
                    patch.macrosManual = true;
                  updateGoals(patch);
                }}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </label>
          ))}
          <Button
            variant="secondary"
            className="mt-3 w-full"
            onClick={() => {
              updateGoals({ caloriesManual: false, macrosManual: false });
              recalculateGoalsFromProfile();
            }}
          >
            {t("settings.recalculate")}
          </Button>
        </Section>

        <Section title={t("settings.cloudTitle")}>
          <CloudAccount />
        </Section>

        <Section title={t("settings.privacy")}>
          <p className="font-sans text-caption">
            {profile.healthConsentAt
              ? `${t("settings.consentAccepted")} ${new Date(profile.healthConsentAt).toLocaleString()}`
              : t("settings.consentMissing")}
          </p>
          {!profile.healthConsentAt ? (
            <Button className="mt-2 w-full" onClick={acceptConsent}>
              {t("settings.reviewConsent")}
            </Button>
          ) : null}
          <Disclaimer>{t("settings.privacyDisclaimer")}</Disclaimer>
          <div className="mt-3 flex flex-wrap gap-4">
            <button type="button" className="font-sans text-caption text-link underline" onClick={() => setLegal("privacy")}>
              {t("settings.viewPrivacy")}
            </button>
            <button type="button" className="font-sans text-caption text-link underline" onClick={() => setLegal("terms")}>
              {t("settings.viewTerms")}
            </button>
            <button type="button" className="font-sans text-caption text-link underline" onClick={() => setLegal("support")}>
              {t("settings.viewSupport")}
            </button>
          </div>
          <p className="mt-3 font-sans text-caption text-muted-foreground">{t("settings.supportBody")}</p>
          {!confirmDelete ? (
            <Button variant="destructive" className="mt-3 w-full" onClick={() => setConfirmDelete(true)}>
              {t("settings.deleteAll")}
            </Button>
          ) : (
            <div className="mt-3 space-y-2">
              <p className="font-sans text-caption text-error">{t("settings.deleteConfirm")}</p>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  deleteAllData();
                  setConfirmDelete(false);
                }}
              >
                {t("settings.confirmDelete")}
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => setConfirmDelete(false)}>
                {t("common.cancel")}
              </Button>
            </div>
          )}
        </Section>
      </div>
      {legal ? <LegalSheet kind={legal} onClose={() => setLegal(null)} /> : null}
    </div>
  );
}
