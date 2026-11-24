import { useEffect, useMemo, useState } from "react";
import { Play, Send, Sparkles, Wind } from "lucide-react";
import { Disclaimer } from "@/components/ui/Section";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { computeCycleSnapshot, phaseName } from "@/lib/cycle";
import { OVERALL_MOODS } from "@/data/labels";
import {
  GUIDED_JOURNAL,
  JOURNAL_PROMPTS,
  buildRecommendations,
} from "@/lib/recommendations";
import type { OverallMood } from "@/types";
import { cn } from "@/lib/utils";
import { usePage, type PageKey } from "@/i18n/pageCopy";

const MOOD_EMOJI: Record<OverallMood, string> = {
  great: "😁",
  good: "🙂",
  okay: "😐",
  low: "🙁",
  struggling: "🤒",
};

const BREATHING = [
  {
    id: "calm",
    name: "Calm Anxiety",
    technique: "Box breathing",
    rounds: 4,
    emoji: "😌",
    phases: [
      { label: "Inhale", seconds: 4 },
      { label: "Hold", seconds: 4 },
      { label: "Exhale", seconds: 4 },
      { label: "Hold", seconds: 4 },
    ],
  },
  {
    id: "sleep",
    name: "Better Sleep",
    technique: "4-7-8 breathing",
    rounds: 4,
    emoji: "🌙",
    phases: [
      { label: "Inhale", seconds: 4 },
      { label: "Hold", seconds: 7 },
      { label: "Exhale", seconds: 8 },
    ],
  },
  {
    id: "exam",
    name: "Before Exam",
    technique: "Energizing breathing",
    rounds: 3,
    emoji: "⚡",
    phases: [
      { label: "Inhale", seconds: 2 },
      { label: "Exhale", seconds: 2 },
      { label: "Inhale", seconds: 2 },
      { label: "Exhale", seconds: 4 },
    ],
  },
  {
    id: "energy",
    name: "Energy Boost",
    technique: "Bellows breathing",
    rounds: 3,
    emoji: "✨",
    phases: [
      { label: "Quick inhale", seconds: 1 },
      { label: "Quick exhale", seconds: 1 },
    ],
  },
  {
    id: "period",
    name: "Period Relief",
    technique: "Gentle deep-belly breathing",
    rounds: 5,
    emoji: "💗",
    phases: [
      { label: "Inhale softly", seconds: 5 },
      { label: "Exhale slowly", seconds: 5 },
    ],
  },
] as const;

const BREATH_COPY: Record<string, { name: PageKey; tech: PageKey }> = {
  calm: { name: "calm", tech: "box" },
  sleep: { name: "betterSleep", tech: "breath478" },
  exam: { name: "beforeExam", tech: "energizing" },
  energy: { name: "energyBoost", tech: "bellows" },
  period: { name: "periodRelief", tech: "belly" },
};

const PHASE_LABEL: Record<string, PageKey> = {
  Inhale: "inhale",
  Hold: "hold",
  Exhale: "exhale",
  "Quick inhale": "quickIn",
  "Quick exhale": "quickOut",
  "Inhale softly": "inhaleSoft",
  "Exhale slowly": "exhaleSlow",
};

