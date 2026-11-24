import type { AppData, CyclePhase, ISODate } from "@/types";
import { getPhaseContent } from "@/data/phaseContent";
import { computeCycleSnapshot } from "@/lib/cycle";
import { cycleAssumptions } from "@/lib/onboarding";
import { caffeineTotal, nutritionTotals, workoutMinutesOnDate } from "@/lib/analytics";
import { phaseNutritionPlan } from "@/lib/nutrition";
import { FOOD_DATABASE } from "@/data/foods";

export interface Recommendation {
  id: string;
  title: string;
  body: string;
  category: "nutrition" | "movement" | "mindfulness" | "habits" | "recovery" | "general";
}

function dietFilter(preference: AppData["profile"]["dietaryPreference"], name: string, tags: string[] = []) {
  if (preference === "vegan") return tags.includes("vegan") || (!tags.includes("protein") && !name.toLowerCase().includes("chicken") && !name.toLowerCase().includes("salmon") && !name.toLowerCase().includes("egg") && !name.toLowerCase().includes("yogurt") && !name.toLowerCase().includes("whey") && !name.toLowerCase().includes("cheese") && !name.toLowerCase().includes("milk") && !name.toLowerCase().includes("tuna"));
  if (preference === "vegetarian") return !["chicken", "salmon", "tuna"].some((x) => name.toLowerCase().includes(x));
  if (preference === "lactose_intolerant") return !["milk", "yogurt", "cheese", "whey"].some((x) => name.toLowerCase().includes(x));
  return true;
}

export function phaseFoodSuggestions(data: AppData, phase: CyclePhase | null): string[] {
  const content = getPhaseContent(phase, data.language);
  if (!content) return [];
  const pref = data.profile.dietaryPreference;
  const fromPhase = content.nutrition.foods.filter((f) => {
    const match = FOOD_DATABASE.find((x) => x.name.toLowerCase().includes(f.toLowerCase().split(",")[0].toLowerCase()) || f.toLowerCase().includes(x.name.split(",")[0].toLowerCase()));
    if (!match) return true;
    return dietFilter(pref, match.name, match.tags);
  });
  return fromPhase.slice(0, 8);
}

