import type { TranslationKey } from "@/i18n";
import type { DietaryPreference } from "@/types";

export const DIETARY_PREFERENCE_KEYS: Record<DietaryPreference, TranslationKey> = {
  balanced: "dietaryPreferences.balanced",
  high_protein: "dietaryPreferences.high_protein",
  vegetarian: "dietaryPreferences.vegetarian",
  vegan: "dietaryPreferences.vegan",
  keto: "dietaryPreferences.keto",
  paleo: "dietaryPreferences.paleo",
  mediterranean: "dietaryPreferences.mediterranean",
  lactose_intolerant: "dietaryPreferences.lactose_intolerant",
};
