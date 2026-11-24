import {
  addDays,
  differenceInCalendarDays,
  format,
  isValid,
  parse,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";
import type { ISODate } from "@/types";

/** Local calendar date as YYYY-MM-DD (avoids UTC shift). */
export function toISODate(date: Date = new Date()): ISODate {
  return format(startOfDay(date), "yyyy-MM-dd");
}

export function parseISODate(iso: ISODate): Date {
  const d = parse(iso, "yyyy-MM-dd", new Date());
  if (!isValid(d)) {
    const fallback = parseISO(iso);
    return startOfDay(fallback);
  }
  return startOfDay(d);
}

export function todayISO(): ISODate {
  return toISODate(new Date());
}

export function addISODays(iso: ISODate, days: number): ISODate {
  return toISODate(addDays(parseISODate(iso), days));
}

export function subISODays(iso: ISODate, days: number): ISODate {
  return toISODate(subDays(parseISODate(iso), days));
}

export function diffISODays(a: ISODate, b: ISODate): number {
  return differenceInCalendarDays(parseISODate(a), parseISODate(b));
}

export function isISOBetween(date: ISODate, start: ISODate, end: ISODate): boolean {
  return diffISODays(date, start) >= 0 && diffISODays(end, date) >= 0;
}

export function formatDisplayDate(iso: ISODate): string {
  return format(parseISODate(iso), "EEE d MMM");
}

export function formatLongDate(iso: ISODate): string {
  return format(parseISODate(iso), "EEEE, d MMMM yyyy");
}

export function formatMonthYear(iso: ISODate): string {
  return format(parseISODate(iso), "MMMM yyyy");
}

export function greetingForHour(hour = new Date().getHours()): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function startOfMonthISO(iso: ISODate): ISODate {
  const d = parseISODate(iso);
  return toISODate(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function daysInMonth(iso: ISODate): number {
  const d = parseISODate(iso);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

export function weekdayIndex(iso: ISODate): number {
  return parseISODate(iso).getDay();
}
