import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { MoodChip } from "@/components/MoodChip";
import { useAppStore } from "@/store/useAppStore";
import { computeCycleSnapshot } from "@/lib/cycle";
import { useT } from "@/i18n";
import { BODY_ROWS, MOOD_CHIP_ORDER, familyForFeeling } from "@/data/moodFamilies";
import type { Feeling, Symptom } from "@/types";
import { chipLabel, usePage } from "@/i18n/pageCopy";

export function BodyLogScreen({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved?: () => void;
}) {
  const t = useT();
  const copy = usePage();
  const language = useAppStore((s) => s.language);
  const selectedDate = useAppStore((s) => s.selectedDate);
  const periods = useAppStore((s) => s.periods);
  const getDailyLog = useAppStore((s) => s.getDailyLog);
  const setFeelings = useAppStore((s) => s.setFeelings);
  const setSymptoms = useAppStore((s) => s.setSymptoms);
  const upsertDailyLog = useAppStore((s) => s.upsertDailyLog);
  const completeCheckIn = useAppStore((s) => s.completeCheckIn);

  const log = getDailyLog(selectedDate);
  const [feelings, setLocalFeelings] = useState<Feeling[]>(log.feelings);
  const [symptoms, setLocalSymptoms] = useState<Symptom[]>(log.symptoms);
  const [noteOpen, setNoteOpen] = useState(Boolean(log.notes));
  const [notes, setNotes] = useState(log.notes ?? "");

  const snapshot = useMemo(
    () => computeCycleSnapshot(periods, selectedDate),
    [periods, selectedDate],
  );

  const dateLabel = format(parseISO(selectedDate), "EEE d MMM").toUpperCase();
  const phaseBit = snapshot.phase ? ` · ${t(`phases.${snapshot.phase}`)}` : "";

  const bodySelectedCount = useMemo(() => {
    let n = 0;
    for (const row of BODY_ROWS) {
      for (const item of row.items) {
        if (item.kind === "symptom" && symptoms.includes(item.id)) n += 1;
        if (item.kind === "feeling" && feelings.includes(item.id)) n += 1;
      }
    }
    return n;
  }, [feelings, symptoms]);

  const toggleFeeling = (id: Feeling) => {
    setLocalFeelings((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  const toggleSymptom = (id: Symptom) => {
    setLocalSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const save = () => {
    setFeelings(selectedDate, feelings);
    setSymptoms(selectedDate, symptoms);
    upsertDailyLog(selectedDate, { notes: notes.trim() || undefined });
    if (feelings.length || log.overallMood) completeCheckIn();
    onSaved?.();
    onClose();
  };

  const feelingLabel = (id: Feeling) => chipLabel(id, language);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-velvet/50 sm:items-center">
      <div className="flex max-h-[95dvh] w-full max-w-[390px] flex-col overflow-hidden rounded-t-pan bg-background sm:rounded-pan">
        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-8">
          <div className="flex items-start justify-between gap-2">
            <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
              {dateLabel}
              {phaseBit}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="font-sans text-caption text-muted-foreground underline"
            >
              Close
            </button>
          </div>
          <h1 className="mt-2 font-display text-title2 text-foreground">
            {copy("howBody")} <em className="font-accent text-primary">{copy("bodyToday")}</em>?
          </h1>

          <article className="mt-5 rounded-pan border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display text-title3 text-foreground">{copy("mood")}</h2>
              <p className="font-sans text-caption text-muted-foreground">{copy("pickAll")}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {MOOD_CHIP_ORDER.map((id) => (
                <MoodChip
                  key={id}
                  family={familyForFeeling(id)}
                  selected={feelings.includes(id)}
                  onClick={() => toggleFeeling(id)}
                >
                  {feelingLabel(id)}
                </MoodChip>
              ))}
            </div>
          </article>

          <article className="mt-4 rounded-pan border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display text-title3 text-foreground">{copy("body")}</h2>
              <p className="font-sans text-caption text-muted-foreground">
                {bodySelectedCount} selected
              </p>
            </div>
            <ul className="mt-3">
              {BODY_ROWS.map((row, idx) => (
                <li
                  key={row.label}
                  className={
                    idx < BODY_ROWS.length - 1 ? "border-b border-secondary py-3" : "py-3"
                  }
                >
                  <div className="flex gap-3">
                    <p className="w-[62px] shrink-0 font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
                      {chipLabel(row.label.toLowerCase(), language)}
                    </p>
                    <div className="flex flex-1 flex-wrap gap-1.5">
                      {row.items.map((item) => {
                        const selected =
                          item.kind === "symptom"
                            ? symptoms.includes(item.id)
                            : feelings.includes(item.id);
                        return (
                          <MoodChip
                            key={`${item.kind}-${item.id}`}
                            family={item.family}
                            selected={selected}
                            onClick={() =>
                              item.kind === "symptom"
                                ? toggleSymptom(item.id)
                                : toggleFeeling(item.id)
                            }
                          >
                            {chipLabel(item.id, language)}
                          </MoodChip>
                        );
                      })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          {noteOpen ? (
            <label className="mt-4 block">
              <span className="font-sans text-caption text-muted-foreground">{copy("note")}</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 font-sans text-body"
                placeholder={copy("notePlaceholder")}
              />
            </label>
          ) : null}
        </div>

        <div className="flex gap-2 border-t border-border bg-card px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setNoteOpen(true)}
          >
            Add a note
          </Button>
          <Button className="flex-[2]" onClick={save}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
