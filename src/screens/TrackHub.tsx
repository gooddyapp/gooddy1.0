import { Section } from "@/components/ui/Section";
import { useAppStore } from "@/store/useAppStore";
import { useT } from "@/i18n";
import type { TranslationKey } from "@/i18n";

export type TrackSection = "nutrition" | "movement" | "mindfulness" | "habits";

export function TrackHub({ onOpen }: { onOpen: (section: TrackSection) => void }) {
  const features = useAppStore((s) => s.features);
  const t = useT();

  const items: {
    id: TrackSection;
    titleKey: TranslationKey;
    bodyKey: TranslationKey;
    enabled: boolean;
  }[] = [
    {
      id: "nutrition",
      titleKey: "track.nutrition",
      bodyKey: "track.nutritionBody",
      enabled: true,
    },
    {
      id: "movement",
      titleKey: "track.movement",
      bodyKey: "track.movementBody",
      enabled: true,
    },
    {
      id: "mindfulness",
      titleKey: "track.mindfulness",
      bodyKey: "track.mindfulnessBody",
      enabled: features.mindfulness,
    },
    {
      id: "habits",
      titleKey: "track.habits",
      bodyKey: "track.habitsBody",
      enabled: features.habits,
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <header className="px-4 pb-2 pt-8">
        <p className="font-sans text-label uppercase text-muted-foreground">{t("track.eyebrow")}</p>
        <h1 className="font-display text-title1 text-foreground">{t("track.title")}</h1>
      </header>
      <div className="flex flex-1 flex-col gap-3 px-4 pb-6">
        {items
          .filter((i) => i.enabled)
          .map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpen(item.id)}
              className="rounded-pan border border-border bg-card p-4 text-left ring-1 ring-rose-gold/40"
            >
              <p className="font-display text-title2">{t(item.titleKey)}</p>
              <p className="mt-1 font-sans text-caption text-muted-foreground">{t(item.bodyKey)}</p>
            </button>
          ))}
        <Section title={t("track.hidden")}>
          <p className="font-sans text-caption text-muted-foreground">{t("track.hiddenBody")}</p>
        </Section>
      </div>
    </div>
  );
}
