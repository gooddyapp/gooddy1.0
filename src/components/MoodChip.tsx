import { cn } from "@/lib/utils";
import { FAMILY_CHIP, type MoodFamily } from "@/data/moodFamilies";

export function MoodChip({
  family,
  selected,
  onClick,
  children,
}: {
  family: MoodFamily;
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const styles = FAMILY_CHIP[family];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-8 items-center gap-1 rounded-pill px-3 font-sans text-chip focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? styles.selected : styles.idle,
      )}
    >
      {selected ? <span aria-hidden="true">✓ </span> : null}
      {children}
    </button>
  );
}