export function buildRecommendations(data: AppData, date: ISODate): Recommendation[] {
  const snap = computeCycleSnapshot(data.periods, date, cycleAssumptions(data.cycleProfile));
  const phase = snap.phase;
  const content = getPhaseContent(phase, data.language);
  const log = data.dailyLogs[date];
  const nut = nutritionTotals(data, date);
  const phasePlan = phaseNutritionPlan(data.goals, data.profile.gender === "male" ? null : phase);
  const cycleOn = data.profile.gender !== "male";
  const steps = log?.steps ?? 0;
  const minutes = workoutMinutesOnDate(data, date);
  const caffeine = caffeineTotal(data, date);
  const recs: Recommendation[] = [];

  if (content && cycleOn) {
    recs.push({
      id: "phase-wellness",
      title: `${content.name} phase`,
      body: content.short,
      category: "general",
    });
  }

  if (nut.calories === 0) {
    recs.push({
      id: "food-empty",
      title: "No meals logged yet",
      body: "That just means nothing is recorded — not that you haven't eaten. Add a meal when you can.",
      category: "nutrition",
    });
  } else if (nut.proteinG < phasePlan.proteinG * 0.5) {
    const foods = phaseFoodSuggestions(data, phase).slice(0, 3).join(", ");
    recs.push({
      id: "protein-low",
      title: "Protein is still catching up",
      body: foods
        ? `You're under half your protein target so far. Ideas that fit this phase: ${foods}.`
        : "You're under half your protein target so far. A protein-rich meal later can help.",
      category: "nutrition",
    });
  }

  if (steps < data.goals.steps * 0.3 && minutes === 0) {
    recs.push({
      id: "move-light",
      title: "A short walk counts",
      body:
        log?.energy != null && log.energy <= 2
          ? "Energy looks low. A gentle 10-minute walk or stretch is enough."
          : content?.movement.general ?? "A short walk would nudge today's movement up.",
      category: "movement",
    });
  }

  if (minutes >= 45 && (log?.energy == null || log.energy <= 3)) {
    recs.push({
      id: "recover",
      title: "Recovery after a longer session",
      body: "You've already done solid work. Stretching, water, and an earlier wind-down will help more than another hard set.",
      category: "recovery",
    });
  }

  if (log?.sleep != null && log.sleep <= 2) {
    recs.push({
      id: "sleep-soft",
      title: "Sleep looked rough",
      body: "Keep today's expectations softer. Breathwork or a shorter workout can help more than forcing intensity.",
      category: "recovery",
    });
  }

  if (caffeine >= data.goals.caffeineMg) {
    recs.push({
      id: "caffeine",
      title: "At your caffeine reference",
      body: "You've reached the daily caffeine reference you set. Switch to water or herbal tea if you want a buffer for sleep.",
      category: "nutrition",
    });
  }

  if (data.features.mindfulness && !log?.overallMood) {
    recs.push({
      id: "mood-check",
      title: "Quick mood check-in",
      body: "A 10-second mood tap helps Mindfulness and Progress stay in sync.",
      category: "mindfulness",
    });
  }

  if (data.features.habits) {
    const scheduled = data.habits.filter((h) => !h.archived);
    const done = data.habitCompletions.filter((c) => c.date === date).length;
    if (scheduled.length && done === 0) {
      recs.push({
        id: "habits-start",
        title: "One habit is enough",
        body: "Pick the smallest habit on your list. Streaks only count scheduled days.",
        category: "habits",
      });
    }
  }

  if (phase === "luteal" && log?.symptoms.includes("cramps")) {
    recs.push({
      id: "luteal-cramps",
      title: "Comfort over intensity",
      body: "With cramps on the log, heat, walks, and rest beat HIIT today.",
      category: "recovery",
    });
  }

  if (phase === "menstrual") {
    recs.push({
      id: "menstrual-rest",
      title: "Rest is on-theme",
      body: content?.bodyNeeds.rest[0] ?? "Extra rest fits this phase.",
      category: "recovery",
    });
  }

  const seen = new Set<string>();
  const unique = recs.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
  const goals = new Set(data.onboardingGoals ?? []);
  const rank = (category: Recommendation["category"]) => {
    if (goals.size === 0) return 1;
    if (category === "nutrition" && goals.has("nutrition")) return 0;
    if ((category === "movement" || category === "recovery") && goals.has("stay_active")) return 0;
    if (category === "habits" && goals.has("habits")) return 0;
    if (category === "mindfulness" && (goals.has("feel_better") || goals.has("track_symptoms"))) return 0;
    if (category === "general" && (goals.has("understand_cycle") || goals.has("get_pregnant"))) return 0;
    return 1;
  };
  return unique.sort((a, b) => rank(a.category) - rank(b.category));
}

export const HABIT_SUGGESTIONS = [
  { name: "Morning sunlight exposure", description: "A few minutes outside after waking." },
  { name: "Take magnesium before bed", description: "Reminder only — not medical advice." },
  { name: "Eat probiotic-rich foods", description: "Yogurt, kefir, or fermented veggies if they suit you." },
  { name: "Stretch for 10 minutes", description: "Any gentle mobility counts." },
  { name: "Track cycle symptoms", description: "Open Cycle and tap what you feel." },
  { name: "Practice gratitude", description: "Three lines in your journal." },
];

export const JOURNAL_PROMPTS = [
  { id: "grateful", text: "What are you grateful for today?" },
  { id: "night", text: "How was your night?" },
  { id: "forward", text: "What are you looking forward to?" },
  { id: "feeling", text: "How are you feeling?" },
  { id: "happy", text: "What made you happy today?" },
  { id: "challenge", text: "What challenged you today?" },
  { id: "need", text: "What do you need right now?" },
];

export const GUIDED_JOURNAL: Record<CyclePhase | "default", string[]> = {
  default: [
    "How does your body feel right now?",
    "What emotion is closest to the surface?",
    "What would feel supportive in the next hour?",
  ],
  menstrual: [
    "Where do you need softness today?",
    "What can wait until energy returns?",
    "What comfort would help most right now?",
  ],
  follicular: [
    "What are you curious about this week?",
    "Which small start would feel good?",
    "Where do you want to use rising energy?",
  ],
  ovulation: [
    "Who or what lights you up today?",
    "What do you want to express?",
    "How will you leave a little buffer for rest?",
  ],
  luteal: [
    "What boundary would protect your energy?",
    "What are you ready to put down?",
    "What does cozy look like tonight?",
  ],
};

export const WORKOUT_TYPES = [
  "Strength training",
  "HIIT",
  "Running",
  "Swimming",
  "Walking",
  "Yoga",
  "Pilates",
  "Stretching",
  "Group fitness",
  "Sprint intervals",
  "Competitive sports",
  "Other",
];
