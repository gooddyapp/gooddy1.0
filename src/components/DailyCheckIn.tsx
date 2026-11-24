import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhaseChip } from "@/components/PhaseChip";
import { useAppStore } from "@/store/useAppStore";
import { computeCycleSnapshot } from "@/lib/cycle";
import { todayISO } from "@/lib/dates";
import { OVERALL_MOODS } from "@/data/labels";
import { chipLabel, usePage } from "@/i18n/pageCopy";
import { OVERALL_MOOD_FAMILY, FAMILY_CHIP } from "@/data/moodFamilies";
import type { EnergyLevel, OverallMood } from "@/types";
import { cn } from "@/lib/utils";

const FACE: Record<OverallMood, { brows: string; mouth: string }> = {
  great: { brows: "M22 28 Q30 22 38 28", mouth: "M24 42 Q30 50 36 42" },
  good: { brows: "M22 28 Q30 24 38 28", mouth: "M24 44 Q30 50 36 44" },
  okay: { brows: "M22 28 H38", mouth: "M24 46 H36" },
  low: { brows: "M22 30 Q30 26 38 30", mouth: "M24 48 Q30 42 36 48" },
  struggling: { brows: "M22 32 Q30 28 38 32", mouth: "M24 48 Q30 42 36 48" },
};

const ENERGY_OPTS: { id: EnergyLevel; label: string }[] = [
  { id: 2, label: "Low" },
  { id: 3, label: "Steady" },
  { id: 4, label: "High" },
];

function MoodFace({ mood, selected }: { mood: OverallMood; selected: boolean }) {
  const f = FACE[mood];
  const family = OVERALL_MOOD_FAMILY[mood];
  const styles = FAMILY_CHIP[family];
  return (
    <span
      className={cn(
        "flex h-[60px] w-[60px] items-center justify-center rounded-full border-2",
        selected ? styles.selected : "border-border bg-card text-foreground",
        !selected && styles.idle,
      )}
    >
      <svg width="48" height="48" viewBox="0 0 60 60" aria-hidden="true">
        <circle cx="24" cy="34" r="2.5" fill="currentColor" />
        <circle cx="36" cy="34" r="2.5" fill="currentColor" />
        <path d={f.brows} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d={f.mouth} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function DailyCheckIn({
  onClose,
  onOpenFullLog,
}: {
  onClose: () => void;
  onOpenFullLog: () => void;
}) {
  const profile = useAppStore((s) => s.profile);
  const language = useAppStore((s) => s.language);
  const copy = usePage();
  const periods = useAppStore((s) => s.periods);
  const setOverallMood = useAppStore((s) => s.setOverallMood);
  const setEnergy = useAppStore((s) => s.setEnergy);
  const getDailyLog = useAppStore((s) => s.getDailyLog);
  const completeCheckIn = useAppStore((s) => s.completeCheckIn);
  const skipCheckIn = useAppStore((s) => s.skipCheckIn);
  const markCheckInShown = useAppStore((s) => s.markCheckInShown);

  const today = todayISO();
  const log = getDailyLog(today);
  const snapshot = computeCycleSnapshot(periods, today);
  const [mood, setMood] = useState<OverallMood | null>(log.overallMood);
  const [energy, setEnergyLocal] = useState<EnergyLevel | null>(
    log.energy === 2 || log.energy === 3 || log.energy === 4 ? log.energy : null,
  );
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  const name = (profile.name || "there").split(" ")[0];

  const finishSkip = () => {
    skipCheckIn();
    onClose();
  };

  const save = (picked?: OverallMood) => {
    const next = picked ?? mood;
    if (!next) return;
    setOverallMood(today, next);
    if (energy != null) setEnergy(today, energy);
    completeCheckIn();
    onClose();
  };

  useEffect(() => {
    markCheckInShown();
  }, [markCheckInShown]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-velvet/40 sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) finishSkip();
      }}
    >
      <div
        className="flex max-h-[95dvh] w-full max-w-[390px] flex-col overflow-y-auto rounded-t-pan bg-background px-6 pb-8 pt-4 shadow-[0_8px_24px_-12px_rgba(28,10,16,0.25)] sm:rounded-pan"
        style={{ transform: `translateY(${dragY}px)`, transition: dragging ? "none" : "transform 0.2s" }}
        onTouchStart={(e) => {
          setDragging(true);
          (e.currentTarget as HTMLElement).dataset.startY = String(e.touches[0].clientY);
        }}
        onTouchMove={(e) => {
          const start = Number((e.currentTarget as HTMLElement).dataset.startY ?? 0);
          const dy = Math.max(0, e.touches[0].clientY - start);
          setDragY(dy);
        }}
        onTouchEnd={() => {
          setDragging(false);
          if (dragY > 120) finishSkip();
          else setDragY(0);
        }}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-pill bg-border" aria-hidden="true" />
        <div className="flex items-start justify-between gap-3">
          <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
            {copy("checkIn")}
          </p>
          <button
            type="button"
            aria-label={copy("skipAria")}
            onClick={finishSkip}
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X size={20} />
          </button>
        </div>

        {snapshot.phase ? (
          <div className="mt-2">
            <PhaseChip phase={snapshot.phase} cycleDay={snapshot.cycleDay} />
          </div>
        ) : null}

        <p className="mt-5 font-sans text-body text-muted-foreground">
          {copy(new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening")}, {name}
        </p>
        <h1 className="mt-2 font-display text-title1 text-primary">
          {copy("feeling")} <em className="font-accent">{copy("todayWord")}</em>?
        </h1>
        <p className="mt-2 font-sans text-caption text-muted-foreground">
          {copy("checkHint")}
        </p>

        <div className="mt-8 flex justify-between gap-1">
          {OVERALL_MOODS.map((m) => {
            const selected = mood === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMood(m.id);
                  // One-tap mode: save immediately
                  setOverallMood(today, m.id);
                  if (energy != null) setEnergy(today, energy);
                  completeCheckIn();
                  onClose();
                }}
                className="flex flex-1 flex-col items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <MoodFace mood={m.id} selected={selected} />
                <span
                  className={cn(
                    "font-sans text-caption",
                    selected ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  {chipLabel(m.id, language)}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-8 font-sans text-caption text-muted-foreground">{copy("energyOptional")}</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {ENERGY_OPTS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setEnergyLocal(energy === opt.id ? null : opt.id)}
              className={cn(
                "h-10 rounded-pill font-sans text-chip focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                energy === opt.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground",
              )}
            >
              {copy(opt.id === 2 ? "low" : opt.id === 4 ? "high" : "steady")}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            markCheckInShown();
            onOpenFullLog();
          }}
          className="mt-6 text-left font-sans text-body text-link underline underline-offset-2"
        >
          {copy("addSymptoms")}
        </button>

        <Button className="mt-6 h-11 w-full" onClick={() => save()} disabled={!mood}>
          {copy("saveCheck")}
        </Button>
        <button
          type="button"
          onClick={finishSkip}
          className="mt-3 w-full py-2 font-sans text-body text-muted-foreground"
        >
          {copy("skipToday")}
        </button>
        <p className="mt-2 text-center font-sans text-caption text-ink-subtle">
          {copy("checkLater")}
        </p>
      </div>
    </div>
  );
}
