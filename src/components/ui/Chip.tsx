import { cn } from "@/lib/utils";

type Phase = "menstrual" | "follicular" | "ovulation" | "luteal";

const selectedPhase: Record<Phase, string> = {
  menstrual: "bg-menstrual text-silk",
  follicular: "bg-follicular text-velvet",
  ovulation: "bg-ovulation text-ink",
  luteal: "bg-luteal text-silk",
};

const idlePhase: Record<Phase, string> = {
  menstrual: "bg-menstrual-tint text-menstrual-ink",
  follicular: "bg-follicular-tint text-follicular-ink",
  ovulation: "bg-ovulation-tint text-ovulation-ink",
  luteal: "bg-luteal-tint text-luteal-ink",
};

export function Chip({
  selected,
  onClick,
  children,
  color,
}: {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  color?: Phase;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-8 items-center rounded-pill px-3 font-sans text-chip focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        color
          ? selected
            ? selectedPhase[color]
            : idlePhase[color]
          : selected
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-foreground",
      )}
    >
      {children}
    </button>
  );
}
