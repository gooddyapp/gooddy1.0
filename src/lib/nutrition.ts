import { ageFromBirthday } from "@/lib/age";
import type {
  ActivityLevel,
  CyclePhase,
  DietaryPreference,
  Goals,
  UserProfile,
  WeightObjective,
} from "@/types";

/**
 * Activity multipliers from the standard TDEE calculator:
 * resting energy (Mifflin–St Jeor) × activity.
 * Sedentary 1.2, light 1.375, moderate 1.55, active 1.725, very active 1.9.
 */
const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/** Daily step targets inside the adult step index of Tudor-Locke et al. 2011. */
const STEP_TARGET: Record<ActivityLevel, number> = {
  sedentary: 5000,
  light: 7500,
  moderate: 10000,
  active: 12500,
  very_active: 15000,
};

/** WHO 2020 adult range is 150–300 minutes of moderate activity a week. */
const EXERCISE_MINUTES: Record<ActivityLevel, number> = {
  sedentary: 150,
  light: 150,
  moderate: 150,
  active: 225,
  very_active: 300,
};

/** Mifflin-St Jeor. Women use −161, men use +5. */
export function estimateBmr(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: UserProfile["gender"] = "female",
): number {
  const sex = gender === "male" ? 5 : -161;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + sex;
}

export function estimateTdee(
  weightKg: number,
  heightCm: number,
  age: number,
  activity: ActivityLevel,
  gender: UserProfile["gender"] = "female",
): number {
  return Math.round(estimateBmr(weightKg, heightCm, age, gender) * ACTIVITY_FACTOR[activity]);
}

export function calorieTargetForObjective(
  tdee: number,
  objective: WeightObjective,
  gender: UserProfile["gender"] = "female",
): number {
  const floor = gender === "male" ? 1500 : 1200;
  if (objective === "lose") return Math.max(floor, tdee - 500);
  if (objective === "gain") return tdee + 500;
  if (objective === "gain_muscle") return tdee + 250;
  if (objective === "recomp") return tdee;
  return tdee;
}

/**
 * Grams per kilogram.
 * Maintenance for a quiet day starts near the WHO safe level (0.83 g/kg).
 * Training and weight-change goals move into the 1.4–2.0 g/kg range
 * from the ISSN protein stand and the Morton et al. 2018 review (~1.6 g/kg).
 */
function proteinPerKg(activity: ActivityLevel, objective: WeightObjective, preference: DietaryPreference): number {
  let perKg = 1.2;
  if (activity === "sedentary") perKg = 0.83;
  if (activity === "light") perKg = 1.0;
  if (activity === "active" || activity === "very_active") perKg = 1.6;
  if (objective === "lose" || objective === "gain" || objective === "recomp") perKg = Math.max(perKg, 1.6);
  if (objective === "gain_muscle") perKg = Math.max(perKg, 1.8);
  if (preference === "high_protein") perKg = Math.min(2.2, perKg + 0.3);
  return perKg;
}

export function defaultMacroSplit(
  calories: number,
  preference: DietaryPreference,
  objective: WeightObjective = "maintain",
): Pick<Goals, "proteinG" | "carbsG" | "fatG"> {
  let proteinPct = 0.25;
  let carbPct = 0.45;
  let fatPct = 0.3;

  if (preference === "high_protein") {
    proteinPct = 0.35;
    carbPct = 0.35;
    fatPct = 0.3;
  } else if (preference === "keto") {
    proteinPct = 0.25;
    carbPct = 0.1;
    fatPct = 0.65;
  } else if (preference === "paleo") {
    proteinPct = 0.3;
    carbPct = 0.3;
    fatPct = 0.4;
  } else if (preference === "vegan" || preference === "vegetarian") {
    proteinPct = 0.2;
    carbPct = 0.5;
    fatPct = 0.3;
  } else if (preference === "mediterranean") {
    proteinPct = 0.2;
    carbPct = 0.45;
    fatPct = 0.35;
  }

  if (objective === "gain_muscle" || objective === "recomp") {
    proteinPct = Math.min(0.4, proteinPct + 0.08);
    carbPct = Math.max(0.25, carbPct - 0.04);
    fatPct = Math.max(0.2, 1 - proteinPct - carbPct);
  }

  return {
    proteinG: Math.round((calories * proteinPct) / 4),
    carbsG: Math.round((calories * carbPct) / 4),
    fatG: Math.round((calories * fatPct) / 9),
  };
}

