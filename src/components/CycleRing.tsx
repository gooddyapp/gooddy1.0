import type { CyclePhase, CycleSnapshot } from "@/types";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

const PHASE_ORDER: CyclePhase[] = ["menstrual", "follicular", "ovulation", "luteal"];

const STROKE: Record<CyclePhase, string> = {
  menstrual: "stroke-menstrual",
  follicular: "stroke-follicular",
  ovulation: "stroke-ovulation",
  luteal: "stroke-luteal",
};

const DOT: Record<CyclePhase, string> = {
  menstrual: "bg-menstrual",
  follicular: "bg-follicular",
  ovulation: "bg-ovulation",
  luteal: "bg-luteal",
};

function phaseLengths(cycleLength: number, periodLength: number) {
  const menstrual = Math.max(2, Math.min(periodLength, Math.floor(cycleLength * 0.25)));
  const ovulationCenter = Math.max(menstrual + 3, cycleLength - 14);
  const ovulationLen = Math.min(3, Math.max(2, Math.round(cycleLength * 0.1)));
  const ovulationStart = Math.max(menstrual + 1, ovulationCenter - Math.floor((ovulationLen - 1) / 2));
  const ovulationEnd = Math.min(cycleLength - 1, ovulationStart + ovulationLen - 1);
  const follicular = Math.max(ovulationStart - (menstrual + 1), 0);
  const ovulation = ovulationEnd - ovulationStart + 1;
  const luteal = Math.max(cycleLength - ovulationEnd, 1);
  return { menstrual, follicular: Math.max(follicular, 1), ovulation, luteal };
}

export function CycleRing({
  snapshot,
  insight,
  size = 260,
  showLegend = true,
}: {
  snapshot: CycleSnapshot;
  insight?: string;
  size?: number;
  showLegend?: boolean;
}) {
  const t = useT();
  const stroke = size >= 220 ? 18 : 14;
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const gap = 6;
  const lengths = phaseLengths(snapshot.cycleLength, snapshot.periodLength);
  const total = Object.values(lengths).reduce((a, b) => a + b, 0);

  let cursor = 0;
  const segments = PHASE_ORDER.map((phase) => {
    const days = lengths[phase];
    const length = (days / total) * circumference;
    const segment = {
      phase,
      dash: Math.max(length - gap, 1),
      offset: cursor + gap / 2,
    };
    cursor += length;
    return segment;
  });

  const today = snapshot.cycleDay ?? 1;
  const theta = ((today - 0.5) / snapshot.cycleLength) * Math.PI * 2;
  const marker = {
    cx: cx + radius * Math.sin(theta),
    cy: cy - radius * Math.cos(theta),
  };

  if (snapshot.cycleDay == null) {
    return (
      <div className="rounded-pan bg-secondary p-6 text-center">
        <p className="font-display text-title2 text-foreground">{t("home.learningCycle")}</p>
        <p className="mt-2 font-sans text-caption text-muted-foreground">
          {t("home.startPeriod")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <p className="sr-only">
        {t("flow.cycleDay")} {snapshot.cycleDay}. {t("cycle.estimateDisclaimer")}
      </p>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          {segments.map((segment) => (
            <circle
              key={segment.phase}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              strokeWidth={stroke}
              strokeLinecap="butt"
              className={STROKE[segment.phase]}
              strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
              strokeDashoffset={-segment.offset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          ))}
          <circle
            cx={marker.cx}
            cy={marker.cy}
            r={7}
            className="fill-silk stroke-rose-gold"
            strokeWidth={2.5}
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-10">
          <div className="flex max-w-[160px] flex-col items-center text-center">
            {snapshot.phase ? (
              <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
                {t(`phases.${snapshot.phase}`)}
              </p>
            ) : null}
            <p className="mt-1 font-display text-[56px] leading-none text-foreground tabular-nums">
              {snapshot.cycleDay}
            </p>
            <p className="mt-1 font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
              {t("flow.cycleDay")}
            </p>
            {insight ? (
              <p className="mt-3 font-sans text-[12px] leading-4 text-muted-foreground">{insight}</p>
            ) : null}
          </div>
        </div>
      </div>
      {showLegend ? (
        <ul className="mt-5 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {PHASE_ORDER.map((phase) => (
            <li
              key={phase}
              className={cn(
                "flex items-center gap-1.5 font-sans text-caption",
                snapshot.phase === phase ? "font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT[phase]}`} aria-hidden="true" />
              {t(`phases.${phase}`)}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
