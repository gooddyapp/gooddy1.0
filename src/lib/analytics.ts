import type {
  AppetiteLevel,
  AppData,
  CyclePhase,
  DailyLog,
  Feeling,
  ISODate,
  ProgressRange,
  Symptom,
} from "@/types";
import { addISODays, diffISODays, subISODays, todayISO } from "@/lib/dates";
import { estimatePhaseForDate } from "@/lib/cycle";
import { calorieGoalScore, pct } from "@/lib/nutrition";

export function rangeStart(range: ProgressRange, end: ISODate = todayISO()): ISODate | null {
  if (range === "today") return end;
  if (range === "7d") return subISODays(end, 6);
  if (range === "30d") return subISODays(end, 29);
  if (range === "90d") return subISODays(end, 89);
  if (range === "1y") return subISODays(end, 364);
  return null; // all
}

export function datesInRange(range: ProgressRange, end: ISODate = todayISO()): ISODate[] {
  const start = rangeStart(range, end);
  if (!start) {
    // all: gather from data keys later — caller should pass known dates
    const days: ISODate[] = [];
    for (let i = 0; i < 365; i++) days.push(subISODays(end, i));
    return days;
  }
  const days: ISODate[] = [];
  let cursor = start;
  while (diffISODays(end, cursor) >= 0) {
    days.push(cursor);
    cursor = addISODays(cursor, 1);
  }
  return days;
}

export function foodsOnDate(data: AppData, date: ISODate) {
  return data.foodEntries.filter((f) => f.date === date);
}

export function nutritionTotals(data: AppData, date: ISODate) {
  const foods = foodsOnDate(data, date);
  return foods.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      proteinG: acc.proteinG + f.proteinG,
      carbsG: acc.carbsG + f.carbsG,
      fatG: acc.fatG + f.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );
}

export function caffeineTotal(data: AppData, date: ISODate) {
  return data.caffeineEntries
    .filter((c) => c.date === date)
    .reduce((s, c) => s + c.caffeineMg, 0);
}

export function workoutsOnDate(data: AppData, date: ISODate) {
  return data.workouts.filter((w) => w.date === date);
}

export function workoutMinutesOnDate(data: AppData, date: ISODate) {
  return workoutsOnDate(data, date).reduce((s, w) => s + w.durationMin, 0);
}

