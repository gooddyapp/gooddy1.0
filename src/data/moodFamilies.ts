import type { Feeling, OverallMood, Symptom } from "@/types";

export type MoodFamily =
  | "bright"
  | "calm"
  | "neutral"
  | "low"
  | "tense"
  | "skin"
  | "gut";

export const FAMILY_ORDER: MoodFamily[] = [
  "bright",
  "calm",
  "neutral",
  "low",
  "tense",
];

/** Idle / selected Tailwind class pairs — tokens only, no raw hex. */
export const FAMILY_CHIP: Record<
  MoodFamily,
  { idle: string; selected: string }
> = {
  bright: {
    idle: "bg-mood-bright-tint text-mood-bright-ink",
    selected: "bg-mood-bright-selected text-mood-bright-on font-bold",
  },
  calm: {
    idle: "bg-mood-calm-tint text-mood-calm-ink",
    selected: "bg-mood-calm-selected text-mood-calm-on font-bold",
  },
  neutral: {
    idle: "bg-mood-neutral-tint text-mood-neutral-ink",
    selected: "bg-mood-neutral-selected text-mood-neutral-on font-bold",
  },
  low: {
    idle: "bg-mood-low-tint text-mood-low-ink",
    selected: "bg-mood-low-selected text-mood-low-on font-bold",
  },
  tense: {
    idle: "bg-mood-tense-tint text-mood-tense-ink",
    selected: "bg-mood-tense-selected text-mood-tense-on font-bold",
  },
  skin: {
    idle: "bg-symptom-skin-tint text-symptom-skin-ink",
    selected: "bg-symptom-skin-selected text-symptom-skin-on font-bold",
  },
  gut: {
    idle: "bg-symptom-gut-tint text-symptom-gut-ink",
    selected: "bg-symptom-gut-selected text-symptom-gut-on font-bold",
  },
};

export const FEELING_FAMILY: Record<Feeling, MoodFamily> = {
  great: "bright",
  happy: "bright",
  excited: "bright",
  motivated: "bright",
  focused: "bright",
  good: "calm",
  calm: "calm",
  peaceful: "calm",
  grateful: "calm",
  okay: "neutral",
  low: "low",
  lonely: "low",
  anxious: "tense",
  stressed: "tense",
  irritable: "tense",
  overwhelmed: "tense",
};

export const SYMPTOM_FAMILY: Partial<Record<Symptom, MoodFamily>> = {
  energetic: "bright",
  tired: "low",
  brain_fog: "low",
  cramps: "tense",
  headache: "tense",
  achy: "tense",
  breast_tenderness: "tense",
  back_pain: "tense",
  joint_pain: "tense",
  mood_swings: "tense",
  insomnia: "tense",
  sensitive_skin: "skin",
  acne: "skin",
  bloated: "gut",
  nauseous: "gut",
};

/** Mood chips ordered bright → calm → neutral → low → tense. */
export const MOOD_CHIP_ORDER: Feeling[] = [
  "great",
  "happy",
  "excited",
  "motivated",
  "focused",
  "good",
  "calm",
  "peaceful",
  "grateful",
  "okay",
  "low",
  "lonely",
  "anxious",
  "stressed",
  "irritable",
  "overwhelmed",
];

export type BodyChip =
  | { kind: "symptom"; id: Symptom; label: string; family: MoodFamily }
  | { kind: "feeling"; id: Feeling; label: string; family: MoodFamily };

export const BODY_ROWS: { label: string; items: BodyChip[] }[] = [
  {
    label: "Energy",
    items: [
      { kind: "symptom", id: "energetic", label: "Energetic", family: "bright" },
      { kind: "symptom", id: "tired", label: "Tired", family: "low" },
    ],
  },
  {
    label: "Pain",
    items: [
      { kind: "symptom", id: "cramps", label: "Cramps", family: "tense" },
      { kind: "symptom", id: "headache", label: "Headache", family: "tense" },
      { kind: "symptom", id: "achy", label: "Achy", family: "tense" },
      { kind: "symptom", id: "breast_tenderness", label: "Breast tenderness", family: "tense" },
    ],
  },
  {
    label: "Gut",
    items: [
      { kind: "symptom", id: "bloated", label: "Bloated", family: "gut" },
      { kind: "symptom", id: "nauseous", label: "Nauseous", family: "gut" },
    ],
  },
  {
    label: "Skin",
    items: [
      { kind: "symptom", id: "sensitive_skin", label: "Sensitive", family: "skin" },
      { kind: "symptom", id: "acne", label: "Acne", family: "skin" },
    ],
  },
  {
    label: "Mind",
    items: [
      { kind: "symptom", id: "brain_fog", label: "Brain fog", family: "low" },
      { kind: "feeling", id: "focused", label: "Focused", family: "bright" },
    ],
  },
];

export const OVERALL_MOOD_FAMILY: Record<OverallMood, MoodFamily> = {
  great: "bright",
  good: "calm",
  okay: "neutral",
  low: "low",
  struggling: "tense",
};

export function familyForFeeling(id: Feeling): MoodFamily {
  return FEELING_FAMILY[id] ?? "neutral";
}

export function familyForSymptom(id: Symptom): MoodFamily {
  return SYMPTOM_FAMILY[id] ?? "tense";
}
