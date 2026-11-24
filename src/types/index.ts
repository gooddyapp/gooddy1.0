export type ISODate = string; // YYYY-MM-DD local calendar date
export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

export type WeightObjective =
  | "lose"
  | "gain"
  | "maintain"
  | "gain_muscle"
  | "recomp";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type DietaryPreference =
  | "balanced"
  | "high_protein"
  | "vegetarian"
  | "vegan"
  | "keto"
  | "paleo"
  | "mediterranean"
  | "lactose_intolerant";

export type Feeling =
  | "great"
  | "good"
  | "okay"
  | "low"
  | "anxious"
  | "stressed"
  | "irritable"
  | "calm"
  | "happy"
  | "motivated"
  | "peaceful"
  | "overwhelmed"
  | "grateful"
  | "excited"
  | "lonely"
  | "focused";

export type Symptom =
  | "energetic"
  | "tired"
  | "bloated"
  | "cramps"
  | "headache"
  | "nauseous"
  | "achy"
  | "sensitive_skin"
  | "breast_tenderness"
  | "acne"
  | "brain_fog"
  | "mood_swings"
  | "back_pain"
  | "joint_pain"
  | "insomnia";

export type EnergyLevel = 1 | 2 | 3 | 4 | 5;
export type SleepQuality = 1 | 2 | 3 | 4 | 5;
export type AppetiteLevel = 0 | 1 | 2 | 3 | 4;
export type OverallMood = "great" | "good" | "okay" | "low" | "struggling";
export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";
export type WorkoutIntensity = "light" | "moderate" | "hard";
export type HabitFrequency = "daily" | "weekdays" | "custom";

export type ProgressRange = "today" | "7d" | "30d" | "90d" | "1y" | "all";

export type AppLanguage = "en" | "es" | "tr" | "fi";

export type OnboardingGoal =
  | "understand_cycle"
  | "feel_better"
  | "track_symptoms"
  | "habits"
  | "nutrition"
  | "stay_active"
  | "get_pregnant"
  | "exploring";

export type LastPeriodChoice = "now" | "weeks_1_2" | "weeks_3_4" | "longer" | "unsure" | "exact";

export type CycleStatus = "typical" | "irregular" | "unknown_length" | "hormonal" | "no_period";

export type NotificationPermission = "unknown" | "granted" | "denied" | "dismissed";

export type Gender = "female" | "male";

export interface UserProfile {
  email: string;
  name: string;
  /** Null until onboarding asks. Existing accounts stay on the cycle experience. */
  gender: Gender | null;
  age: number | null;
  /** ISO date (YYYY-MM-DD). Age is calculated from this and updates on the birthday. */
  birthday: string | null;
  heightCm: number | null;
  activityLevel: ActivityLevel;
  weightObjective: WeightObjective;
  dietaryPreference: DietaryPreference;
  dietaryRestrictions: string[];
  healthConsentAt: string | null;
  /** Set when the user confirms they are 16 or older. */
  ageConfirmedAt: string | null;
  /** Optional. Never set unless the user checks the box. */
  marketingOptIn: boolean;
}

export interface CycleProfile {
  /** True after the user answers cycle questions or edits them in Settings. */
  configured: boolean;
  lastPeriodChoice: LastPeriodChoice | null;
  lastPeriodStart: ISODate | null;
  lastPeriodEstimated: boolean;
  cycleLength: number | null;
  cycleStatus: CycleStatus;
  periodLength: number;
  anchoredPeriodId: string | null;
}

export interface ReminderPrefs {
  dailyLog: boolean;
  dailyLogHour: number;
  periodUpcoming: boolean;
  ovulation: boolean;
  phaseChanges: boolean;
  luteal: boolean;
  hydration: boolean;
  movement: boolean;
  journaling: boolean;
  habits: boolean;
  permission: NotificationPermission;
  deliveredIds: string[];
}