export function mostFrequent<T extends string>(items: T[]): T | null {
  if (!items.length) return null;
  const counts = new Map<T, number>();
  for (const i of items) counts.set(i, (counts.get(i) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

export function sevenDayTrends(data: AppData, end: ISODate = todayISO()) {
  const days = datesInRange("7d", end);
  const moods: Feeling[] = [];
  const symptoms: Symptom[] = [];
  const energies: number[] = [];
  let loggedDays = 0;

  for (const d of days) {
    const log = data.dailyLogs[d];
    if (!log) continue;
    const has =
      log.feelings.length ||
      log.symptoms.length ||
      log.energy != null ||
      log.sleep != null ||
      log.overallMood != null;
    if (has) loggedDays += 1;
    moods.push(...log.feelings);
    symptoms.push(...log.symptoms);
    if (log.energy != null) energies.push(log.energy);
  }

  return {
    mostMood: mostFrequent(moods),
    mostSymptom: mostFrequent(symptoms),
    avgEnergy: energies.length
      ? Math.round((energies.reduce((a, b) => a + b, 0) / energies.length) * 10) / 10
      : null,
    consistencyPct: Math.round((loggedDays / days.length) * 100),
    loggedDays,
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  streak?: number;
}

export function computeAchievements(data: AppData, end: ISODate = todayISO()): Achievement[] {
  const foodDays = new Set(data.foodEntries.map((f) => f.date));
  const weightCount = data.weightHistory.length;
  const habitCompletions = data.habitCompletions.filter((c) => {
    const days = datesInRange("30d", end);
    return days.includes(c.date);
  });

  let foodStreak = 0;
  for (let i = 0; i < 365; i++) {
    const d = subISODays(end, i);
    if (foodDays.has(d)) foodStreak += 1;
    else break;
  }

  let weekConsistency = 0;
  for (const d of datesInRange("7d", end)) {
    const log = data.dailyLogs[d];
    const hasFood = data.foodEntries.some((f) => f.date === d);
    const hasHabit = data.habitCompletions.some((c) => c.date === d);
    const hasMove = (log?.steps ?? 0) > 0 || data.workouts.some((w) => w.date === d);
    if (hasFood || hasHabit || hasMove || log?.energy != null) weekConsistency += 1;
  }

  return [
    {
      id: "food-days",
      title: "Food tracking",
      description: "Days with at least one meal logged",
      current: foodDays.size,
      target: 30,
      unit: "days",
      streak: foodStreak,
    },
    {
      id: "weight-logs",
      title: "Weight tracking",
      description: "Weight check-ins recorded",
      current: weightCount,
      target: 8,
      unit: "logs",
    },
    {
      id: "week-consistency",
      title: "Weekly consistency",
      description: "Days with any wellness activity this week",
      current: weekConsistency,
      target: 7,
      unit: "days",
    },
    {
      id: "habit-month",
      title: "Habit momentum",
      description: "Habit completions in the last 30 days",
      current: habitCompletions.length,
      target: 20,
      unit: "completions",
    },
    {
      id: "workouts-month",
      title: "Movement sessions",
      description: "Workouts in the last 30 days",
      current: data.workouts.filter((w) => datesInRange("30d", end).includes(w.date)).length,
      target: 12,
      unit: "workouts",
    },
  ];
}

export function progressTotals(data: AppData, range: ProgressRange, end: ISODate = todayISO()) {
  const days = datesInRange(range, end);
  const daySet = new Set(days);

  const foods = data.foodEntries.filter((f) => daySet.has(f.date));
  const workouts = data.workouts.filter((w) => daySet.has(w.date));
  const caffeine = data.caffeineEntries.filter((c) => daySet.has(c.date));

  let calories = 0;
  let protein = 0;
  let water = 0;
  let steps = 0;
  let sleepSum = 0;
  let sleepN = 0;
  let energySum = 0;
  let energyN = 0;
  let trackedDays = 0;

  for (const d of days) {
    const log = data.dailyLogs[d];
    const dayFoods = foods.filter((f) => f.date === d);
    const dayCalories = dayFoods.reduce((s, f) => s + f.calories, 0);
    calories += dayCalories;
    protein += dayFoods.reduce((s, f) => s + f.proteinG, 0);
    if (log) {
      water += log.waterMl;
      steps += log.steps;
      if (log.sleep != null) {
        sleepSum += log.sleep;
        sleepN += 1;
      }
      if (log.energy != null) {
        energySum += log.energy;
        energyN += 1;
      }
    }
    const active =
      dayFoods.length > 0 ||
      (log && (log.waterMl > 0 || log.steps > 0 || log.energy != null || log.sleep != null)) ||
      workouts.some((w) => w.date === d);
    if (active) trackedDays += 1;
  }

  const workoutMinutes = workouts.reduce((s, w) => s + w.durationMin, 0);
  const caffeineMg = caffeine.reduce((s, c) => s + c.caffeineMg, 0);

  return {
    calories,
    protein,
    water,
    steps,
    workoutMinutes,
    workouts: workouts.length,
    caffeineMg,
    trackedDays,
    avgCalories: trackedDays ? Math.round(calories / trackedDays) : null,
    avgWater: trackedDays ? Math.round(water / Math.max(trackedDays, 1)) : null,
    avgSteps: trackedDays ? Math.round(steps / Math.max(trackedDays, 1)) : null,
    avgWorkoutMin: workouts.length ? Math.round(workoutMinutes / workouts.length) : null,
    avgSleep: sleepN ? Math.round((sleepSum / sleepN) * 10) / 10 : null,
    avgEnergy: energyN ? Math.round((energySum / energyN) * 10) / 10 : null,
    avgCaffeine: trackedDays ? Math.round(caffeineMg / Math.max(trackedDays, 1)) : null,
  };
}

export function goalOverview(data: AppData, date: ISODate) {
  const nut = nutritionTotals(data, date);
  const log = data.dailyLogs[date];
  const steps = log?.steps ?? 0;
  const water = log?.waterMl ?? 0;
  const minutes = workoutMinutesOnDate(data, date);
  const sleep = log?.sleep;
  const energy = log?.energy;

  return [
    { id: "calories", label: "Calories", score: calorieGoalScore(nut.calories, data.goals.calories), detail: `${Math.round(nut.calories)} / ${data.goals.calories}` },
    { id: "protein", label: "Protein", score: pct(nut.proteinG, data.goals.proteinG), detail: `${Math.round(nut.proteinG)}g / ${data.goals.proteinG}g` },
    { id: "water", label: "Water", score: pct(water, data.goals.waterMl), detail: `${water} / ${data.goals.waterMl} ml` },
    { id: "steps", label: "Steps", score: pct(steps, data.goals.steps), detail: `${steps} / ${data.goals.steps}` },
    { id: "exercise", label: "Exercise", score: pct(minutes, Math.max(20, Math.round(data.goals.exerciseMinutesPerWeek / 5))), detail: `${minutes} min` },
    { id: "sleep", label: "Sleep", score: sleep != null ? pct(sleep, data.goals.sleepTarget) : 0, detail: sleep != null ? `${sleep} / ${data.goals.sleepTarget}` : "Not logged" },
    { id: "energy", label: "Energy", score: energy != null ? pct(energy, data.goals.energyTarget) : 0, detail: energy != null ? `${energy} / ${data.goals.energyTarget}` : "Not logged" },
  ];
}

export function wellnessScore(data: AppData, end: ISODate = todayISO()) {
  let scoreSum = 0;
  let tracked = 0;
  let streak = 0;

  for (let i = 0; i < 7; i++) {
    const d = subISODays(end, i);
    const overview = goalOverview(data, d);
    const dayScore = overview.reduce((s, g) => s + g.score, 0) / overview.length;
    const active =
      dayScore > 5 ||
      data.foodEntries.some((f) => f.date === d) ||
      data.habitCompletions.some((c) => c.date === d) ||
      data.workouts.some((w) => w.date === d) ||
      Boolean(
        data.dailyLogs[d] &&
          (data.dailyLogs[d].steps > 0 ||
            data.dailyLogs[d].waterMl > 0 ||
            data.dailyLogs[d].energy != null),
      );
    if (active) {
      scoreSum += dayScore;
      tracked += 1;
    }
  }

  streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = subISODays(end, i);
    const has =
      data.foodEntries.some((f) => f.date === d) ||
      data.habitCompletions.some((c) => c.date === d) ||
      data.workouts.some((w) => w.date === d) ||
      Boolean(data.dailyLogs[d] && (data.dailyLogs[d].steps > 0 || data.dailyLogs[d].waterMl > 0 || data.dailyLogs[d].energy != null));
    if (has) streak += 1;
    else break;
  }

  const score = tracked ? Math.round(scoreSum / tracked) : 0;
  return {
    score,
    streak,
    trackedDays: tracked,
    message:
      tracked === 0
        ? "Just getting started. Every step counts!"
        : score >= 70
          ? "Solid tracking week. Keep using what feels sustainable."
          : score >= 40
            ? "You're building a picture. Missing days are fine — pick up where you are."
            : "A few logs go a long way. This score only measures tracking consistency vs your goals.",
  };
}

export function phaseGroupedStats(data: AppData, range: ProgressRange = "90d") {
  const days = datesInRange(range);
  const buckets: Record<
    CyclePhase,
    { calories: number[]; steps: number[]; sleep: number[]; energy: number[]; moods: Feeling[]; symptoms: Symptom[]; workouts: number }
  > = {
    menstrual: { calories: [], steps: [], sleep: [], energy: [], moods: [], symptoms: [], workouts: 0 },
    follicular: { calories: [], steps: [], sleep: [], energy: [], moods: [], symptoms: [], workouts: 0 },
    ovulation: { calories: [], steps: [], sleep: [], energy: [], moods: [], symptoms: [], workouts: 0 },
    luteal: { calories: [], steps: [], sleep: [], energy: [], moods: [], symptoms: [], workouts: 0 },
  };

  for (const d of days) {
    const phase = estimatePhaseForDate(data.periods, d);
    if (!phase) continue;
    const b = buckets[phase];
    const nut = nutritionTotals(data, d);
    if (nut.calories > 0) b.calories.push(nut.calories);
    const log = data.dailyLogs[d];
    if (log?.steps) b.steps.push(log.steps);
    if (log?.sleep != null) b.sleep.push(log.sleep);
    if (log?.energy != null) b.energy.push(log.energy);
    if (log) {
      b.moods.push(...log.feelings);
      b.symptoms.push(...log.symptoms);
    }
    b.workouts += workoutsOnDate(data, d).length;
  }

  const avg = (arr: number[]) =>
    arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;

  return (Object.keys(buckets) as CyclePhase[]).map((phase) => {
    const b = buckets[phase];
    return {
      phase,
      avgCalories: avg(b.calories),
      avgSteps: avg(b.steps) != null ? Math.round(avg(b.steps)!) : null,
      avgSleep: avg(b.sleep),
      avgEnergy: avg(b.energy),
      topMood: mostFrequent(b.moods),
      topSymptom: mostFrequent(b.symptoms),
      workouts: b.workouts,
      sampleDays: Math.max(b.calories.length, b.steps.length, b.sleep.length, b.energy.length),
    };
  });
}

export function appetiteByPhase(data: AppData) {
  const days = datesInRange("90d");
  const map: Record<CyclePhase, AppetiteLevel[]> = {
    menstrual: [],
    follicular: [],
    ovulation: [],
    luteal: [],
  };
  for (const d of days) {
    const phase = estimatePhaseForDate(data.periods, d);
    const appetite = data.dailyLogs[d]?.appetite;
    if (phase && appetite != null) map[phase].push(appetite);
  }
  return map;
}

export function logHasActivity(log: DailyLog | undefined, data: AppData, date: ISODate): boolean {
  if (!log) {
    return (
      data.foodEntries.some((f) => f.date === date) ||
      data.workouts.some((w) => w.date === date) ||
      data.habitCompletions.some((c) => c.date === date)
    );
  }
  return (
    log.feelings.length > 0 ||
    log.symptoms.length > 0 ||
    log.energy != null ||
    log.sleep != null ||
    log.appetite != null ||
    log.overallMood != null ||
    log.waterMl > 0 ||
    log.steps > 0 ||
    data.foodEntries.some((f) => f.date === date) ||
    data.workouts.some((w) => w.date === date)
  );
}

export interface ProgressDayPoint {
  date: ISODate;
  label: string;
  calories: number | null;
  protein: number | null;
  waterMl: number | null;
  steps: number | null;
  workoutMin: number | null;
  sleep: number | null;
  energy: number | null;
  caffeineMg: number | null;
}

/** Daily series for progress charts. Longer ranges are bucketed weekly. */
export function progressDailySeries(
  data: AppData,
  range: ProgressRange,
  end: ISODate = todayISO(),
): ProgressDayPoint[] {
  const rawDays = datesInRange(range === "all" ? "1y" : range, end);
  const bucket =
    range === "90d" || range === "1y" || range === "all"
      ? 7
      : range === "30d"
        ? 1
        : 1;

  if (bucket === 1) {
    return rawDays.map((date) => dayPoint(data, date, shortLabel(date, range)));
  }

  const points: ProgressDayPoint[] = [];
  for (let i = 0; i < rawDays.length; i += bucket) {
    const slice = rawDays.slice(i, i + bucket);
    const mid = slice[Math.floor(slice.length / 2)] ?? slice[0];
    const parts = slice.map((d) => dayPoint(data, d, ""));
    points.push({
      date: mid,
      label: shortLabel(mid, range),
      calories: avgNullable(parts.map((p) => p.calories)),
      protein: avgNullable(parts.map((p) => p.protein)),
      waterMl: avgNullable(parts.map((p) => p.waterMl)),
      steps: avgNullable(parts.map((p) => p.steps)),
      workoutMin: avgNullable(parts.map((p) => p.workoutMin)),
      sleep: avgNullable(parts.map((p) => p.sleep)),
      energy: avgNullable(parts.map((p) => p.energy)),
      caffeineMg: avgNullable(parts.map((p) => p.caffeineMg)),
    });
  }
  return points;
}

function shortLabel(date: ISODate, range: ProgressRange): string {
  const d = parseISODateLocal(date);
  if (range === "today" || range === "7d") {
    return ["S", "M", "T", "W", "T", "F", "S"][d.getDay()] ?? "";
  }
  if (range === "30d") return String(d.getDate());
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function parseISODateLocal(iso: ISODate): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dayPoint(data: AppData, date: ISODate, label: string): ProgressDayPoint {
  const foods = data.foodEntries.filter((f) => f.date === date);
  const log = data.dailyLogs[date];
  const workouts = data.workouts.filter((w) => w.date === date);
  const caffeine = data.caffeineEntries.filter((c) => c.date === date);
  const calories = foods.length ? foods.reduce((s, f) => s + f.calories, 0) : null;
  const protein = foods.length ? foods.reduce((s, f) => s + f.proteinG, 0) : null;
  const waterMl = log && log.waterMl > 0 ? log.waterMl : null;
  const steps = log && log.steps > 0 ? log.steps : null;
  const workoutMin = workouts.length
    ? workouts.reduce((s, w) => s + w.durationMin, 0)
    : null;
  const caffeineMg = caffeine.length
    ? caffeine.reduce((s, c) => s + c.caffeineMg, 0)
    : null;
  return {
    date,
    label,
    calories,
    protein,
    waterMl,
    steps,
    workoutMin,
    sleep: log?.sleep ?? null,
    energy: log?.energy ?? null,
    caffeineMg,
  };
}

function avgNullable(vals: Array<number | null>): number | null {
  const nums = vals.filter((v): v is number => v != null);
  if (!nums.length) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}
