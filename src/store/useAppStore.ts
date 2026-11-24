import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type {
  AppetiteLevel,
  AppData,
  BreathingSession,
  CaffeineEntry,
  DailyLog,
  EnergyLevel,
  Feeling,
  FoodEntry,
  FoodItem,
  Habit,
  HabitCompletion,
  ISODate,
  JournalEntry,
  OverallMood,
  Period,
  SleepQuality,
  Symptom,
  WeightEntry,
  Workout,
  AppLanguage,
  Goals,
  UserProfile,
  FeatureFlags,
  CheckInState,
  OnboardingGoal,
  CycleProfile,
  ReminderPrefs,
} from "@/types";
import { createDefaultData, defaultCycleProfile, defaultReminderPrefs, STORAGE_KEY } from "@/store/defaults";
import { addISODays, todayISO } from "@/lib/dates";
import { periodEndForStart } from "@/lib/onboarding";
import { validatePeriod, periodsOverlap, sortPeriods } from "@/lib/cycle";
import { suggestGoals } from "@/lib/nutrition";
import { LOCALE_TAGS } from "@/i18n/types";
import {
  applyCheckInComplete,
  applyCheckInSkip,
  defaultCheckInState,
  markCheckInPrompted,
} from "@/lib/checkIn";

function emptyDailyLog(date: ISODate): DailyLog {
  return {
    date,
    feelings: [],
    symptoms: [],
    energy: null,
    sleep: null,
    appetite: null,
    overallMood: null,
    waterMl: 0,
    steps: 0,
    stepsManual: 0,
  };
}

