import { useMemo, useState } from "react";
import { DateHeader } from "@/components/DateHeader";
import { Section, EmptyState, Disclaimer } from "@/components/ui/Section";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/Chip";
import { Meter } from "@/components/ui/Meter";
import { useAppStore } from "@/store/useAppStore";
import { todayISO } from "@/lib/dates";
import {
  completionRate,
  currentStreak,
  longestStreak,
  scheduledHabits,
} from "@/lib/habits";
import { HABIT_SUGGESTIONS, buildRecommendations } from "@/lib/recommendations";
import type { HabitFrequency } from "@/types";
import { datesInRange } from "@/lib/analytics";
import { usePage } from "@/i18n/pageCopy";

export function HabitsScreen() {
  const p = usePage();
  const selectedDate = useAppStore((s) => s.selectedDate);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const shiftSelectedDate = useAppStore((s) => s.shiftSelectedDate);
  const habits = useAppStore((s) => s.habits);
  const habitCompletions = useAppStore((s) => s.habitCompletions);
  const addHabit = useAppStore((s) => s.addHabit);
  const updateHabit = useAppStore((s) => s.updateHabit);
  const deleteHabit = useAppStore((s) => s.deleteHabit);
  const toggleHabitCompletion = useAppStore((s) => s.toggleHabitCompletion);
  const isHabitCompleted = useAppStore((s) => s.isHabitCompleted);
  const store = useAppStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [customDays, setCustomDays] = useState<number[]>([]);

  const todayScheduled = scheduledHabits(habits, selectedDate);
  const completedCount = todayScheduled.filter((h) => isHabitCompleted(h.id, selectedDate)).length;
  const week = datesInRange("7d", selectedDate);
  const month = datesInRange("30d", selectedDate);
  const recs = buildRecommendations(store, selectedDate).filter((r) => r.category === "habits");

  const existingNames = useMemo(() => new Set(habits.map((h) => h.name.toLowerCase())), [habits]);

  const openCreate = (preset?: { name: string; description?: string }) => {
    setEditId(null);
    setName(preset?.name ?? "");
    setDescription(preset?.description ?? "");
    setFrequency("daily");
    setCustomDays([]);
    setFormOpen(true);
  };

  const save = () => {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      frequency,
      customDays: frequency === "custom" ? customDays : undefined,
      archived: false,
    };
    if (editId) updateHabit(editId, payload);
    else addHabit(payload);
    setFormOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col">
      <DateHeader
        date={selectedDate}
        onPrev={() => shiftSelectedDate(-1)}
        onNext={() => shiftSelectedDate(1)}
        onToday={() => setSelectedDate(todayISO())}
      />
      <div className="flex flex-1 flex-col gap-4 px-4 pb-6">
        <Section title={p("dailyProgress")}>
          <Meter
            label="Habits"
            value={completedCount}
            target={Math.max(todayScheduled.length, 1)}
          />
          <p className="mt-1 font-sans text-caption text-muted-foreground">
            {completedCount} of {todayScheduled.length} scheduled today
          </p>
        </Section>

        <Section
          title="Today"
          action={
            <Button className="h-8 px-3 text-caption" onClick={() => openCreate()}>
              New habit
            </Button>
          }
        >
          {todayScheduled.length === 0 ? (
            <EmptyState>{p("noHabits")}</EmptyState>
          ) : (
            <ul className="space-y-2">
              {todayScheduled.map((h) => {
                const done = isHabitCompleted(h.id, selectedDate);
                const streak = currentStreak(h, habitCompletions, selectedDate);
                return (
                  <li key={h.id} className="rounded-md bg-secondary p-3">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        className="text-left"
                        onClick={() => toggleHabitCompletion(h.id, selectedDate)}
                      >
                        <p className="font-sans text-body-strong">
                          {done ? "✓ " : "○ "}
                          {h.name}
                        </p>
                        {h.description ? (
                          <p className="font-sans text-caption text-muted-foreground">{h.description}</p>
                        ) : null}
                        <p className="font-sans text-caption text-muted-foreground">
                          Streak {streak} · best {longestStreak(h, habitCompletions)} · week{" "}
                          {completionRate(h, habitCompletions, week)}% · month{" "}
                          {completionRate(h, habitCompletions, month)}%
                        </p>
                      </button>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          className="text-link underline text-caption"
                          onClick={() => {
                            setEditId(h.id);
                            setName(h.name);
                            setDescription(h.description ?? "");
                            setFrequency(h.frequency);
                            setCustomDays(h.customDays ?? []);
                            setFormOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-error underline text-caption"
                          onClick={() => deleteHabit(h.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        <Section title={p("suggestedHabits")}>
          <div className="flex flex-wrap gap-2">
            {HABIT_SUGGESTIONS.filter((s) => !existingNames.has(s.name.toLowerCase())).map((s) => (
              <Button key={s.name} variant="secondary" className="h-9" onClick={() => openCreate(s)}>
                + {s.name}
              </Button>
            ))}
          </div>
          <Disclaimer>
            Supplement reminders are optional user choices, not medical recommendations.
          </Disclaimer>
        </Section>

        <Section title={p("allHabits")}>
          <ul className="space-y-2">
            {habits.filter((h) => !h.archived).map((h) => (
              <li key={h.id} className="font-sans text-caption">
                {h.name} · {h.frequency}
                {h.frequency === "custom" ? ` (${(h.customDays ?? []).join(",")})` : ""}
              </li>
            ))}
          </ul>
        </Section>

        <Section title={p("habitRecs")}>
          {recs.length ? (
            <ul className="space-y-2">
              {recs.map((r) => (
                <li key={r.id} className="font-sans text-caption">
                  <strong>{r.title}.</strong> {r.body}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>{p("emptyHabitRecs")}</EmptyState>
          )}
        </Section>
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-velvet/50 p-4">
          <div className="w-full max-w-[390px] rounded-pan bg-card p-4">
            <h2 className="font-display text-title2">{editId ? p("editHabit") : p("newHabit")}</h2>
            <label className="mt-3 block font-sans text-caption">
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </label>
            <label className="mt-3 block font-sans text-caption">
              Description
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </label>
            <p className="mt-3 font-sans text-caption">{p("frequency")}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {(["daily", "weekdays", "custom"] as HabitFrequency[]).map((f) => (
                <Chip key={f} selected={frequency === f} onClick={() => setFrequency(f)}>
                  {f}
                </Chip>
              ))}
            </div>
            {frequency === "custom" ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label, idx) => (
                  <Chip
                    key={label}
                    selected={customDays.includes(idx)}
                    onClick={() =>
                      setCustomDays((days) =>
                        days.includes(idx) ? days.filter((d) => d !== idx) : [...days, idx],
                      )
                    }
                  >
                    {label}
                  </Chip>
                ))}
              </div>
            ) : null}
            <div className="mt-4 flex gap-2">
              <Button className="flex-1" onClick={save}>
                Save
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
