import {
  Apple,
  BookOpen,
  ChartColumn,
  Dumbbell,
  Home,
  Moon,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useT } from "@/i18n";
import type { TranslationKey } from "@/i18n";
import { cn } from "@/lib/utils";

export type TabId =
  | "home"
  | "cycle"
  | "nutrition"
  | "move"
  | "mindfulness"
  | "habits"
  | "progress"
  | "settings";

const TABS: { id: TabId; labelKey: TranslationKey; icon: LucideIcon }[] = [
  { id: "home", labelKey: "nav.home", icon: Home },
  { id: "cycle", labelKey: "nav.cycle", icon: Moon },
  { id: "nutrition", labelKey: "nav.nutrition", icon: Apple },
  { id: "move", labelKey: "nav.move", icon: Dumbbell },
  { id: "mindfulness", labelKey: "nav.mindfulness", icon: BookOpen },
  { id: "habits", labelKey: "nav.habits", icon: Sparkles },
  { id: "progress", labelKey: "nav.progress", icon: ChartColumn },
  { id: "settings", labelKey: "nav.settings", icon: Settings },
];

type TabBarProps = {
  tab: TabId;
  onChange: (tab: TabId) => void;
  hidden?: TabId[];
};

export function TabBar({ tab, onChange, hidden = [] }: TabBarProps) {
  const t = useT();
  const hiddenSet = new Set(hidden);
  const tabs = TABS.filter((item) => !hiddenSet.has(item.id));

  return (
    <nav
      aria-label={t("nav.primary")}
      className="sticky bottom-0 border-t border-border bg-card pb-[max(8px,env(safe-area-inset-bottom))]"
    >
      <ul
        className="grid gap-0 px-1 pt-1"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map((item) => {
          const active = tab === item.id;
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => onChange(item.id)}
                className="flex w-full flex-col items-center gap-0.5 px-0.5 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                    active ? "bg-brand-tint text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon aria-hidden="true" size={18} strokeWidth={1.75} />
                </span>
                <span
                  className={cn(
                    "font-sans text-[9px] font-semibold leading-tight",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {t(item.labelKey)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
