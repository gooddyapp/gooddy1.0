import type {
  ActivityLevel,
  AppetiteLevel,
  DietaryPreference,
  EnergyLevel,
  Feeling,
  OverallMood,
  SleepQuality,
  Symptom,
  WeightObjective,
} from "@/types";

export const FEELINGS: { id: Feeling; label: string }[] = [
  { id: "great", label: "Great" },
  { id: "good", label: "Good" },
  { id: "okay", label: "Okay" },
  { id: "low", label: "Low" },
  { id: "anxious", label: "Anxious" },
  { id: "stressed", label: "Stressed" },
  { id: "irritable", label: "Irritable" },
  { id: "calm", label: "Calm" },
  { id: "happy", label: "Happy" },
  { id: "motivated", label: "Motivated" },
  { id: "peaceful", label: "Peaceful" },
  { id: "overwhelmed", label: "Overwhelmed" },
  { id: "grateful", label: "Grateful" },
  { id: "excited", label: "Excited" },
  { id: "lonely", label: "Lonely" },
  { id: "focused", label: "Focused" },
];

export const SYMPTOMS: { id: Symptom; label: string }[] = [
  { id: "energetic", label: "Energetic" },
  { id: "tired", label: "Tired" },
  { id: "bloated", label: "Bloated" },
  { id: "cramps", label: "Cramps" },
  { id: "headache", label: "Headache" },
  { id: "nauseous", label: "Nauseous" },
  { id: "achy", label: "Achy" },
  { id: "sensitive_skin", label: "Sensitive skin" },
  { id: "breast_tenderness", label: "Breast tenderness" },
  { id: "acne", label: "Acne" },
  { id: "brain_fog", label: "Brain fog" },
  { id: "mood_swings", label: "Mood swings" },
  { id: "back_pain", label: "Back pain" },
  { id: "joint_pain", label: "Joint pain" },
  { id: "insomnia", label: "Insomnia" },
];

export const ENERGY_LEVELS: { id: EnergyLevel; label: string }[] = [
  { id: 1, label: "Very Low" },
  { id: 2, label: "Low" },
  { id: 3, label: "Medium" },
  { id: 4, label: "High" },
  { id: 5, label: "Very High" },
];

export const SLEEP_LEVELS: { id: SleepQuality; label: string }[] = [
  { id: 1, label: "Poor" },
  { id: 2, label: "Fair" },
  { id: 3, label: "Good" },
  { id: 4, label: "Great" },
  { id: 5, label: "Excellent" },
];

export const APPETITE_LEVELS: { id: AppetiteLevel; label: string }[] = [
  { id: 0, label: "None" },
  { id: 1, label: "Low" },
  { id: 2, label: "Normal" },
  { id: 3, label: "High" },
  { id: 4, label: "Very High" },
];

export const OVERALL_MOODS: { id: OverallMood; label: string }[] = [
  { id: "great", label: "Great" },
  { id: "good", label: "Good" },
  { id: "okay", label: "Okay" },
  { id: "low", label: "Low" },
  { id: "struggling", label: "Tough" },
];

export const ACTIVITY_LEVELS: { id: ActivityLevel; label: string }[] = [
  { id: "sedentary", label: "Sedentary" },
  { id: "light", label: "Light" },
  { id: "moderate", label: "Moderate" },
  { id: "active", label: "Active" },
  { id: "very_active", label: "Very Active" },
];

export const WEIGHT_OBJECTIVES: { id: WeightObjective; label: string }[] = [
  { id: "lose", label: "Lose weight" },
  { id: "maintain", label: "Maintain weight" },
  { id: "gain", label: "Gain weight" },
  { id: "gain_muscle", label: "Gain muscle" },
  { id: "recomp", label: "Recomposition" },
];

export const DIETARY_PREFERENCES: { id: DietaryPreference; label: string }[] = [
  { id: "balanced", label: "Balanced" },
  { id: "high_protein", label: "High protein" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "keto", label: "Keto" },
  { id: "paleo", label: "Paleo" },
  { id: "mediterranean", label: "Mediterranean" },
  { id: "lactose_intolerant", label: "Lactose intolerant" },
];
