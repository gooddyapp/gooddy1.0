import type { CyclePhase, CycleSnapshot, ISODate, Period } from "@/types";
import { addISODays, diffISODays, isISOBetween, todayISO } from "@/lib/dates";

const DEFAULT_CYCLE = 28;
const DEFAULT_PERIOD = 5;
const MIN_CYCLES_FOR_STATS = 3;

export function periodDurationDays(period: Period): number {
  return diffISODays(period.endDate, period.startDate) + 1;
}

export function sortPeriods(periods: Period[]): Period[] {
  return [...periods].sort((a, b) => diffISODays(a.startDate, b.startDate));
}

export function validatePeriod(startDate: ISODate, endDate: ISODate): string | null {
  if (diffISODays(endDate, startDate) < 0) return "End date must be on or after start date.";
  if (diffISODays(endDate, startDate) > 14) return "Period longer than 14 days looks unusual — check dates.";
  return null;
}

export function periodsOverlap(a: Period, b: Period): boolean {
  return !(diffISODays(a.endDate, b.startDate) < 0 || diffISODays(b.endDate, a.startDate) < 0);
}

/** Cycle lengths between consecutive period starts. */
export function cycleLengths(periods: Period[]): number[] {
  const sorted = sortPeriods(periods);
  const lengths: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const len = diffISODays(sorted[i].startDate, sorted[i - 1].startDate);
    if (len >= 15 && len <= 60) lengths.push(len);
  }
  return lengths;
}

export function average(nums: number[]): number | null {
  if (!nums.length) return null;
  return Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 10) / 10;
}

export function stdDev(nums: number[]): number | null {
  if (nums.length < 2) return null;
  const mean = nums.reduce((s, n) => s + n, 0) / nums.length;
  const variance = nums.reduce((s, n) => s + (n - mean) ** 2, 0) / (nums.length - 1);
  return Math.round(Math.sqrt(variance) * 10) / 10;
}

export function averagePeriodLength(periods: Period[]): number | null {
  if (!periods.length) return null;
  return average(periods.map(periodDurationDays));
}

export function findCurrentPeriod(periods: Period[], date: ISODate): Period | null {
  return sortPeriods(periods).find((p) => isISOBetween(date, p.startDate, p.endDate)) ?? null;
}

export function findCycleStart(periods: Period[], date: ISODate): Period | null {
  const sorted = sortPeriods(periods);
  const starts = sorted.filter((p) => diffISODays(date, p.startDate) >= 0);
  return starts.length ? starts[starts.length - 1] : null;
}

export function estimatedCycleLength(periods: Period[]): number {
  return average(cycleLengths(periods)) ?? DEFAULT_CYCLE;
}

export function estimatedPeriodLength(periods: Period[]): number {
  return Math.round(averagePeriodLength(periods) ?? DEFAULT_PERIOD);
}

/**
 * Map a cycle day (1-indexed) onto a phase.
 * Ovulation is centered near cycleLength - 14 (luteal ~14 days),
 * with a short ovulatory window around that day.
 */
export function phaseForCycleDay(
  cycleDay: number,
  cycleLength: number,
  periodLength: number,
): { phase: CyclePhase; phaseDay: number; phaseLength: number } {
  const menstrual = Math.max(2, Math.min(periodLength, Math.floor(cycleLength * 0.25)));
  const ovulationCenter = Math.max(menstrual + 3, cycleLength - 14);
  const ovulationLen = Math.min(3, Math.max(2, Math.round(cycleLength * 0.1)));
  const ovulationStart = Math.max(menstrual + 1, ovulationCenter - Math.floor((ovulationLen - 1) / 2));
  const ovulationEnd = Math.min(cycleLength - 1, ovulationStart + ovulationLen - 1);
  const follicularStart = menstrual + 1;
  const follicularLen = Math.max(ovulationStart - follicularStart, 0);
  const lutealStart = ovulationEnd + 1;
  const lutealLen = Math.max(cycleLength - ovulationEnd, 1);

  if (cycleDay <= menstrual) {
    return { phase: "menstrual", phaseDay: cycleDay, phaseLength: menstrual };
  }
  if (cycleDay >= ovulationStart && cycleDay <= ovulationEnd) {
    return {
      phase: "ovulation",
      phaseDay: cycleDay - ovulationStart + 1,
      phaseLength: ovulationEnd - ovulationStart + 1,
    };
  }
  if (cycleDay < ovulationStart) {
    return {
      phase: "follicular",
      phaseDay: cycleDay - follicularStart + 1,
      phaseLength: Math.max(follicularLen, 1),
    };
  }
  return {
    phase: "luteal",
    phaseDay: cycleDay - lutealStart + 1,
    phaseLength: lutealLen,
  };
}

