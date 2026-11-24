import { useState } from "react";
import { DateHeader } from "@/components/DateHeader";
import { Section, EmptyState, Disclaimer } from "@/components/ui/Section";
import { Meter } from "@/components/ui/Meter";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/Chip";
import { useAppStore } from "@/store/useAppStore";
import { computeCycleSnapshot } from "@/lib/cycle";
import { cycleAssumptions } from "@/lib/onboarding";
import { getPhaseContent } from "@/data/phaseContent";
import { todayISO, subISODays } from "@/lib/dates";
import { buildRecommendations, WORKOUT_TYPES } from "@/lib/recommendations";
import { workoutMinutesOnDate } from "@/lib/analytics";
import type { WorkoutIntensity } from "@/types";
import { usePage } from "@/i18n/pageCopy";

const MOVE_TEXT: Record<string, Record<string, string>> = {
  es: {
    "If energy is high and symptoms are quiet, challenging work can feel good.":
      "Si la energía está alta y los síntomas están tranquilos, un entreno exigente puede sentirse bien.",
    "Favor restorative movement. Skip intensity if cramps or fatigue are loud.":
      "Mejor un movimiento que restaure. Si hay cólicos o mucho cansancio, bajá la intensidad.",
    "A natural window to rebuild intensity if you feel good.":
      "Es una ventana linda para subir la intensidad, si te sentís bien.",
    "Keep moving, but let intensity follow energy — especially late luteal.":
      "Seguí moviéndote, pero que la intensidad siga a tu energía, sobre todo al final de esta fase.",
    HIIT: "HIIT",
    "Sprint intervals": "Intervalos",
    Strength: "Fuerza",
    "Group fitness": "Clases grupales",
    Sports: "Deportes",
    Walking: "Caminata",
    Yoga: "Yoga",
    Pilates: "Pilates",
    Stretching: "Estiramiento",
    "Swimming (gentle)": "Nado suave",
    "Strength training": "Fuerza",
    Running: "Correr",
    "HIIT (if you enjoy it)": "HIIT (si te gusta)",
    "Strength (moderate)": "Fuerza moderada",
    Swimming: "Nado",
    "High if recovered; otherwise moderate": "Alta si ya recuperaste; si no, media",
    Light: "Baja",
    "Moderate to challenging, based on how you feel": "Media a exigente, según cómo te sientas",
    "Moderate early; light-to-moderate late": "Media al principio; más suave al final",
    "Still plan a cool-down and protein-rich meal.": "Igual dejá un enfriamiento y una comida con proteína.",
    "Heat, rest, and hydration matter more than PRs this week.":
      "El calor, el descanso y el agua importan más que un récord esta semana.",
    "Keep at least one easier day.": "Dejá al menos un día más suave.",
    "Stretching, heat, and sleep help more than grinding.": "Estirar, calor y dormir ayudan más que forzarte.",
  },
  tr: {
    "If energy is high and symptoms are quiet, challenging work can feel good.":
      "Zirve haftası. Enerjin yüksekse ve belirtiler sakinse, zor bir antrenman iyi oturabilir.",
    "Favor restorative movement. Skip intensity if cramps or fatigue are loud.":
      "Regl günleri dinlenmek için. Kramp ya da yorgunluk yüksekse tempoyu düşür.",
    "A natural window to rebuild intensity if you feel good.":
      "Enerji yükseliyor. İyi hissediyorsan tempoyu yükseltmek için güzel bir aralık.",
    "Keep moving, but let intensity follow energy — especially late luteal.":
      "Bu hafta enerjin daha düşük olabilir. Bu sen değilsin, luteal evre. Tempo enerjini izlesin.",
    "Sprint intervals": "Aralıklı koşu",
    Strength: "Kuvvet",
    "Group fitness": "Grup dersi",
    Sports: "Spor",
    Walking: "Yürüyüş",
    Stretching: "Esneme",
    "Swimming (gentle)": "Sakin yüzme",
    "Strength training": "Kuvvet",
    Running: "Koşu",
    "HIIT (if you enjoy it)": "HIIT (seviyorsan)",
    "Strength (moderate)": "Orta kuvvet",
    Swimming: "Yüzme",
    "High if recovered; otherwise moderate": "Toparlandıysan yüksek; değilse orta",
    Light: "Hafif",
    "Moderate to challenging, based on how you feel": "Nasıl hissettiğine göre orta ya da zorlayıcı",
    "Moderate early; light-to-moderate late": "Başta orta, sonda daha hafif",
    "Still plan a cool-down and protein-rich meal.": "Yine de soğuma ve proteinli bir öğün koy.",
    "Heat, rest, and hydration matter more than PRs this week.":
      "Sıcak, dinlenme ve su bu hafta rekor denemekten daha işe yarar.",
    "Keep at least one easier day.": "En az bir günü daha hafif tut.",
    "Stretching, heat, and sleep help more than grinding.": "Esneme, sıcak ve uyku, zorlamaktan daha çok işe yarar.",
  },
  fi: {
    "If energy is high and symptoms are quiet, challenging work can feel good.":
      "Jos energia on korkealla ja oireet ovat hiljaa, kovempi treeni voi tuntua hyvältä.",
    "Favor restorative movement. Skip intensity if cramps or fatigue are loud.":
      "Lempeä liike riittää. Jos kramppeja tai väsymystä on paljon, laske tehoa.",
    "A natural window to rebuild intensity if you feel good.":
      "Hyvä hetki nostaa tehoa, jos olo on hyvä.",
    "Keep moving, but let intensity follow energy — especially late luteal.":
      "Liiku, mutta anna tehon seurata energiaa, etenkin vaiheen loppupuolella.",
    "Sprint intervals": "Intervallit",
    Strength: "Voima",
    "Group fitness": "Ryhmätreeni",
    Sports: "Urheilu",
    Walking: "Kävely",
    Stretching: "Venyttely",
    "Swimming (gentle)": "Rauhallinen uinti",
    "Strength training": "Voima",
    Running: "Juoksu",
    "HIIT (if you enjoy it)": "HIIT (jos tykkäät)",
    "Strength (moderate)": "Kohtuullinen voima",
    Swimming: "Uinti",
    "High if recovered; otherwise moderate": "Korkea, jos olet palautunut; muuten keskitaso",
    Light: "Matala",
    "Moderate to challenging, based on how you feel": "Keskitaso tai reipas, olon mukaan",
    "Moderate early; light-to-moderate late": "Alussa keskitaso, lopussa kevyempi",
    "Still plan a cool-down and protein-rich meal.": "Jätä silti jäähdyttely ja proteiinipitoinen ateria.",
    "Heat, rest, and hydration matter more than PRs this week.":
      "Lämpö, lepo ja vesi auttavat tällä viikolla enemmän kuin ennätykset.",
    "Keep at least one easier day.": "Jätä ainakin yksi kevyempi päivä.",
    "Stretching, heat, and sleep help more than grinding.":
      "Venyttely, lämpö ja uni auttavat enemmän kuin puskeminen.",
  },
};

