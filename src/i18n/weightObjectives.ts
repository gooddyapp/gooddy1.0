import type { TranslationKey } from "@/i18n";
import type { WeightObjective } from "@/types";

export const WEIGHT_OBJECTIVE_KEYS: Record<WeightObjective, TranslationKey> = {
  lose: "weightObjectives.lose",
  maintain: "weightObjectives.maintain",
  gain: "weightObjectives.gain",
  gain_muscle: "weightObjectives.gain_muscle",
  recomp: "weightObjectives.recomp",
};