export function phaseName(phase: CyclePhase | null): string {
  if (!phase) return "Unknown";
  const names: Record<CyclePhase, string> = {
    menstrual: "Menstrual",
    follicular: "Follicular",
    ovulation: "Ovulation",
    luteal: "Luteal",
  };
  return names[phase];
}

export function phaseFeeling(phase: CyclePhase | null): string {
  if (!phase) return "";
  const map: Record<CyclePhase, string> = {
    menstrual: "Rest, inward",
    follicular: "Rising, curious",
    ovulation: "Peak, social",
    luteal: "Settling, cozy",
  };
  return map[phase];
}

export interface CycleAssumptions {
  cycleLength?: number | null;
  periodLength?: number | null;
  /** When false, fertile window and ovulation date are withheld. */
  fertile?: boolean;
  irregular?: boolean;
}

export function computeCycleSnapshot(
  periods: Period[],
  date: ISODate = todayISO(),
  assumptions?: CycleAssumptions,
): CycleSnapshot {
  const sorted = sortPeriods(periods);
  const lengths = cycleLengths(sorted);
  const avgCycle = average(lengths);
  const avgPeriod = averagePeriodLength(sorted);
  const variability = stdDev(lengths);
  const assumedCycle =
    assumptions?.cycleLength != null && assumptions.cycleLength >= 15 && assumptions.cycleLength <= 60
      ? Math.round(assumptions.cycleLength)
      : DEFAULT_CYCLE;
  const assumedPeriod =
    assumptions?.periodLength != null && assumptions.periodLength >= 2 && assumptions.periodLength <= 10
      ? Math.round(assumptions.periodLength)
      : DEFAULT_PERIOD;
  const cycleLength = Math.round(avgCycle ?? assumedCycle);
  const periodLength = Math.round(avgPeriod ?? assumedPeriod);
  const currentPeriod = findCurrentPeriod(sorted, date);
  const cycleStart = findCycleStart(sorted, date);

  let regularity: CycleSnapshot["regularity"] = "insufficient";
  if (lengths.length === 0) regularity = assumptions?.irregular ? "irregular" : assumptions?.cycleLength ? "learning" : "insufficient";
  else if (lengths.length < MIN_CYCLES_FOR_STATS) regularity = assumptions?.irregular ? "irregular" : "learning";
  else if (variability != null && variability > 7) regularity = "irregular";
  else if (assumptions?.irregular) regularity = "irregular";
  else regularity = "regular";

  if (!cycleStart) {
    return {
      cycleDay: null,
      phase: null,
      cycleLength,
      periodLength,
      averageCycleLength: avgCycle,
      averagePeriodLength: avgPeriod,
      cycleVariability: variability,
      nextPeriodStart: null,
      fertileWindowStart: null,
      fertileWindowEnd: null,
      ovulationDay: null,
      currentPeriod,
      regularity,
      phaseDay: null,
      phaseLength: null,
    };
  }

  const dayIndex = diffISODays(date, cycleStart.startDate) + 1;
  // If beyond estimated cycle and no new period, still show projected day
  const cycleDay = ((dayIndex - 1) % cycleLength) + 1;
  const { phase, phaseDay, phaseLength } = phaseForCycleDay(cycleDay, cycleLength, periodLength);

  const nextPeriodStart = addISODays(cycleStart.startDate, cycleLength);
  const ovulationOffset = Math.max(cycleLength - 14, periodLength + 5);
  const ovulationDay = addISODays(cycleStart.startDate, ovulationOffset - 1);
  const fertileWindowStart = addISODays(ovulationDay, -5);
  const fertileWindowEnd = addISODays(ovulationDay, 1);

  return {
    cycleDay,
    phase,
    cycleLength,
    periodLength,
    averageCycleLength: avgCycle,
    averagePeriodLength: avgPeriod,
    cycleVariability: variability,
    nextPeriodStart: diffISODays(nextPeriodStart, date) >= 0 ? nextPeriodStart : addISODays(nextPeriodStart, cycleLength),
    fertileWindowStart: assumptions?.fertile === false ? null : fertileWindowStart,
    fertileWindowEnd: assumptions?.fertile === false ? null : fertileWindowEnd,
    ovulationDay: assumptions?.fertile === false ? null : ovulationDay,
    currentPeriod,
    regularity,
    phaseDay,
    phaseLength,
  };
}

