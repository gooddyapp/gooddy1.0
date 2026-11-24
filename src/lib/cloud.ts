import { Capacitor } from "@capacitor/core";
import type { AppData } from "@/types";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/store/useAppStore";

/** Opens the installed app. The ad website is not part of confirmation. */
export const APP_AUTH_CALLBACK = "gooddy://auth/callback";

export function authRedirectTo(): string {
  return Capacitor.isNativePlatform() ? APP_AUTH_CALLBACK : window.location.origin;
}

let applyingRemote = false;
let pushTimer: number | null = null;

function persistedState(): AppData {
  const state = useAppStore.getState();
  const {
    setSelectedDate: _a,
    shiftSelectedDate: _b,
    setLanguage: _c,
    acceptConsent: _d,
    completeOnboarding: _e,
    updateProfile: _f,
    updateGoals: _g,
    updateFeatures: _h,
    setOnboardingGoals: _i,
    setOnboardingStep: _j,
    updateCycleProfile: _k,
    commitCycleAnchor: _l,
    updateReminderPrefs: _m,
    markRemindersDelivered: _n,
    recalculateGoalsFromProfile: _o,
    markCheckInShown: _p,
    skipCheckIn: _q,
    completeCheckIn: _r,
    upsertDailyLog: _s,
    getDailyLog: _t,
    setFeelings: _u,
    setSymptoms: _v,
    setEnergy: _w,
    setSleep: _x,
    setAppetite: _y,
    setOverallMood: _z,
    addWater: _aa,
    setWater: _ab,
    addSteps: _ac,
    setSteps: _ad,
    addPeriod: _ae,
    updatePeriod: _af,
    deletePeriod: _ag,
    addWeight: _ah,
    updateWeight: _ai,
    deleteWeight: _aj,
    latestWeight: _ak,
    addFoodEntry: _al,
    updateFoodEntry: _am,
    deleteFoodEntry: _an,
    addCustomFood: _ao,
    toggleFavoriteFood: _ap,
    addCaffeine: _aq,
    updateCaffeine: _ar,
    deleteCaffeine: _as,
    addWorkout: _at,
    updateWorkout: _au,
    deleteWorkout: _av,
    addJournal: _aw,
    updateJournal: _ax,
    deleteJournal: _ay,
    addBreathingSession: _az,
    addHabit: _ba,
    updateHabit: _bb,
    deleteHabit: _bc,
    toggleHabitCompletion: _bd,
    isHabitCompleted: _be,
    deleteAllData: _bf,
    hydrateFromCloud: _bg,
    ...data
  } = state;
  return data;
}

export async function signInOrUp(
  email: string,
  password: string,
  mode: "sign-up" | "sign-in",
): Promise<{ error: string | null; needsConfirmation: boolean }> {
  if (!supabase) return { error: "Supabase is not configured.", needsConfirmation: false };
  const auth =
    mode === "sign-in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: authRedirectTo() },
        });
  if (auth.error) return { error: auth.error.message, needsConfirmation: false };
  if (!auth.data.session) return { error: null, needsConfirmation: true };
  await pullOrPush();
  return { error: null, needsConfirmation: false };
}

async function pushNow(): Promise<string | null> {
  if (!supabase || applyingRemote) return null;
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return null;
  const { error } = await supabase.from("user_state").upsert({
    user_id: user.id,
    state: persistedState(),
    updated_at: new Date().toISOString(),
  });
  return error ? error.message : null;
}

function schedulePush() {
  if (applyingRemote || !supabase) return;
  if (pushTimer != null) window.clearTimeout(pushTimer);
  pushTimer = window.setTimeout(() => {
    pushTimer = null;
    void pushNow();
  }, 800);
}

async function pullOrPush() {
  if (!supabase) return;
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return;
  const { data, error } = await supabase
    .from("user_state")
    .select("state")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data?.state) {
    await pushNow();
    return;
  }
  applyingRemote = true;
  useAppStore.getState().hydrateFromCloud(data.state as AppData);
  applyingRemote = false;
}

async function completeAuthFromUrl(url: string) {
  if (!supabase || !url.startsWith("gooddy:")) return;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return;
  }
  const code = parsed.searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) await pullOrPush();
    return;
  }
  const hash = new URLSearchParams(parsed.hash.replace(/^#/, ""));
  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");
  if (!accessToken || !refreshToken) return;
  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (!error) await pullOrPush();
}

export function startCloudSync(): () => void {
  if (!supabase) return () => undefined;
  void pullOrPush();
  const unsubStore = useAppStore.subscribe(() => schedulePush());
  const { data } = supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_IN" || event === "INITIAL_SESSION") void pullOrPush();
  });
  let removeDeepLink: (() => void) | null = null;
  if (Capacitor.isNativePlatform()) {
    void import("@capacitor/app").then(async ({ App }) => {
      const opened = await App.getLaunchUrl();
      if (opened?.url) await completeAuthFromUrl(opened.url);
      const handle = await App.addListener("appUrlOpen", (event) => {
        void completeAuthFromUrl(event.url);
      });
      removeDeepLink = () => {
        void handle.remove();
      };
    });
  }
  return () => {
    unsubStore();
    data.subscription.unsubscribe();
    removeDeepLink?.();
    if (pushTimer != null) window.clearTimeout(pushTimer);
  };
}

export async function wipeCloudAndSignOut() {
  if (!supabase) return;
  const { error } = await supabase.rpc("delete_own_account");
  if (error) {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id;
    if (userId) await supabase.from("user_state").delete().eq("user_id", userId);
  }
  await supabase.auth.signOut();
}

export async function signOutCloud() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