export function MindfulnessScreen() {
  const copy = usePage();
  const selectedDate = useAppStore((s) => s.selectedDate);
  const setOverallMood = useAppStore((s) => s.setOverallMood);
  const getDailyLog = useAppStore((s) => s.getDailyLog);
  const journalEntries = useAppStore((s) => s.journalEntries);
  const addJournal = useAppStore((s) => s.addJournal);
  const updateJournal = useAppStore((s) => s.updateJournal);
  const deleteJournal = useAppStore((s) => s.deleteJournal);
  const addBreathingSession = useAppStore((s) => s.addBreathingSession);
  const periods = useAppStore((s) => s.periods);
  const store = useAppStore();

  const log = getDailyLog(selectedDate);
  const dayJournals = journalEntries
    .filter((j) => j.date === selectedDate)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const snapshot = computeCycleSnapshot(periods, selectedDate);
  const guided =
    GUIDED_JOURNAL[snapshot.phase ?? "default"] ?? GUIDED_JOURNAL.default;

  const [draft, setDraft] = useState("");
  const [title, setTitle] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [promptId, setPromptId] = useState<string | undefined>();
  const [guidedStep, setGuidedStep] = useState<number | null>(null);
  const [guidedAnswers, setGuidedAnswers] = useState<string[]>([]);
  const [activeBreathing, setActiveBreathing] = useState<(typeof BREATHING)[number] | null>(
    null,
  );

  const recs = useMemo(
    () =>
      buildRecommendations(store, selectedDate).filter((r) => r.category === "mindfulness"),
    [store, selectedDate],
  );

  const saveJournal = () => {
    if (!draft.trim()) return;
    if (editId) {
      updateJournal(editId, { title: title || undefined, body: draft, date: selectedDate });
    } else {
      addJournal({
        date: selectedDate,
        title: title || undefined,
        body: draft,
        promptId,
        guided: false,
      });
    }
    setDraft("");
    setTitle("");
    setEditId(null);
    setPromptId(undefined);
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="px-4 pb-2 pt-8">
        <h1 className="font-display text-title1 text-foreground">{copy("mind")}</h1>
      </header>

      <div className="flex flex-1 flex-col gap-5 px-4 pb-6">
        <article className="rounded-pan border border-border bg-card p-4">
          <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
            How are you today?
          </p>
          <div className="mt-4 grid grid-cols-5 gap-1">
            {OVERALL_MOODS.map((m) => {
              const selected = log.overallMood === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() =>
                    setOverallMood(
                      selectedDate,
                      selected ? null : (m.id as OverallMood),
                    )
                  }
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-md px-1 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected ? "bg-brand-tint" : "hover:bg-secondary",
                  )}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {MOOD_EMOJI[m.id]}
                  </span>
                  <span
                    className={cn(
                      "font-sans text-[10px] font-semibold",
                      selected ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </article>

        <section>
          <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
            Quick prompts
          </p>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {JOURNAL_PROMPTS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPromptId(p.id);
                  setTitle(p.text);
                  setDraft((d) => d || "");
                }}
                className={cn(
                  "shrink-0 rounded-pill border border-border bg-card px-4 py-2 font-sans text-caption text-foreground",
                  promptId === p.id && "border-primary bg-brand-tint text-primary",
                )}
              >
                {p.text}
              </button>
            ))}
          </div>
        </section>

        <article className="relative rounded-pan border border-border bg-card p-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={copy("titleOptional")}
            className="mb-2 w-full border-0 bg-transparent font-sans text-body-strong text-foreground placeholder:text-ink-subtle focus:outline-none"
          />
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={5}
            placeholder={copy("writeThoughts")}
            className="w-full resize-none border-0 bg-transparent font-sans text-body text-foreground placeholder:text-ink-subtle focus:outline-none"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              aria-label={editId ? copy("updateEntry") : copy("saveEntry")}
              onClick={saveJournal}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Send size={18} />
            </button>
          </div>
          {dayJournals.length ? (
            <ul className="mt-4 space-y-3 border-t border-border pt-4">
              {dayJournals.map((j) => (
                <li key={j.id} className="rounded-md bg-secondary p-3">
                  <p className="font-sans text-body-strong">{j.title || "Journal"}</p>
                  <p className="whitespace-pre-wrap font-sans text-caption">{j.body}</p>
                  <div className="mt-2 flex gap-3">
                    <button
                      type="button"
                      className="text-link underline text-caption"
                      onClick={() => {
                        setEditId(j.id);
                        setTitle(j.title ?? "");
                        setDraft(j.body);
                        setPromptId(j.promptId);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-error underline text-caption"
                      onClick={() => deleteJournal(j.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </article>

        <button
          type="button"
          onClick={() => {
            setGuidedStep(0);
            setGuidedAnswers([]);
          }}
          className="flex w-full items-start gap-3 rounded-pan border border-border bg-card p-4 text-left ring-1 ring-rose-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="mt-0.5 text-rose-gold" aria-hidden="true">
            <Sparkles size={18} />
          </span>
          <span>
            <span className="block font-display text-title3 text-foreground">
              5-minute guided journal
            </span>
            <span className="mt-1 block font-sans text-caption text-muted-foreground">
              A calming reflection
              {snapshot.phase
                ? ` tailored to your ${phaseName(snapshot.phase).toLowerCase()} phase.`
                : "."}
            </span>
          </span>
        </button>

        <section>
          <div className="flex items-center gap-2">
            <Wind size={16} className="text-primary" />
            <h2 className="font-display text-title3 text-foreground">{copy("breathing")}</h2>
          </div>
          <ul className="mt-3 space-y-2">
            {BREATHING.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => setActiveBreathing(b)}
                  className="flex w-full items-center gap-3 rounded-pan border border-border bg-card px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="text-xl" aria-hidden="true">
                    {b.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-sans text-body-strong text-foreground">
                      {copy(BREATH_COPY[b.id].name)}
                    </span>
                    <span className="block font-sans text-caption text-muted-foreground">
                      {copy(BREATH_COPY[b.id].tech)} · {b.rounds}
                    </span>
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-tint text-primary">
                    <Play size={16} fill="currentColor" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <Disclaimer>
            Stop if you feel dizzy or uncomfortable. Breathing is optional support, not treatment.
          </Disclaimer>
        </section>

        {recs.length ? (
          <article className="rounded-pan bg-secondary p-4">
            <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
              For you
            </p>
            <ul className="mt-2 space-y-2">
              {recs.map((r) => (
                <li key={r.id} className="font-sans text-caption">
                  <strong>{r.title}.</strong> {r.body}
                </li>
              ))}
            </ul>
          </article>
        ) : null}
      </div>

      {guidedStep != null ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-velvet/50 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-[390px] overflow-y-auto rounded-pan bg-card p-5">
            {guidedStep < guided.length ? (
              <>
                <p className="font-sans text-caption text-muted-foreground">
                  Question {guidedStep + 1} of {guided.length}
                </p>
                <p className="mt-2 font-display text-title2">{guided[guidedStep]}</p>
                <textarea
                  value={guidedAnswers[guidedStep] ?? ""}
                  onChange={(e) => {
                    const next = [...guidedAnswers];
                    next[guidedStep] = e.target.value;
                    setGuidedAnswers(next);
                  }}
                  rows={4}
                  className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2"
                />
                <div className="mt-3 flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => setGuidedStep((s) => (s == null ? 0 : s + 1))}
                  >
                    Next
                  </Button>
                  <Button variant="secondary" className="flex-1" onClick={() => setGuidedStep(null)}>
                    Exit
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="font-sans text-body">{copy("nice")}</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      const body = guided
                        .map((q, i) => `${q}\n${guidedAnswers[i] ?? ""}`)
                        .join("\n\n");
                      addJournal({
                        date: selectedDate,
                        title: copy("guided"),
                        body,
                        guided: true,
                      });
                      setGuidedStep(null);
                      setGuidedAnswers([]);
                    }}
                  >
                    Save
                  </Button>
                  <Button variant="secondary" className="flex-1" onClick={() => setGuidedStep(null)}>
                    Discard
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {activeBreathing ? (
        <BreathingPlayer
          exercise={activeBreathing}
          onClose={() => setActiveBreathing(null)}
          onComplete={(rounds) => {
            addBreathingSession({
              date: selectedDate,
              exerciseId: activeBreathing.id,
              completedAt: new Date().toISOString(),
              roundsCompleted: rounds,
            });
            setActiveBreathing(null);
          }}
        />
      ) : null}
    </div>
  );
}

function BreathingPlayer({
  exercise,
  onClose,
  onComplete,
}: {
  exercise: (typeof BREATHING)[number];
  onClose: () => void;
  onComplete: (rounds: number) => void;
}) {
  const copy = usePage();
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState(1);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [remaining, setRemaining] = useState<number>(exercise.phases[0].seconds);
  const phase = exercise.phases[phaseIndex];

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      const nextPhase = phaseIndex + 1;
      if (nextPhase >= exercise.phases.length) {
        if (round >= exercise.rounds) {
          setRunning(false);
          onComplete(exercise.rounds);
          return;
        }
        setRound((r) => r + 1);
        setPhaseIndex(0);
        setRemaining(exercise.phases[0].seconds);
      } else {
        setPhaseIndex(nextPhase);
        setRemaining(exercise.phases[nextPhase].seconds);
      }
      return;
    }
    const t = window.setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [running, remaining, phaseIndex, round, exercise, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-velvet/50 p-4 sm:items-center">
      <div className="w-full max-w-[390px] rounded-pan bg-card p-6 text-center">
        <p className="font-sans text-label uppercase text-muted-foreground">{copy(BREATH_COPY[exercise.id].name)}</p>
        <h2 className="mt-1 font-display text-title1">{copy(PHASE_LABEL[phase.label] ?? "inhale")}</h2>
        <p className="mt-4 font-display text-display text-primary">{remaining}</p>
        <p className="mt-2 font-sans text-caption text-muted-foreground">
          {round}/{exercise.rounds} · {copy(BREATH_COPY[exercise.id].tech)}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {!running ? (
            <Button onClick={() => setRunning(true)}>
              {remaining < phase.seconds ? copy("resume") : copy("start")}
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setRunning(false)}>
              Pause
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => {
              setRunning(false);
              onClose();
            }}
          >
            Stop
          </Button>
        </div>
      </div>
    </div>
  );
}
