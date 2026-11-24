import type { TranslationKey } from "@/i18n";
import type { ActivityLevel } from "@/types";

export const ACTIVITY_LEVEL_KEYS: Record<ActivityLevel, TranslationKey> = {
  sedentary: "activityLevels.sedentary",
  light: "activityLevels.light",
  moderate: "activityLevels.moderate",
  active: "activityLevels.active",
  very_active: "activityLevels.very_active",
};
