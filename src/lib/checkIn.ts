import { addISODays, diffISODays, todayISO } from "@/lib/dates";
import type { AppData, CheckInState, ISODate } from "@/types";

export function defaultCheckInState(): CheckInState {
  return {
    lastPromptDate: null,
    lastCompletedDate: null,
    consecutiveSkips: 0,
    snoozeUntil: null,
  };
}

export function hasMoodToday(data: Pick<AppData, "dailyLogs">, date: ISODate = todayISO()) {
  return data.dailyLogs[date]?.overallMood != null;
}

export function isCheckInSnoozed(checkIn: CheckInState, date: ISODate = todayISO()) {
  if (!checkIn.snoozeUntil) return false;
  return diffISODays(checkIn.snoozeUntil, date) >= 0;
}

/** Auto full-screen sheet: first open of the day, after onboarding, if enabled. */
export function shouldAutoShowCheckIn(
  data: Pick<AppData, "features" | "checkIn" | "dailyLogs" | "onboardingComplete">,
  now = new Date(),
): boolean {
  if (!data.onboardingComplete) return false;
  if (!data.features.dailyCheckIn) return false;
  const today = todayISO();
  if (hasMoodToday(data, today)) return false;
  if (isCheckInSnoozed(data.checkIn, today)) return false;
  if (data.checkIn.lastPromptDate === today) return false;
  const askAfter = data.features.checkInAskAfterHour;
  if (askAfter != null && now.getHours() < askAfter) return false;
  return true;
}

/** Compact card on Today while snoozed (and mood not logged). */
export function shouldShowCheckInCard(
  data: Pick<AppData, "features" | "checkIn" | "dailyLogs" | "onboardingComplete">,
): boolean {
  if (!data.onboardingComplete) return false;
  if (!data.features.dailyCheckIn) return false;
  const today = todayISO();
  if (hasMoodToday(data, today)) return false;
  return isCheckInSnoozed(data.checkIn, today);
}

export function applyCheckInSkip(checkIn: CheckInState, date: ISODate = todayISO()): CheckInState {
  const consecutiveSkips = checkIn.consecutiveSkips + 1;
  if (consecutiveSkips >= 3) {
    return {
      ...checkIn,
      lastPromptDate: date,
      consecutiveSkips: 0,
      snoozeUntil: addISODays(date, 7),
    };
  }
  return {
    ...checkIn,
    lastPromptDate: date,
    consecutiveSkips,
  };
}

export function applyCheckInComplete(checkIn: CheckInState, date: ISODate = todayISO()): CheckInState {
  return {
    ...checkIn,
    lastPromptDate: date,
    lastCompletedDate: date,
    consecutiveSkips: 0,
    snoozeUntil: null,
  };
}

export function markCheckInPrompted(checkIn: CheckInState, date: ISODate = todayISO()): CheckInState {
  return { ...checkIn, lastPromptDate: date };
}
