import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDisplayDate, todayISO } from "@/lib/dates";
import type { ISODate } from "@/types";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";

export function DateHeader({
  date,
  onPrev,
  onNext,
  onToday,
  greeting,
  name,
}: {
  date: ISODate;
  onPrev: () => void;
  onNext: () => void;
  onToday?: () => void;
  greeting?: string;
  name?: string;
}) {
  const t = useT();
  const isToday = date === todayISO();
  return (
    <header className="space-y-3 px-4 pb-2 pt-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-sans text-label uppercase text-muted-foreground">
            {isToday ? t("common.today") : t("common.day")} · {formatDisplayDate(date)}
          </p>
          {greeting ? (
            <h1 className="mt-1 font-display text-title1 text-foreground">
              {greeting}
              {name ? (
                <>
                  , <em className="font-accent text-primary">{name}</em>
                </>
              ) : null}
            </h1>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous day"
            onClick={onPrev}
            className="rounded-md p-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label="Next day"
            onClick={onNext}
            className="rounded-md p-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      {!isToday && onToday ? (
        <Button variant="secondary" className="h-9 w-full" onClick={onToday}>
          {t("common.jumpToToday")}
        </Button>
      ) : null}
    </header>
  );
}