type Store = AppData & {
  setSelectedDate: (date: ISODate) => void;
  shiftSelectedDate: (delta: number) => void;
  setLanguage: (language: AppLanguage) => void;
  acceptConsent: () => void;
  completeOnboarding: () => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  updateGoals: (patch: Partial<Goals>) => void;
  updateFeatures: (patch: Partial<FeatureFlags>) => void;
  setOnboardingGoals: (goals: OnboardingGoal[]) => void;
  setOnboardingStep: (step: number) => void;
  updateCycleProfile: (patch: Partial<CycleProfile>) => void;
  commitCycleAnchor: () => string | null;
  updateReminderPrefs: (patch: Partial<ReminderPrefs>) => void;
  markRemindersDelivered: (ids: string[]) => void;
  recalculateGoalsFromProfile: () => void;
  markCheckInShown: () => void;
  skipCheckIn: () => void;
  completeCheckIn: () => void;

  upsertDailyLog: (date: ISODate, patch: Partial<DailyLog>) => void;
  getDailyLog: (date: ISODate) => DailyLog;
  setFeelings: (date: ISODate, feelings: Feeling[]) => void;
  setSymptoms: (date: ISODate, symptoms: Symptom[]) => void;
  setEnergy: (date: ISODate, energy: EnergyLevel | null) => void;
  setSleep: (date: ISODate, sleep: SleepQuality | null) => void;
  setAppetite: (date: ISODate, appetite: AppetiteLevel | null) => void;
  setOverallMood: (date: ISODate, mood: OverallMood | null) => void;
  addWater: (date: ISODate, ml: number) => void;
  setWater: (date: ISODate, ml: number) => void;
  addSteps: (date: ISODate, amount: number) => void;
  setSteps: (date: ISODate, amount: number) => void;

  addPeriod: (startDate: ISODate, endDate: ISODate) => string | null;
  updatePeriod: (id: string, startDate: ISODate, endDate: ISODate) => string | null;
  deletePeriod: (id: string) => void;

  addWeight: (date: ISODate, kg: number, note?: string) => void;
  updateWeight: (id: string, patch: Partial<Pick<WeightEntry, "date" | "kg" | "note">>) => void;
  deleteWeight: (id: string) => void;
  latestWeight: () => number | null;

  addFoodEntry: (entry: Omit<FoodEntry, "id">) => void;
  updateFoodEntry: (id: string, patch: Partial<FoodEntry>) => void;
  deleteFoodEntry: (id: string) => void;
  addCustomFood: (food: Omit<FoodItem, "id" | "custom">) => FoodItem;
  toggleFavoriteFood: (foodId: string) => void;

  addCaffeine: (entry: Omit<CaffeineEntry, "id">) => void;
  updateCaffeine: (id: string, patch: Partial<CaffeineEntry>) => void;
  deleteCaffeine: (id: string) => void;

  addWorkout: (entry: Omit<Workout, "id">) => void;
  updateWorkout: (id: string, patch: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;

  addJournal: (entry: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => void;
  updateJournal: (id: string, patch: Partial<Pick<JournalEntry, "title" | "body" | "date">>) => void;
  deleteJournal: (id: string) => void;

  addBreathingSession: (entry: Omit<BreathingSession, "id">) => void;

  addHabit: (habit: Omit<Habit, "id" | "createdAt">) => void;
  updateHabit: (id: string, patch: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date: ISODate) => void;
  isHabitCompleted: (habitId: string, date: ISODate) => boolean;

  deleteAllData: () => void;
  hydrateFromCloud: (data: AppData) => void;
};

export const useAppStore = create<Store>()(
  persist(
    (set, get) => ({
      ...createDefaultData(),

      setSelectedDate: (date) => set({ selectedDate: date }),
      shiftSelectedDate: (delta) => {
        set({ selectedDate: addISODays(get().selectedDate, delta) });
      },

      setLanguage: (language) => {
        set({ language });
        if (typeof document !== "undefined") {
          document.documentElement.lang = LOCALE_TAGS[language];
        }
      },

      acceptConsent: () =>
        set((s) => ({
          profile: { ...s.profile, healthConsentAt: new Date().toISOString() },
        })),

      completeOnboarding: () => set({ onboardingComplete: true }),

      updateProfile: (patch) =>
        set((s) => ({ profile: { ...s.profile, ...patch } })),

      updateGoals: (patch) => set((s) => ({ goals: { ...s.goals, ...patch } })),

      updateFeatures: (patch) =>
        set((s) => ({ features: { ...s.features, ...patch } })),

      setOnboardingGoals: (onboardingGoals) => set({ onboardingGoals }),
      setOnboardingStep: (onboardingStep) => set({ onboardingStep }),

      updateCycleProfile: (patch) =>
        set((s) => ({
          cycleProfile: { ...(s.cycleProfile ?? defaultCycleProfile()), ...patch },
        })),

      commitCycleAnchor: () => {
        const cycle = get().cycleProfile ?? defaultCycleProfile();
        if (!cycle.configured) return null;
        if (!cycle.lastPeriodStart || cycle.cycleStatus === "no_period") {
          if (cycle.anchoredPeriodId) {
            set((s) => ({
              periods: s.periods.filter((p) => p.id !== cycle.anchoredPeriodId),
              cycleProfile: { ...cycle, anchoredPeriodId: null },
            }));
          }
          return null;
        }
        const end = periodEndForStart(cycle.lastPeriodStart, cycle.periodLength);
        const existing = cycle.anchoredPeriodId
          ? get().periods.find((p) => p.id === cycle.anchoredPeriodId)
          : undefined;
        if (existing) {
          return get().updatePeriod(existing.id, cycle.lastPeriodStart, end);
        }
        const err = get().addPeriod(cycle.lastPeriodStart, end);
        if (err) return err;
        const created = get().periods.find(
          (p) => p.startDate === cycle.lastPeriodStart && p.endDate === end,
        );
        if (created) {
          set((s) => ({ cycleProfile: { ...s.cycleProfile, anchoredPeriodId: created.id } }));
        }
        return null;
      },

      updateReminderPrefs: (patch) =>
        set((s) => ({
          reminderPrefs: { ...(s.reminderPrefs ?? defaultReminderPrefs()), ...patch },
        })),

      markRemindersDelivered: (ids) =>
        set((s) => ({
          reminderPrefs: {
            ...(s.reminderPrefs ?? defaultReminderPrefs()),
            deliveredIds: [...(s.reminderPrefs?.deliveredIds ?? []), ...ids].slice(-80),
          },
        })),

      markCheckInShown: () =>
        set((s) => ({ checkIn: markCheckInPrompted(s.checkIn ?? defaultCheckInState()) })),

      skipCheckIn: () =>
        set((s) => ({ checkIn: applyCheckInSkip(s.checkIn ?? defaultCheckInState()) })),

      completeCheckIn: () =>
        set((s) => ({ checkIn: applyCheckInComplete(s.checkIn ?? defaultCheckInState()) })),

      recalculateGoalsFromProfile: () => {
        const { profile, goals, weightHistory } = get();
        const latest = [...weightHistory].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
        const suggested = suggestGoals(profile, latest?.kg ?? null);
        if (!suggested) return;
        set({
          goals: {
            ...goals,
            calories: goals.caloriesManual ? goals.calories : (suggested.calories ?? goals.calories),
            proteinG: goals.macrosManual ? goals.proteinG : (suggested.proteinG ?? goals.proteinG),
            carbsG: goals.macrosManual ? goals.carbsG : (suggested.carbsG ?? goals.carbsG),
            fatG: goals.macrosManual ? goals.fatG : (suggested.fatG ?? goals.fatG),
            steps: suggested.steps ?? goals.steps,
            waterMl: suggested.waterMl ?? goals.waterMl,
            caffeineMg: suggested.caffeineMg ?? goals.caffeineMg,
            exerciseMinutesPerWeek: suggested.exerciseMinutesPerWeek ?? goals.exerciseMinutesPerWeek,
          },
        });
      },

      getDailyLog: (date) => get().dailyLogs[date] ?? emptyDailyLog(date),

      upsertDailyLog: (date, patch) =>
        set((s) => ({
          dailyLogs: {
            ...s.dailyLogs,
            [date]: { ...(s.dailyLogs[date] ?? emptyDailyLog(date)), ...patch, date },
          },
        })),

      setFeelings: (date, feelings) => get().upsertDailyLog(date, { feelings }),
      setSymptoms: (date, symptoms) => get().upsertDailyLog(date, { symptoms }),
      setEnergy: (date, energy) => get().upsertDailyLog(date, { energy }),
      setSleep: (date, sleep) => get().upsertDailyLog(date, { sleep }),
      setAppetite: (date, appetite) => get().upsertDailyLog(date, { appetite }),
      setOverallMood: (date, overallMood) => get().upsertDailyLog(date, { overallMood }),

      addWater: (date, ml) => {
        const log = get().getDailyLog(date);
        get().upsertDailyLog(date, { waterMl: Math.max(0, log.waterMl + ml) });
      },
      setWater: (date, ml) => get().upsertDailyLog(date, { waterMl: Math.max(0, ml) }),

      addSteps: (date, amount) => {
        const log = get().getDailyLog(date);
        const next = Math.max(0, log.stepsManual + amount);
        get().upsertDailyLog(date, { stepsManual: next, steps: next });
      },
      setSteps: (date, amount) => {
        const v = Math.max(0, amount);
        get().upsertDailyLog(date, { stepsManual: v, steps: v });
      },

      addPeriod: (startDate, endDate) => {
        const err = validatePeriod(startDate, endDate);
        if (err) return err;
        const next: Period = { id: nanoid(), startDate, endDate };
        const overlapping = get().periods.some((p) => periodsOverlap(p, next));
        if (overlapping) return "This overlaps another logged period.";
        set((s) => ({ periods: sortPeriods([...s.periods, next]) }));
        return null;
      },

      updatePeriod: (id, startDate, endDate) => {
        const err = validatePeriod(startDate, endDate);
        if (err) return err;
        const next: Period = { id, startDate, endDate };
        const overlapping = get().periods.some((p) => p.id !== id && periodsOverlap(p, next));
        if (overlapping) return "This overlaps another logged period.";
        set((s) => ({
          periods: sortPeriods(s.periods.map((p) => (p.id === id ? next : p))),
        }));
        return null;
      },

      deletePeriod: (id) => set((s) => ({ periods: s.periods.filter((p) => p.id !== id) })),

      addWeight: (date, kg, note) =>
        set((s) => ({
          weightHistory: [
            ...s.weightHistory,
            { id: nanoid(), date, kg, note },
          ].sort((a, b) => a.date.localeCompare(b.date)),
        })),

      updateWeight: (id, patch) =>
        set((s) => ({
          weightHistory: s.weightHistory
            .map((w) => (w.id === id ? { ...w, ...patch } : w))
            .sort((a, b) => a.date.localeCompare(b.date)),
        })),

      deleteWeight: (id) =>
        set((s) => ({ weightHistory: s.weightHistory.filter((w) => w.id !== id) })),

      latestWeight: () => {
        const list = get().weightHistory;
        if (!list.length) return null;
        return [...list].sort((a, b) => a.date.localeCompare(b.date)).at(-1)!.kg;
      },

      addFoodEntry: (entry) =>
        set((s) => ({ foodEntries: [...s.foodEntries, { ...entry, id: nanoid() }] })),

      updateFoodEntry: (id, patch) =>
        set((s) => ({
          foodEntries: s.foodEntries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),

      deleteFoodEntry: (id) =>
        set((s) => ({ foodEntries: s.foodEntries.filter((e) => e.id !== id) })),

      addCustomFood: (food) => {
        const item: FoodItem = { ...food, id: nanoid(), custom: true };
        set((s) => ({ customFoods: [...s.customFoods, item] }));
        return item;
      },

      toggleFavoriteFood: (foodId) =>
        set((s) => ({
          favoriteFoodIds: s.favoriteFoodIds.includes(foodId)
            ? s.favoriteFoodIds.filter((id) => id !== foodId)
            : [...s.favoriteFoodIds, foodId],
        })),

      addCaffeine: (entry) =>
        set((s) => ({ caffeineEntries: [...s.caffeineEntries, { ...entry, id: nanoid() }] })),

      updateCaffeine: (id, patch) =>
        set((s) => ({
          caffeineEntries: s.caffeineEntries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),

      deleteCaffeine: (id) =>
        set((s) => ({ caffeineEntries: s.caffeineEntries.filter((e) => e.id !== id) })),

      addWorkout: (entry) =>
        set((s) => ({ workouts: [...s.workouts, { ...entry, id: nanoid() }] })),

      updateWorkout: (id, patch) =>
        set((s) => ({
          workouts: s.workouts.map((w) => (w.id === id ? { ...w, ...patch } : w)),
        })),

      deleteWorkout: (id) => set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) })),

      addJournal: (entry) => {
        const now = new Date().toISOString();
        set((s) => ({
          journalEntries: [
            ...s.journalEntries,
            { ...entry, id: nanoid(), createdAt: now, updatedAt: now },
          ],
        }));
      },

      updateJournal: (id, patch) =>
        set((s) => ({
          journalEntries: s.journalEntries.map((j) =>
            j.id === id ? { ...j, ...patch, updatedAt: new Date().toISOString() } : j,
          ),
        })),

      deleteJournal: (id) =>
        set((s) => ({ journalEntries: s.journalEntries.filter((j) => j.id !== id) })),

      addBreathingSession: (entry) =>
        set((s) => ({
          breathingSessions: [...s.breathingSessions, { ...entry, id: nanoid() }],
        })),

      addHabit: (habit) =>
        set((s) => ({
          habits: [
            ...s.habits,
            { ...habit, id: nanoid(), createdAt: new Date().toISOString() },
          ],
        })),

      updateHabit: (id, patch) =>
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        })),

      deleteHabit: (id) =>
        set((s) => ({
          habits: s.habits.filter((h) => h.id !== id),
          habitCompletions: s.habitCompletions.filter((c) => c.habitId !== id),
        })),

      toggleHabitCompletion: (habitId, date) => {
        const existing = get().habitCompletions.find(
          (c) => c.habitId === habitId && c.date === date,
        );
        if (existing) {
          set((s) => ({
            habitCompletions: s.habitCompletions.filter(
              (c) => !(c.habitId === habitId && c.date === date),
            ),
          }));
        } else {
          const completion: HabitCompletion = {
            habitId,
            date,
            completedAt: new Date().toISOString(),
          };
          set((s) => ({ habitCompletions: [...s.habitCompletions, completion] }));
        }
      },

      isHabitCompleted: (habitId, date) =>
        get().habitCompletions.some((c) => c.habitId === habitId && c.date === date),

      hydrateFromCloud: (data) => set({ ...data }),

      deleteAllData: () => {
        void import("@/lib/cloud").then((m) => m.wipeCloudAndSignOut());
        const theme = (() => {
          try {
            return localStorage.getItem("gooddy-theme");
          } catch {
            return null;
          }
        })();
        set({ ...createDefaultData(), selectedDate: todayISO() });
        try {
          localStorage.removeItem(STORAGE_KEY);
          if (theme) localStorage.setItem("gooddy-theme", theme);
        } catch {
          /* ignore */
        }
      },
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<AppData>;
        return {
          ...current,
          ...saved,
          language: saved.language ?? current.language ?? "en",
          profile: {
            ...current.profile,
            ...(saved.profile ?? {}),
            email: saved.profile?.email ?? current.profile.email ?? "",
            marketingOptIn: saved.profile?.marketingOptIn ?? false,
            ageConfirmedAt: saved.profile?.ageConfirmedAt ?? null,
            gender: saved.profile?.gender ?? current.profile.gender ?? null,
            birthday: saved.profile?.birthday ?? null,
          },
          onboardingStep: saved.onboardingStep ?? 0,
          onboardingGoals: saved.onboardingGoals ?? [],
          cycleProfile: { ...defaultCycleProfile(), ...(saved.cycleProfile ?? {}) },
          reminderPrefs: { ...defaultReminderPrefs(), ...(saved.reminderPrefs ?? {}) },
          goals: { ...current.goals, ...(saved.goals ?? {}) },
          features: {
            ...current.features,
            ...(saved.features ?? {}),
            dailyCheckIn: saved.features?.dailyCheckIn ?? current.features.dailyCheckIn ?? true,
            checkInAskAfterHour:
              saved.features?.checkInAskAfterHour !== undefined
                ? saved.features.checkInAskAfterHour
                : (current.features.checkInAskAfterHour ?? 9),
          },
          checkIn: {
            ...defaultCheckInState(),
            ...(saved.checkIn as CheckInState | undefined),
          },
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.recalculateGoalsFromProfile();
      },
      partialize: (state) => {
        const {
          setSelectedDate: _a,
          shiftSelectedDate: _b,
          setLanguage: _bl,
          acceptConsent: _c,
          completeOnboarding: _d,
          updateProfile: _e,
          updateGoals: _f,
          updateFeatures: _g,
          setOnboardingGoals: _goals,
          setOnboardingStep: _step,
          updateCycleProfile: _cycle,
          commitCycleAnchor: _anchor,
          updateReminderPrefs: _reminders,
          markRemindersDelivered: _delivered,
          recalculateGoalsFromProfile: _h,
          markCheckInShown: _checkShown,
          skipCheckIn: _checkSkip,
          completeCheckIn: _checkDone,
          upsertDailyLog: _i,
          getDailyLog: _j,
          setFeelings: _k,
          setSymptoms: _l,
          setEnergy: _m,
          setSleep: _n,
          setAppetite: _o,
          setOverallMood: _p,
          addWater: _q,
          setWater: _r,
          addSteps: _s,
          setSteps: _t,
          addPeriod: _u,
          updatePeriod: _v,
          deletePeriod: _w,
          addWeight: _x,
          updateWeight: _y,
          deleteWeight: _z,
          latestWeight: _aa,
          addFoodEntry: _ab,
          updateFoodEntry: _ac,
          deleteFoodEntry: _ad,
          addCustomFood: _ae,
          toggleFavoriteFood: _af,
          addCaffeine: _ag,
          updateCaffeine: _ah,
          deleteCaffeine: _ai,
          addWorkout: _aj,
          updateWorkout: _ak,
          deleteWorkout: _al,
          addJournal: _am,
          updateJournal: _an,
          deleteJournal: _ao,
          addBreathingSession: _ap,
          addHabit: _aq,
          updateHabit: _ar,
          deleteHabit: _as,
          toggleHabitCompletion: _at,
          isHabitCompleted: _au,
          deleteAllData: _av,
          hydrateFromCloud: _cloud,
          ...data
        } = state;
        return data;
      },
    },
  ),
);

export function useSelectedDate(): ISODate {
  return useAppStore((s) => s.selectedDate);
}