export interface Goals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  steps: number;
  waterMl: number;
  caffeineMg: number;
  exerciseMinutesPerWeek: number;
  sleepTarget: SleepQuality;
  energyTarget: EnergyLevel;
  caloriesManual: boolean;
  macrosManual: boolean;
}

export interface FeatureFlags {
  mindfulness: boolean;
  habits: boolean;
  /** Prompt daily mood check-in after onboarding. */
  dailyCheckIn: boolean;
  /** Only auto-show check-in at/after this local hour (0–23). null = any time. */
  checkInAskAfterHour: number | null;
}

export interface CheckInState {
  lastPromptDate: ISODate | null;
  lastCompletedDate: ISODate | null;
  consecutiveSkips: number;
  snoozeUntil: ISODate | null;
}

export interface Period {
  id: string;
  startDate: ISODate;
  endDate: ISODate;
}

export interface WeightEntry {
  id: string;
  date: ISODate;
  kg: number;
  note?: string;
}

export interface DailyLog {
  date: ISODate;
  feelings: Feeling[];
  symptoms: Symptom[];
  energy: EnergyLevel | null;
  sleep: SleepQuality | null;
  appetite: AppetiteLevel | null;
  overallMood: OverallMood | null;
  waterMl: number;
  steps: number;
  stepsManual: number;
  notes?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servingLabel: string;
  servingGrams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  caffeineMg?: number;
  tags?: string[];
  custom?: boolean;
  favorite?: boolean;
}

export interface FoodEntry {
  id: string;
  date: ISODate;
  meal: MealType;
  foodId: string;
  foodName: string;
  quantity: number;
  unit: "serving" | "g" | "ml";
  grams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface CaffeineEntry {
  id: string;
  date: ISODate;
  drinkId: string;
  name: string;
  quantity: number;
  caffeineMg: number;
}

export interface Workout {
  id: string;
  date: ISODate;
  activityType: string;
  durationMin: number;
  intensity: WorkoutIntensity;
  details?: string;
  notes?: string;
}

export interface JournalEntry {
  id: string;
  date: ISODate;
  createdAt: string;
  updatedAt: string;
  title?: string;
  body: string;
  promptId?: string;
  guided?: boolean;
}

export interface BreathingSession {
  id: string;
  date: ISODate;
  exerciseId: string;
  completedAt: string;
  roundsCompleted: number;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: HabitFrequency;
  customDays?: number[]; // 0=Sun..6=Sat
  archived?: boolean;
  createdAt: string;
}

export interface HabitCompletion {
  habitId: string;
  date: ISODate;
  completedAt: string;
}

export interface AppData {
  version: number;
  language: AppLanguage;
  profile: UserProfile;
  goals: Goals;
  features: FeatureFlags;
  checkIn: CheckInState;
  periods: Period[];
  weightHistory: WeightEntry[];
  dailyLogs: Record<ISODate, DailyLog>;
  foodEntries: FoodEntry[];
  customFoods: FoodItem[];
  favoriteFoodIds: string[];
  caffeineEntries: CaffeineEntry[];
  workouts: Workout[];
  journalEntries: JournalEntry[];
  breathingSessions: BreathingSession[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  selectedDate: ISODate;
  onboardingComplete: boolean;
  onboardingStep: number;
  onboardingGoals: OnboardingGoal[];
  cycleProfile: CycleProfile;
  reminderPrefs: ReminderPrefs;
}

export interface CycleSnapshot {
  cycleDay: number | null;
  phase: CyclePhase | null;
  cycleLength: number;
  periodLength: number;
  averageCycleLength: number | null;
  averagePeriodLength: number | null;
  cycleVariability: number | null;
  nextPeriodStart: ISODate | null;
  fertileWindowStart: ISODate | null;
  fertileWindowEnd: ISODate | null;
  ovulationDay: ISODate | null;
  currentPeriod: Period | null;
  regularity: "learning" | "irregular" | "regular" | "insufficient";
  phaseDay: number | null;
  phaseLength: number | null;
}