export function suggestGoals(
  profile: UserProfile,
  weightKg: number | null,
): Partial<Goals> | null {
  const knownAge = profile.birthday ? ageFromBirthday(profile.birthday) : profile.age;
  if (!profile.heightCm || !weightKg || weightKg <= 0) return null;
  // Age adjusts resting energy by 5 kcal per year. Without a birthday the rest of the equation still runs.
  const age = knownAge != null && knownAge >= 16 ? knownAge : 0;
  const tdee = estimateTdee(weightKg, profile.heightCm, age, profile.activityLevel, profile.gender);
  const calories = calorieTargetForObjective(tdee, profile.weightObjective, profile.gender);
  const perKg = proteinPerKg(profile.activityLevel, profile.weightObjective, profile.dietaryPreference);
  let proteinG = Math.round(perKg * weightKg);
  let fatG: number;
  let carbsG: number;
  if (profile.dietaryPreference === "keto") {
    fatG = Math.round((calories * 0.7) / 9);
    const proteinKcal = proteinG * 4;
    carbsG = Math.max(0, Math.round((calories - proteinKcal - fatG * 9) / 4));
  } else {
    const fatShare = profile.dietaryPreference === "mediterranean" || profile.dietaryPreference === "paleo" ? 0.35 : 0.3;
    const minFatG = Math.round((calories * 0.2) / 9);
    fatG = Math.max(minFatG, Math.round((calories * fatShare) / 9));
    const rest = calories - proteinG * 4 - fatG * 9;
    if (rest < 0) {
      proteinG = Math.max(Math.round(0.83 * weightKg), Math.floor((calories - fatG * 9) / 4));
    }
    carbsG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4));
  }
  const waterBase = profile.gender === "male" ? 2500 : 2000;
  const waterMl = Math.round(waterBase * (ACTIVITY_FACTOR[profile.activityLevel] / 1.6));
  return {
    calories,
    proteinG,
    carbsG,
    fatG,
    steps: STEP_TARGET[profile.activityLevel],
    waterMl,
    caffeineMg: 400,
    exerciseMinutesPerWeek: EXERCISE_MINUTES[profile.activityLevel],
  };
}

export interface PhaseNutritionPlan {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  calorieDelta: number;
  proteinDeltaG: number;
  carbsDeltaG: number;
  fatDeltaG: number;
}

/**
 * Educational daily targets. Settings keeps the baseline.
 * Luteal adds calories, split toward fat and carbs.
 * Menstrual keeps calories and shifts some of them to fat.
 * Follicular sits slightly under baseline and favors carbs.
 * Ovulation keeps calories and adds a little protein.
 */
const PHASE_SHIFT: Record<
  CyclePhase,
  { calorieDelta: number; proteinG: number; fatShare: number }
> = {
  menstrual: { calorieDelta: 0, proteinG: 0, fatShare: 0.08 },
  follicular: { calorieDelta: -50, proteinG: 0, fatShare: -0.08 },
  ovulation: { calorieDelta: 0, proteinG: 12, fatShare: 0 },
  luteal: { calorieDelta: 150, proteinG: 0, fatShare: 0.05 },
};

export function phaseNutritionPlan(
  goals: Pick<Goals, "calories" | "proteinG" | "carbsG" | "fatG">,
  phase: CyclePhase | null,
): PhaseNutritionPlan {
  const base: PhaseNutritionPlan = {
    calories: goals.calories,
    proteinG: goals.proteinG,
    carbsG: goals.carbsG,
    fatG: goals.fatG,
    calorieDelta: 0,
    proteinDeltaG: 0,
    carbsDeltaG: 0,
    fatDeltaG: 0,
  };
  if (!phase || goals.calories <= 0) return base;

  const shift = PHASE_SHIFT[phase];
  const calories = Math.max(1200, goals.calories + shift.calorieDelta);
  const proteinG = Math.max(40, goals.proteinG + shift.proteinG);
  const rest = Math.max(0, calories - proteinG * 4);
  const baseFatKcal = Math.max(0, goals.fatG * 9);
  const baseCarbKcal = Math.max(0, goals.carbsG * 4);
  const baseRest = baseFatKcal + baseCarbKcal;
  const baseFatShare = baseRest > 0 ? baseFatKcal / baseRest : 0.35;
  const fatShare = Math.min(0.7, Math.max(0.2, baseFatShare + shift.fatShare));
  const fatG = Math.round((rest * fatShare) / 9);
  const carbsG = Math.max(0, Math.round((rest - fatG * 9) / 4));

  return {
    calories,
    proteinG,
    carbsG,
    fatG,
    calorieDelta: calories - goals.calories,
    proteinDeltaG: proteinG - goals.proteinG,
    carbsDeltaG: carbsG - goals.carbsG,
    fatDeltaG: fatG - goals.fatG,
  };
}

export function pct(consumed: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(999, Math.round((consumed / target) * 100));
}

/** Goal completion for calories: closeness to target (not "lower is better"). */
export function calorieGoalScore(consumed: number, target: number): number {
  if (target <= 0 || consumed <= 0) return 0;
  const ratio = consumed / target;
  if (ratio >= 0.9 && ratio <= 1.1) return 100;
  if (ratio < 0.9) return Math.round((ratio / 0.9) * 100);
  // over target: decay
  const over = Math.min(ratio, 1.5);
  return Math.max(0, Math.round(100 - ((over - 1.1) / 0.4) * 100));
}