/** Phase for any calendar day, including days before the first logged period. */
export function cyclePositionForDate(
  periods: Period[],
  date: ISODate,
  assumptions?: CycleAssumptions,
): { phase: CyclePhase; phaseDay: number; phaseLength: number } | null {
  const snap = computeCycleSnapshot(periods, date, assumptions);
  if (snap.phase && snap.phaseDay && snap.phaseLength) {
    return { phase: snap.phase, phaseDay: snap.phaseDay, phaseLength: snap.phaseLength };
  }
  const anchor = sortPeriods(periods)[0];
  if (!anchor) return null;
  const delta = diffISODays(date, anchor.startDate);
  const cycleDay = ((delta % snap.cycleLength) + snap.cycleLength) % snap.cycleLength + 1;
  const placed = phaseForCycleDay(cycleDay, snap.cycleLength, snap.periodLength);
  return { phase: placed.phase, phaseDay: placed.phaseDay, phaseLength: placed.phaseLength };
}

export function phaseForDate(
  periods: Period[],
  date: ISODate,
  assumptions?: CycleAssumptions,
): CyclePhase | null {
  return cyclePositionForDate(periods, date, assumptions)?.phase ?? null;
}

export function estimatePhaseForDate(periods: Period[], date: ISODate): CyclePhase | null {
  return phaseForDate(periods, date);
}

export function isMenstruationDay(periods: Period[], date: ISODate): boolean {
  return Boolean(findCurrentPeriod(periods, date));
}

export function isInFertileWindow(snapshot: CycleSnapshot, date: ISODate): boolean {
  if (!snapshot.fertileWindowStart || !snapshot.fertileWindowEnd) return false;
  return isISOBetween(date, snapshot.fertileWindowStart, snapshot.fertileWindowEnd);
}

export function isEstimatedOvulationDay(snapshot: CycleSnapshot, date: ISODate): boolean {
  return snapshot.ovulationDay === date;
}

export function isPredictedPeriodDay(
  periods: Period[],
  date: ISODate,
  horizonDays = 90,
  assumptions?: CycleAssumptions,
): boolean {
  if (!periods.length) return false;
  const snap = computeCycleSnapshot(periods, todayISO(), assumptions);
  const len = snap.cycleLength;
  const periodLen = snap.periodLength;
  const sorted = sortPeriods(periods);
  const last = sorted[sorted.length - 1];
  let cursor = addISODays(last.startDate, len);
  const end = addISODays(todayISO(), horizonDays);
  while (diffISODays(end, cursor) >= 0) {
    const periodEnd = addISODays(cursor, periodLen - 1);
    if (isISOBetween(date, cursor, periodEnd)) return true;
    // also check historical predictions relative to last known
    cursor = addISODays(cursor, len);
  }
  // past predictions between known cycles already covered by logged periods
  return false;
}
