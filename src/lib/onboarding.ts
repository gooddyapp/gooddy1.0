import type { CycleAssumptions } from "@/lib/cycle";
import type {
  CycleProfile,
  CycleStatus,
  ISODate,
  LastPeriodChoice,
  OnboardingGoal,
} from "@/types";
import { addISODays, subISODays, todayISO } from "@/lib/dates";

export const ONBOARDING_GOALS: OnboardingGoal[] = [
  "understand_cycle",
  "feel_better",
  "track_symptoms",
  "habits",
  "nutrition",
  "stay_active",
  "get_pregnant",
  "exploring",
];

export const CYCLE_STATUSES: CycleStatus[] = [
  "typical",
  "irregular",
  "unknown_length",
  "hormonal",
  "no_period",
];

export const LAST_PERIOD_CHOICES: LastPeriodChoice[] = [
  "now",
  "weeks_1_2",
  "weeks_3_4",
  "longer",
  "unsure",
  "exact",
];

/** Turn a rough answer into a start date. Exact and "not sure" stay unresolved. */
export function inferLastPeriodStart(
  choice: LastPeriodChoice | null,
  exact: ISODate | null,
  today = todayISO(),
): { start: ISODate | null; estimated: boolean } {
  if (choice === "now") return { start: today, estimated: false };
  if (choice === "weeks_1_2") return { start: subISODays(today, 10), estimated: true };
  if (choice === "weeks_3_4") return { start: subISODays(today, 24), estimated: true };
  if (choice === "exact") return { start: exact, estimated: false };
  return { start: null, estimated: false };
}

export function showsCycle(gender: "female" | "male" | null | undefined): boolean {
  return gender !== "male";
}

export function cycleAssumptions(cycle: CycleProfile | undefined): CycleAssumptions | undefined {
  if (!cycle?.configured) return undefined;
  const fertile = cycle.cycleStatus !== "hormonal" && cycle.cycleStatus !== "no_period";
  return {
    cycleLength: cycle.cycleStatus === "unknown_length" ? null : cycle.cycleLength,
    periodLength: cycle.periodLength,
    fertile,
    irregular: cycle.cycleStatus === "irregular",
  };
}

export type ExperienceId =
  | "cycle"
  | "symptoms"
  | "nutrition"
  | "movement"
  | "habits"
  | "journal"
  | "learn";

export function experienceFor(goals: OnboardingGoal[]): ExperienceId[] {
  const set = new Set(goals.length ? goals : ["exploring"]);
  if (set.has("exploring")) {
    return ["cycle", "symptoms", "nutrition", "movement", "habits", "journal", "learn"];
  }
  const items: ExperienceId[] = [];
  const add = (id: ExperienceId) => {
    if (!items.includes(id)) items.push(id);
  };
  if (set.has("understand_cycle") || set.has("feel_better") || set.has("get_pregnant")) add("cycle");
  if (set.has("track_symptoms") || set.has("get_pregnant")) add("symptoms");
  if (set.has("nutrition")) add("nutrition");
  if (set.has("stay_active")) add("movement");
  if (set.has("habits") || set.has("feel_better")) add("habits");
  if (set.has("feel_better")) add("journal");
  if (set.has("understand_cycle") || set.has("feel_better")) add("learn");
  return items;
}

export function homeLead(goals: OnboardingGoal[]): {
  tiles: Array<"calories" | "water" | "steps">;
  bodyLogFirst: boolean;
  statsBeforeHormones: boolean;
} {
  const set = new Set(goals);
  const nutrition = set.has("nutrition");
  const active = set.has("stay_active");
  let tiles: Array<"calories" | "water" | "steps"> = ["calories", "water", "steps"];
  if (active && nutrition) tiles = ["calories", "steps", "water"];
  else if (active) tiles = ["steps", "water", "calories"];
  return {
    tiles,
    bodyLogFirst: set.has("track_symptoms"),
    statsBeforeHormones: nutrition || active,
  };
}

export function periodEndForStart(start: ISODate, periodLength: number): ISODate {
  const len = Math.min(10, Math.max(2, periodLength || 5));
  return addISODays(start, len - 1);
}