function moveText(language: string, text: string): string {
  return MOVE_TEXT[language]?.[text] ?? text;
}

export function MovementScreen() {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const shiftSelectedDate = useAppStore((s) => s.shiftSelectedDate);
  const periods = useAppStore((s) => s.periods);
  const goals = useAppStore((s) => s.goals);
  const getDailyLog = useAppStore((s) => s.getDailyLog);
  const addSteps = useAppStore((s) => s.addSteps);
  const setSteps = useAppStore((s) => s.setSteps);
  const workouts = useAppStore((s) => s.workouts);
  const addWorkout = useAppStore((s) => s.addWorkout);
  const updateWorkout = useAppStore((s) => s.updateWorkout);
  const deleteWorkout = useAppStore((s) => s.deleteWorkout);
  const dailyLogs = useAppStore((s) => s.dailyLogs);
  const foodEntries = useAppStore((s) => s.foodEntries);
  const profile = useAppStore((s) => s.profile);
  const features = useAppStore((s) => s.features);
  const habits = useAppStore((s) => s.habits);
  const habitCompletions = useAppStore((s) => s.habitCompletions);
  const caffeineEntries = useAppStore((s) => s.caffeineEntries);
  const weightHistory = useAppStore((s) => s.weightHistory);

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activityType, setActivityType] = useState(WORKOUT_TYPES[0]);
  const [durationMin, setDurationMin] = useState(30);
  const [intensity, setIntensity] = useState<WorkoutIntensity>("moderate");
  const [details, setDetails] = useState("");
  const [notes, setNotes] = useState("");

  const language = useAppStore((s) => s.language);
  const p = usePage();
  const cycleProfile = useAppStore((s) => s.cycleProfile);
  const onboardingGoals = useAppStore((s) => s.onboardingGoals);
  const snapshot = computeCycleSnapshot(periods, selectedDate, cycleAssumptions(cycleProfile));
  const content = getPhaseContent(snapshot.phase, language);
  const log = getDailyLog(selectedDate);
  const dayWorkouts = workouts.filter((w) => w.date === selectedDate);
  const data = {
    language,
    profile,
    goals,
    features,
    periods,
    weightHistory,
    dailyLogs,
    foodEntries,
    customFoods: [],
    favoriteFoodIds: [],
    caffeineEntries,
    workouts,
    journalEntries: [],
    breathingSessions: [],
    habits,
    habitCompletions,
    selectedDate,
    onboardingComplete: true,
    onboardingStep: 0,
    onboardingGoals,
    cycleProfile,
    reminderPrefs: useAppStore.getState().reminderPrefs,
    checkIn: {
      lastPromptDate: null,
      lastCompletedDate: null,
      consecutiveSkips: 0,
      snoozeUntil: null,
    },
    version: 1,
  };
  const recs = buildRecommendations(data, selectedDate).filter(
    (r) => r.category === "movement" || r.category === "recovery",
  );
  const weekStart = subISODays(selectedDate, 6);
  const weekWorkouts = workouts.filter((w) => w.date >= weekStart && w.date <= selectedDate);
  const weekMinutes = weekWorkouts.reduce((s, w) => s + w.durationMin, 0);

  const openCreate = () => {
    setEditId(null);
    setActivityType(WORKOUT_TYPES[0]);
    setDurationMin(30);
    setIntensity("moderate");
    setDetails("");
    setNotes("");
    setFormOpen(true);
  };

  const save = () => {
    const payload = {
      date: selectedDate,
      activityType,
      durationMin,
      intensity,
      details: details || undefined,
      notes: notes || undefined,
    };
    if (editId) updateWorkout(editId, payload);
    else addWorkout(payload);
    setFormOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col">
      <DateHeader
        date={selectedDate}
        onPrev={() => shiftSelectedDate(-1)}
        onNext={() => shiftSelectedDate(1)}
        onToday={() => setSelectedDate(todayISO())}
      />
      <div className="flex flex-1 flex-col gap-4 px-4 pb-6">
        <Section title={p("phaseMove")}>
          {content ? (
            <div className="space-y-2 font-sans text-caption">
              <p>{moveText(language, content.movement.general)}</p>
              <p>
                <strong>{p("suggested")}:</strong>{" "}
                {content.movement.types.map((type) => moveText(language, type)).join(", ")}
              </p>
              <p>
                <strong>{p("intensity")}:</strong> {moveText(language, content.movement.intensity)}
              </p>
              <p>
                <strong>{p("recovery")}:</strong> {moveText(language, content.movement.recovery)}
              </p>
            </div>
          ) : (
            <EmptyState>{p("emptyMove")}</EmptyState>
          )}
          <Disclaimer>{p("moveNote")}</Disclaimer>
        </Section>

        <Section title={p("steps")}>
          <Meter label={p("steps")} value={log.steps} target={goals.steps} />
          <p className="mt-1 font-sans text-caption text-muted-foreground">
            {p("stepsLeft", { n: Math.max(0, goals.steps - log.steps) })}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[500, 1000, 2000, 5000].map((n) => (
              <Button key={n} variant="secondary" className="h-9" onClick={() => addSteps(selectedDate, n)}>
                +{n.toLocaleString()}
              </Button>
            ))}
            <Button
              variant="secondary"
              className="h-9"
              onClick={() => {
                const raw = window.prompt(p("setSteps"), String(log.steps));
                if (raw == null) return;
                const n = Number(raw);
                if (Number.isFinite(n) && n >= 0) setSteps(selectedDate, n);
              }}
            >
              {p("correct")}
            </Button>
            <Button variant="secondary" className="h-9" onClick={() => setSteps(selectedDate, 0)}>
              {p("clear")}
            </Button>
          </div>
          <Disclaimer>{p("stepsSync")}</Disclaimer>
        </Section>

        <Section title={p("tips")}>
          {recs.length ? (
            <ul className="space-y-2">
              {recs.map((r) => (
                <li key={r.id}>
                  <p className="font-sans text-body-strong">{r.title}</p>
                  <p className="font-sans text-caption text-muted-foreground">{r.body}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>{p("emptyTips")}</EmptyState>
          )}
        </Section>

        <Section title={p("recovery")}>
          <ul className="list-disc pl-5 font-sans text-caption">
            <li>{p("rec1")}</li>
            <li>{p("rec2")}</li>
            <li>{p("rec3")}</li>
            <li>{p("rec4")}</li>
          </ul>
        </Section>

        <Section
          title={p("workouts")}
          action={
            <Button className="h-8 px-3 text-caption" onClick={openCreate}>
              Log workout
            </Button>
          }
        >
          <p className="mb-2 font-sans text-caption text-muted-foreground">
            This week: {weekWorkouts.length} sessions · {weekMinutes} min · today{" "}
            {workoutMinutesOnDate(data, selectedDate)} min
          </p>
          {dayWorkouts.length === 0 ? (
            <EmptyState>{p("noWorkouts")}</EmptyState>
          ) : (
            <ul className="space-y-2">
              {dayWorkouts.map((w) => (
                <li key={w.id} className="rounded-md bg-secondary p-3">
                  <p className="font-sans text-body-strong">
                    {w.activityType} · {w.durationMin} min · {w.intensity}
                  </p>
                  {w.details ? <p className="font-sans text-caption">{w.details}</p> : null}
                  {w.notes ? (
                    <p className="font-sans text-caption text-muted-foreground">{w.notes}</p>
                  ) : null}
                  <div className="mt-2 flex gap-3">
                    <button
                      type="button"
                      className="text-link underline text-caption"
                      onClick={() => {
                        setEditId(w.id);
                        setActivityType(w.activityType);
                        setDurationMin(w.durationMin);
                        setIntensity(w.intensity);
                        setDetails(w.details ?? "");
                        setNotes(w.notes ?? "");
                        setFormOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-error underline text-caption"
                      onClick={() => deleteWorkout(w.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-velvet/50 p-4">
          <div className="max-h-[90vh] w-full max-w-[390px] overflow-y-auto rounded-pan bg-card p-4">
            <h2 className="font-display text-title2">{editId ? p("editWorkout") : p("logWorkout")}</h2>
            <label className="mt-3 block font-sans text-caption">
              Activity
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
              >
                {WORKOUT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block font-sans text-caption">
              Duration (minutes)
              <input
                type="number"
                min={1}
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </label>
            <p className="mt-3 font-sans text-caption">{p("intensity")}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {(["light", "moderate", "hard"] as WorkoutIntensity[]).map((i) => (
                <Chip key={i} selected={intensity === i} onClick={() => setIntensity(i)}>
                  {i}
                </Chip>
              ))}
            </div>
            <label className="mt-3 block font-sans text-caption">
              Details
              <input
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </label>
            <label className="mt-3 block font-sans text-caption">
              Notes
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </label>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1" onClick={save}>
                Save
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
