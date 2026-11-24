import { nanoid } from "nanoid";
import { todayISO } from "@/lib/dates";
import type { AppData, CycleProfile, Habit, ReminderPrefs } from "@/types";

export const STORAGE_KEY = "gooddy-app-v1";
export const DATA_VERSION = 1;

export function createDefaultHabits(): Habit[] {
  const now = new Date().toISOString();
  const examples: Array<Pick<Habit, "name" | "description">> = [
    { name: "Drink 8 glasses of water", description: "Spread them through the day." },
    { name: "Take vitamins", description: "A reminder only — not medical advice." },
    { name: "Meditate for 10 minutes", description: "Any quiet practice counts." },
    { name: "Sleep by 10 PM", description: "Wind down earlier if you can." },
    { name: "Eat leafy greens", description: "One serving somewhere in the day." },
    { name: "No social media before bed", description: "Phone down before lights out." },
  ];
  return examples.map((h) => ({
    id: nanoid(),
    name: h.name,
    description: h.description,
    frequency: "daily" as const,
    createdAt: now,
  }));
}

export function defaultCycleProfile(): CycleProfile {
  return {
    configured: false,
    lastPeriodChoice: null,
    lastPeriodStart: null,
    lastPeriodEstimated: false,
    cycleLength: 28,
    cycleStatus: "typical",
    periodLength: 5,
    anchoredPeriodId: null,
  };
}

export function defaultReminderPrefs(): ReminderPrefs {
  return {
    dailyLog: false,
    dailyLogHour: 9,
    periodUpcoming: false,
    ovulation: false,
    phaseChanges: false,
    luteal: false,
    hydration: false,
    movement: false,
    journaling: false,
    habits: false,
    permission: "unknown",
    deliveredIds: [],
  };
}

export function createDefaultData(): AppData {
  return {
    version: DATA_VERSION,
    language: "en",
    profile: {
      email: "",
      name: "",
      gender: null,
      age: null,
      birthday: null,
      heightCm: null,
      activityLevel: "moderate",
      weightObjective: "maintain",
      dietaryPreference: "balanced",
      dietaryRestrictions: [],
      healthConsentAt: null,
      ageConfirmedAt: null,
      marketingOptIn: false,
    },
    goals: {
      calories: 2000,
      proteinG: 100,
      carbsG: 220,
      fatG: 65,
      steps: 10000,
      waterMl: 2000,
      caffeineMg: 200,
      exerciseMinutesPerWeek: 150,
      sleepTarget: 4,
      energyTarget: 3,
      caloriesManual: false,
      macrosManual: false,
    },
    features: {
      mindfulness: true,
      habits: true,
      dailyCheckIn: true,
      checkInAskAfterHour: 9,
    },
    checkIn: {
      lastPromptDate: null,
      lastCompletedDate: null,
      consecutiveSkips: 0,
      snoozeUntil: null,
    },
    periods: [],
    weightHistory: [],
    dailyLogs: {},
    foodEntries: [],
    customFoods: [],
    favoriteFoodIds: [],
    caffeineEntries: [],
    workouts: [],
    journalEntries: [],
    breathingSessions: [],
    habits: createDefaultHabits(),
    habitCompletions: [],
    selectedDate: todayISO(),
    onboardingComplete: false,
    onboardingStep: 0,
    onboardingGoals: [],
    cycleProfile: defaultCycleProfile(),
    reminderPrefs: defaultReminderPrefs(),
  };
}
