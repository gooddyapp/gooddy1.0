import type { CycleSnapshot, ReminderPrefs } from "@/types";
import { addISODays, diffISODays, todayISO } from "@/lib/dates";
import { phaseForCycleDay } from "@/lib/cycle";

export interface PlannedReminder {
  id: string;
  at: Date;
  title: string;
  body: string;
}

function atHour(isoDate: string, hour: number): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, hour, 0, 0, 0);
}

function nextDaily(hour: number, now: Date): Date {
  const next = new Date(now);
  next.setHours(hour, 0, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next;
}

export function planReminders(
  prefs: ReminderPrefs,
  snapshot: CycleSnapshot,
  now = new Date(),
): PlannedReminder[] {
  const items: PlannedReminder[] = [];
  const today = todayISO();

  if (prefs.dailyLog) {
    const at = nextDaily(prefs.dailyLogHour, now);
    items.push({
      id: `daily-${at.toISOString().slice(0, 13)}`,
      at,
      title: "gooddy",
      body: "a soft nudge to log today, whenever you're ready.",
    });
  }

  if (prefs.periodUpcoming && snapshot.nextPeriodStart) {
    const when = addISODays(snapshot.nextPeriodStart, -2);
    const days = diffISODays(snapshot.nextPeriodStart, today);
    if (days >= 0 && days <= 14) {
      items.push({
        id: `period-${snapshot.nextPeriodStart}`,
        at: atHour(days <= 2 ? today : when, 9),
        title: "gooddy",
        body:
          days === 0
            ? "hey girl, your period might be starting today."
            : days === 1
              ? "hey girl, your period might be starting tomorrow."
              : `hey girl, your period might be starting in ${days} days.`,
      });
    }
  }

  if (prefs.ovulation && snapshot.ovulationDay && diffISODays(snapshot.ovulationDay, today) >= 0) {
    items.push({
      id: `ovulation-${snapshot.ovulationDay}`,
      at: atHour(snapshot.ovulationDay, 9),
      title: "gooddy",
      body: "an estimated ovulation day is around now. this is an estimate, not contraception.",
    });
  }

  if (snapshot.cycleDay != null && snapshot.phase && (prefs.phaseChanges || prefs.luteal)) {
    const cycleLength = snapshot.cycleLength;
    const periodLength = snapshot.periodLength;
    for (let day = snapshot.cycleDay; day <= cycleLength; day++) {
      const info = phaseForCycleDay(day, cycleLength, periodLength);
      const prev = day === 1 ? null : phaseForCycleDay(day - 1, cycleLength, periodLength).phase;
      if (info.phase === prev) continue;
      const date = addISODays(today, day - snapshot.cycleDay);
      if (info.phase === "luteal" && prefs.luteal) {
        items.push({
          id: `luteal-${date}`,
          at: atHour(date, 9),
          title: "gooddy",
          body: "luteal phase is the estimate from here. energy often settles. that's the cycle, not you.",
        });
      } else if (info.phase === "menstrual" && prefs.phaseChanges && day !== snapshot.cycleDay) {
        items.push({
          id: `phase-menstrual-${date}`,
          at: atHour(date, 9),
          title: "gooddy",
          body: "your estimated menstrual phase is coming up.",
        });
      } else if (prefs.phaseChanges && info.phase !== "luteal" && day !== snapshot.cycleDay) {
        items.push({
          id: `phase-${info.phase}-${date}`,
          at: atHour(date, 9),
          title: "gooddy",
          body: `your estimated ${info.phase} phase is coming up.`,
        });
      }
    }
  }

  const extras: Array<[boolean, string, string]> = [
    [prefs.hydration, "water", "a sip of water counts. your daily glass is waiting."],
    [prefs.movement, "move", "a short walk still counts as movement today."],
    [prefs.journaling, "journal", "a few lines in your journal is enough."],
    [prefs.habits, "habits", "one habit is enough for today."],
  ];
  extras.forEach(([on, id, body], index) => {
    if (!on) return;
    items.push({
      id: `${id}-${today}`,
      at: nextDaily(Math.min(20, prefs.dailyLogHour + 1 + index), now),
      title: "gooddy",
      body,
    });
  });

  return items.filter((item) => item.at.getTime() > now.getTime() - 6 * 60 * 60 * 1000);
}

export function previewPeriodReminder(snapshot: CycleSnapshot): string {
  if (!snapshot.nextPeriodStart) {
    return "once we can estimate your next period, a reminder can land a couple of days before.";
  }
  const days = diffISODays(snapshot.nextPeriodStart, todayISO());
  if (days < 0) return "your next period estimate will update as you log.";
  if (days === 0) return "hey girl, your period might be starting today.";
  if (days === 1) return "hey girl, your period might be starting tomorrow.";
  if (days === 2) return "hey girl, your period might be starting in 2 days 🩸";
  return `hey girl, your period might be starting in ${days} days.`;
}

export async function requestNotificationPermission(): Promise<"granted" | "denied" | "default" | "unsupported"> {
  if (typeof Notification === "undefined") return "unsupported";
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission;
  }
  return Notification.requestPermission();
}

export function deliverDueReminders(
  prefs: ReminderPrefs,
  planned: PlannedReminder[],
  now = new Date(),
): string[] {
  if (prefs.permission !== "granted" || typeof Notification === "undefined") return [];
  if (Notification.permission !== "granted") return [];
  const fresh: string[] = [];
  for (const item of planned) {
    if (prefs.deliveredIds.includes(item.id)) continue;
    const delta = now.getTime() - item.at.getTime();
    if (delta < 0 || delta > 6 * 60 * 60 * 1000) continue;
    try {
      new Notification(item.title, { body: item.body });
      fresh.push(item.id);
    } catch {
      /* The browser refused to show this one. */
    }
  }
  return fresh;
}
