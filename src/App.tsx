import { useEffect, useMemo, useState } from "react";
import { TabBar, type TabId } from "@/components/TabBar";
import { ConsentGate } from "@/components/ConsentGate";
import { DailyCheckIn } from "@/components/DailyCheckIn";
import { HomeScreen, PeriodEditor } from "@/screens/HomeScreen";
import { CycleScreen } from "@/screens/CycleScreen";
import { NutritionScreen } from "@/screens/NutritionScreen";
import { MovementScreen } from "@/screens/MovementScreen";
import { MindfulnessScreen } from "@/screens/MindfulnessScreen";
import { HabitsScreen } from "@/screens/HabitsScreen";
import { ProgressScreen } from "@/screens/ProgressScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { BodyLogScreen } from "@/screens/BodyLogScreen";
import { useAppStore } from "@/store/useAppStore";
import { todayISO } from "@/lib/dates";
import { cycleAssumptions, showsCycle } from "@/lib/onboarding";
import { computeCycleSnapshot } from "@/lib/cycle";
import { deliverDueReminders, planReminders } from "@/lib/reminders";
import { startCloudSync } from "@/lib/cloud";
import { shouldAutoShowCheckIn } from "@/lib/checkIn";
import { LOCALE_TAGS } from "@/i18n";
import { AdBanner } from "@/components/AdBanner";
import { ageFromBirthday, MIN_SIGNUP_AGE } from "@/lib/age";

export type Theme = "light" | "dark";

function initialTheme(): Theme {
  if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
    return "dark";
  }
  try {
    return localStorage.getItem("gooddy-theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [tab, setTab] = useState<TabId>("home");
  const [periodEditor, setPeriodEditor] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [bodyLogOpen, setBodyLogOpen] = useState(false);
  const [checkInEvaluated, setCheckInEvaluated] = useState(false);

  const language = useAppStore((s) => s.language);
  const birthday = useAppStore((s) => s.profile.birthday);
  const age = useAppStore((s) => s.profile.age);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const recalculateGoalsFromProfile = useAppStore((s) => s.recalculateGoalsFromProfile);
  const gender = useAppStore((s) => s.profile.gender);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const features = useAppStore((s) => s.features);
  const hiddenTabs = useMemo(() => {
    const hidden: TabId[] = [];
    if (!showsCycle(gender)) hidden.push("cycle");
    if (!features.mindfulness) hidden.push("mindfulness");
    if (!features.habits) hidden.push("habits");
    return hidden;
  }, [gender, features.mindfulness, features.habits]);
  const checkIn = useAppStore((s) => s.checkIn);
  const dailyLogs = useAppStore((s) => s.dailyLogs);

  const checkInSnapshot = useMemo(
    () => ({
      features,
      checkIn: checkIn ?? {
        lastPromptDate: null,
        lastCompletedDate: null,
        consecutiveSkips: 0,
        snoozeUntil: null,
      },
      dailyLogs,
      onboardingComplete,
    }),
    [features, checkIn, dailyLogs, onboardingComplete],
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("gooddy-theme", theme);
    } catch {
      /* Theme still applies for this visit. */
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = LOCALE_TAGS[language] ?? "en";
  }, [language]);

  useEffect(() => {
    if (!birthday) return;
    const next = ageFromBirthday(birthday);
    if (next == null || next === age) return;
    updateProfile({ age: next });
    if (next >= MIN_SIGNUP_AGE) recalculateGoalsFromProfile();
  }, [birthday, age, updateProfile, recalculateGoalsFromProfile]);

  useEffect(() => {
    recalculateGoalsFromProfile();
  }, [recalculateGoalsFromProfile]);

  useEffect(() => startCloudSync(), []);

  useEffect(() => {
    if (hiddenTabs.includes(tab)) setTab("home");
  }, [hiddenTabs, tab]);

  useEffect(() => {
    const sync = () => {
      const state = useAppStore.getState();
      if (state.reminderPrefs.permission !== "granted") return;
      const snapshot = computeCycleSnapshot(
        state.periods,
        todayISO(),
        cycleAssumptions(state.cycleProfile),
      );
      const planned = planReminders(state.reminderPrefs, snapshot);
      const delivered = deliverDueReminders(state.reminderPrefs, planned);
      if (delivered.length) state.markRemindersDelivered(delivered);
    };
    sync();
    const onFocus = () => sync();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    const stored = useAppStore.getState().selectedDate;
    if (!stored) setSelectedDate(todayISO());
  }, [setSelectedDate]);

  useEffect(() => {
    if (checkInEvaluated) return;
    if (!onboardingComplete) {
      setCheckInEvaluated(true);
      return;
    }
    if (shouldAutoShowCheckIn(checkInSnapshot)) {
      setCheckInOpen(true);
    }
    setCheckInEvaluated(true);
  }, [onboardingComplete, checkInSnapshot, checkInEvaluated]);

  return (
    <ConsentGate>
      <div className="min-h-dvh bg-secondary">
        <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-background text-foreground shadow-[0_8px_24px_-12px_rgba(28,10,16,0.25)]">
          <main className="flex flex-1 flex-col overflow-y-auto">
            {tab === "home" ? (
              <HomeScreen
                onEditPeriod={() => setPeriodEditor(true)}
                onOpenTrack={() => setTab("nutrition")}
                onOpenCheckIn={() => setCheckInOpen(true)}
                onOpenBodyLog={() => setBodyLogOpen(true)}
                onOpenSection={setTab}
              />
            ) : null}
            {tab === "cycle" ? <CycleScreen /> : null}
            {tab === "nutrition" ? <NutritionScreen /> : null}
            {tab === "move" ? <MovementScreen /> : null}
            {tab === "mindfulness" ? <MindfulnessScreen /> : null}
            {tab === "habits" ? <HabitsScreen /> : null}
            {tab === "progress" ? <ProgressScreen /> : null}
            {tab === "settings" ? (
              <SettingsScreen theme={theme} onThemeChange={setTheme} />
            ) : null}
          </main>
          <AdBanner paused={periodEditor || checkInOpen || bodyLogOpen} />
          <TabBar tab={tab} onChange={setTab} hidden={hiddenTabs} />
        </div>
        {periodEditor ? <PeriodEditor onClose={() => setPeriodEditor(false)} /> : null}
        {checkInOpen ? (
          <DailyCheckIn
            onClose={() => setCheckInOpen(false)}
            onOpenFullLog={() => {
              setCheckInOpen(false);
              setBodyLogOpen(true);
            }}
          />
        ) : null}
        {bodyLogOpen ? <BodyLogScreen onClose={() => setBodyLogOpen(false)} /> : null}
      </div>
    </ConsentGate>
  );
}
