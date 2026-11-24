import type { CyclePhase } from "@/types";
import { phaseName } from "@/lib/cycle";
import { cn } from "@/lib/utils";

const PHASE_CHIP: Record<CyclePhase, string> = {
  menstrual: "bg-menstrual-tint text-menstrual-ink border-menstrual",
  follicular: "bg-follicular-tint text-follicular-ink border-follicular",
  ovulation: "bg-ovulation-tint text-ovulation-ink border-ovulation",
  luteal: "bg-luteal-tint text-luteal-ink border-luteal",
};

const PHASE_DOT: Record<CyclePhase, string> = {
  menstrual: "bg-menstrual",
  follicular: "bg-follicular",
  ovulation: "bg-ovulation",
  luteal: "bg-luteal",
};

export function PhaseChip({
  phase,
  cycleDay,
  className,
}: {
  phase: CyclePhase | null;
  cycleDay?: number | null;
  className?: string;
}) {
  if (!phase) return null;
  const dayBit = cycleDay != null ? ` · day ${cycleDay}` : "";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 font-sans text-chip",
        PHASE_CHIP[phase],
        className,
      )}
    >
      <span className={cn("h-2.5 w-2.5 rounded-full", PHASE_DOT[phase])} aria-hidden="true" />
      {phaseName(phase)}
      {dayBit}
    </span>
  );
}
