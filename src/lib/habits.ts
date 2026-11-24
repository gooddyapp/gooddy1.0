import type { Habit, HabitCompletion, ISODate } from "@/types";
import { parseISODate, subISODays, todayISO } from "@/lib/dates";

export function isHabitScheduledOn(habit: Habit, date: ISODate): boolean {
  if (habit.archived) return false;
  const day = parseISODate(date).getDay();
  if (habit.frequency === "daily") return true;
  if (habit.frequency === "weekdays") return day >= 1 && day <= 5;
  return (habit.customDays ?? []).includes(day);
}

export function scheduledHabits(habits: Habit[], date: ISODate): Habit[] {
  return habits.filter((h) => isHabitScheduledOn(h, date));
}

export function habitCompletionsOn(
  completions: HabitCompletion[],
  habitId: string,
): Set<ISODate> {
  return new Set(completions.filter((c) => c.habitId === habitId).map((c) => c.date));
}

export function currentStreak(
  habit: Habit,
  completions: HabitCompletion[],
  end: ISODate = todayISO(),
): number {
  const done = habitCompletionsOn(completions, habit.id);
  let streak = 0;
  for (let i = 0; i < 730; i++) {
    const d = subISODays(end, i);
    if (!isHabitScheduledOn(habit, d)) continue;
    if (done.has(d)) streak += 1;
    else break;
  }
  return streak;
}

export function longestStreak(habit: Habit, completions: HabitCompletion[]): number {
  const done = [...habitCompletionsOn(completions, habit.id)].sort();
  if (!done.length) return 0;
  let best = 0;
  let cursor = 0;
  // Walk last ~2 years of scheduled days
  const end = todayISO();
  for (let i = 730; i >= 0; i--) {
    const d = subISODays(end, i);
    if (!isHabitScheduledOn(habit, d)) continue;
    if (done.includes(d)) {
      cursor += 1;
      best = Math.max(best, cursor);
    } else {
      cursor = 0;
    }
  }
  return best;
}

export function completionRate(
  habit: Habit,
  completions: HabitCompletion[],
  days: ISODate[],
): number {
  const scheduled = days.filter((d) => isHabitScheduledOn(habit, d));
  if (!scheduled.length) return 0;
  const done = habitCompletionsOn(completions, habit.id);
  const hit = scheduled.filter((d) => done.has(d)).length;
  return Math.round((hit / scheduled.length) * 100);
}
