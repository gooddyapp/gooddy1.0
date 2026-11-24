import { useMemo, useState } from "react";
import { Coffee, Plus, Search } from "lucide-react";
import { Disclaimer } from "@/components/ui/Section";
import { Meter } from "@/components/ui/Meter";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { computeCycleSnapshot } from "@/lib/cycle";
import { cycleAssumptions } from "@/lib/onboarding";
import { getPhaseContent } from "@/data/phaseContent";
import { caffeineTotal, nutritionTotals } from "@/lib/analytics";
import { phaseFoodSuggestions } from "@/lib/recommendations";
import { phaseNutritionPlan } from "@/lib/nutrition";
import { useT } from "@/i18n";
import { usePage } from "@/i18n/pageCopy";
import {
  drinksForLanguage,
  findFood,
  scaleFood,
  searchFoods,
} from "@/data/foods";
import type { FoodItem, MealType } from "@/types";
import { cn } from "@/lib/utils";

const MEALS: { id: MealType; label: "breakfast" | "lunch" | "dinner" | "snack" }[] = [
  { id: "breakfast", label: "breakfast" },
  { id: "lunch", label: "lunch" },
  { id: "dinner", label: "dinner" },
  { id: "snacks", label: "snack" },
];

const MULTIPLIERS = [0.5, 1, 1.5, 2, 3];

const NUTRIENT_LABEL: Record<string, Record<string, string>> = {
  es: {
    Iron: "Hierro",
    "Vitamin C": "Vitamina C",
    Magnesium: "Magnesio",
    "Omega-3": "Omega-3",
    Fiber: "Fibra",
    Protein: "Proteína",
    "Complex carbs": "Carbohidratos complejos",
    "B vitamins": "Vitaminas B",
    Antioxidants: "Antioxidantes",
    "Healthy fats": "Grasas saludables",
    Zinc: "Zinc",
    "Vitamin D": "Vitamina D",
    Calcium: "Calcio",
    "Leafy greens": "Hojas verdes",
    Lentils: "Lentejas",
    Citrus: "Cítricos",
    Salmon: "Salmón",
    "Dark chocolate": "Chocolate negro",
    Bananas: "Plátanos",
    Eggs: "Huevos",
    Quinoa: "Quinoa",
    Berries: "Frutos rojos",
    Yogurt: "Yogur",
    Nuts: "Frutos secos",
    Tomatoes: "Tomates",
    "Bell peppers": "Pimientos",
    Almonds: "Almendras",
    Asparagus: "Espárragos",
    Oats: "Avena",
    "Pumpkin seeds": "Semillas de calabaza",
    "Dark leafy greens": "Hojas verdes oscuras",
    "Sweet potato": "Boniato",
    Chickpeas: "Garbanzos",
    Cocoa: "Cacao",
    "Food ideas are educational, not medical requirements.": "Son ideas para comer, no una indicación médica.",
    "Suggestions support general wellness, not prescribed diets.": "Son ideas para sentirte bien, no una dieta recetada.",
    "Fertile-window estimates are educational only.": "La ventana fértil es solo una estimación, para aprender.",
    "Cravings are common; balance beats restriction.": "El antojo es común. Mejor equilibrar que restringir.",
  },
  tr: {
    Iron: "Demir",
    "Vitamin C": "C vitamini",
    Magnesium: "Magnezyum",
    Fiber: "Lif",
    Protein: "Protein",
    "Complex carbs": "Kompleks karbonhidrat",
    "B vitamins": "B vitaminleri",
    Antioxidants: "Antioksidanlar",
    "Healthy fats": "Sağlıklı yağlar",
    Zinc: "Çinko",
    "Vitamin D": "D vitamini",
    Calcium: "Kalsiyum",
    "Leafy greens": "Yeşil yapraklılar",
    Lentils: "Mercimek",
    Citrus: "Narenciye",
    Salmon: "Somon",
    "Dark chocolate": "Bitter çikolata",
    Bananas: "Muz",
    Eggs: "Yumurta",
    Quinoa: "Kinoa",
    Berries: "Çilek",
    Yogurt: "Yoğurt",
    Nuts: "Kuruyemiş",
    Tomatoes: "Domates",
    "Bell peppers": "Biber",
    Almonds: "Badem",
    Asparagus: "Kuşkonmaz",
    Oats: "Yulaf",
    "Pumpkin seeds": "Kabak çekirdeği",
    "Dark leafy greens": "Koyu yeşil yapraklar",
    "Sweet potato": "Tatlı patates",
    Chickpeas: "Nohut",
    Cocoa: "Kakao",
    "Food ideas are educational, not medical requirements.": "Bunlar yemek fikri, tıbbi zorunluluk değil.",
    "Suggestions support general wellness, not prescribed diets.": "Bunlar iyi hissetmek için fikir, reçete değil.",
    "Fertile-window estimates are educational only.": "Doğurgan günler sadece bir tahmin, öğrenmek için.",
    "Cravings are common; balance beats restriction.": "Canın çekmesi normal. Kısıtlamaktan iyisi dengelemek.",
  },
  fi: {
    Iron: "Rauta",
    "Vitamin C": "C-vitamiini",
    Magnesium: "Magnesium",
    Fiber: "Kuitu",
    Protein: "Proteiini",
    "Complex carbs": "Hitaat hiilihydraatit",
    "B vitamins": "B-vitamiinit",
    Antioxidants: "Antioksidantit",
    "Healthy fats": "Hyvät rasvat",
    Zinc: "Sinkki",
    "Vitamin D": "D-vitamiini",
    Calcium: "Kalsium",
    "Leafy greens": "Lehtivihannekset",
    Lentils: "Linssit",
    Citrus: "Sitrukset",
    Salmon: "Lohi",
    "Dark chocolate": "Tumma suklaa",
    Bananas: "Banaanit",
    Eggs: "Kananmunat",
    Quinoa: "Kvinoa",
    Berries: "Marjat",
    Yogurt: "Jogurtti",
    Nuts: "Pähkinät",
    Tomatoes: "Tomaatit",
    "Bell peppers": "Paprika",
    Almonds: "Mantelit",
    Asparagus: "Parsa",
    Oats: "Kaura",
    "Pumpkin seeds": "Kurpitsansiemenet",
    "Dark leafy greens": "Tummat lehtivihannekset",
    "Sweet potato": "Bataatti",
    Chickpeas: "Kikherneet",
    Cocoa: "Kaakao",
    "Food ideas are educational, not medical requirements.": "Nämä ovat ruokaideoita, eivät hoito-ohje.",
    "Suggestions support general wellness, not prescribed diets.": "Nämä tukevat oloa, eivät ole määrätty ruokavalio.",
    "Fertile-window estimates are educational only.": "Hedelmällinen ikkuna on vain arvio, oppimista varten.",
    "Cravings are common; balance beats restriction.": "Himot ovat tavallisia. Tasapaino auttaa enemmän kuin rajoittaminen.",
  },
};

function nutrientLabel(language: string, name: string): string {
  return NUTRIENT_LABEL[language]?.[name] ?? name;
}

const DRINK_ICONS: Record<string, string> = {
  "caf-espresso": "☕",
  "caf-latte": "🥛",
  "caf-cappuccino": "☕",
  "caf-cold-brew": "🧊",
  "caf-iced-coffee": "❄️",
  "caf-green-tea": "🍵",
  "caf-mate": "🧉",
  "caf-turkish-coffee": "☕",
};

export function NutritionScreen() {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const periods = useAppStore((s) => s.periods);
  const profile = useAppStore((s) => s.profile);
  const goals = useAppStore((s) => s.goals);
  const foodEntries = useAppStore((s) => s.foodEntries);
  const customFoods = useAppStore((s) => s.customFoods);
  const favoriteFoodIds = useAppStore((s) => s.favoriteFoodIds);
  const language = useAppStore((s) => s.language);
  const caffeineEntries = useAppStore((s) => s.caffeineEntries);
  const addFoodEntry = useAppStore((s) => s.addFoodEntry);
  const updateFoodEntry = useAppStore((s) => s.updateFoodEntry);
  const deleteFoodEntry = useAppStore((s) => s.deleteFoodEntry);
  const addCustomFood = useAppStore((s) => s.addCustomFood);
  const toggleFavoriteFood = useAppStore((s) => s.toggleFavoriteFood);
  const addCaffeine = useAppStore((s) => s.addCaffeine);
  const updateCaffeine = useAppStore((s) => s.updateCaffeine);
  const deleteCaffeine = useAppStore((s) => s.deleteCaffeine);
  const addWater = useAppStore((s) => s.addWater);
  const getDailyLog = useAppStore((s) => s.getDailyLog);
  const t = useT();
  const p = usePage();

  const [meal, setMeal] = useState<MealType>("breakfast");
  const [query, setQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [multiplier, setMultiplier] = useState(1);
  const [grams, setGrams] = useState<number | null>(null);
  const [editFoodId, setEditFoodId] = useState<string | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [caffeineSearch, setCaffeineSearch] = useState("");
  const [customForm, setCustomForm] = useState({
    name: "",
    servingLabel: "100g",
    servingGrams: 100,
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
  });

  const cycleProfile = useAppStore((s) => s.cycleProfile);
  const snapshot = computeCycleSnapshot(periods, selectedDate, cycleAssumptions(cycleProfile));
  const content = getPhaseContent(snapshot.phase, language);
  const phasePlan = phaseNutritionPlan(goals, profile.gender === "male" ? null : snapshot.phase);
  const totals = nutritionTotals(
    { foodEntries, goals, periods, dailyLogs: {}, caffeineEntries } as never,
    selectedDate,
  );
  const dayFoods = foodEntries.filter((f) => f.date === selectedDate);
  const dayCaffeine = caffeineEntries.filter((c) => c.date === selectedDate);
  const caffeineMg = caffeineTotal({ caffeineEntries } as never, selectedDate);
  const water = getDailyLog(selectedDate).waterMl;
  const suggestions = phaseFoodSuggestions(
    { profile, periods, language } as never,
    snapshot.phase,
  );
  const results = useMemo(
    () => searchFoods(query, customFoods),
    [query, customFoods],
  );
  const drinks = useMemo(() => drinksForLanguage(language), [language]);
  const quickDrinks = useMemo(() => {
    const local = drinks.filter((d) => d.locales?.includes(language));
    const shared = drinks.filter((d) => !d.locales);
    return [...local, ...shared].slice(0, 6);
  }, [drinks, language]);
  const filteredExtra = drinks.filter((d) => {
    const q = caffeineSearch.trim().toLowerCase();
    if (!q) return false;
    const haystack = [d.name, ...(d.aliases ?? [])].join(" ").toLowerCase();
    return haystack.includes(q);
  });

  const openAdd = (m: MealType) => {
    setMeal(m);
    setPickerOpen(true);
    setSelectedFood(null);
    setMultiplier(1);
    setGrams(null);
    setEditFoodId(null);
  };

  const scaled = selectedFood
    ? grams != null && selectedFood.servingGrams > 0
      ? scaleFood(selectedFood, grams / selectedFood.servingGrams)
      : scaleFood(selectedFood, multiplier)
    : null;

  const saveFood = () => {
    if (!selectedFood || !scaled) return;
    const payload = {
      date: selectedDate,
      meal,
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      quantity: grams != null ? grams : multiplier,
      unit: (grams != null ? "g" : "serving") as "g" | "serving",
      grams: scaled.grams,
      calories: scaled.calories,
      proteinG: scaled.proteinG,
      carbsG: scaled.carbsG,
      fatG: scaled.fatG,
    };
    if (editFoodId) updateFoodEntry(editFoodId, payload);
    else addFoodEntry(payload);
    setPickerOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="px-4 pb-2 pt-8 text-center">
        <h1 className="font-display text-title1 text-foreground">{p("nutrition")}</h1>
      </header>

      <div className="flex flex-1 flex-col gap-5 px-4 pb-6">
        {content ? (
          <article className="rounded-pan border border-border bg-card p-4">
            <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
              {snapshot.phase ? t(`phases.${snapshot.phase}`) : p("phaseNutrition")}
            </p>
            <p className="mt-3 font-sans text-caption text-muted-foreground">{p("vitamins")}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {content.nutrition.nutrients.map((n) => (
                <span
                  key={n}
                  className="rounded-pill bg-secondary px-3 py-1.5 font-sans text-chip text-foreground"
                >
                  {nutrientLabel(language, n)}
                </span>
              ))}
            </div>
            <p className="mt-4 font-sans text-caption text-muted-foreground">{p("recommendedFoods")}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(suggestions.length ? suggestions : content.nutrition.foods).map((f) => (
                <span
                  key={f}
                  className="rounded-pill bg-secondary px-3 py-1.5 font-sans text-chip text-foreground"
                >
                  {nutrientLabel(language, f)}
                </span>
              ))}
            </div>
            <Disclaimer>{nutrientLabel(language, content.nutrition.note)}</Disclaimer>
          </article>
        ) : null}

        <article className="rounded-pan border border-border bg-card p-4">
          <p className="font-sans text-label uppercase tracking-[0.08em] text-muted-foreground">
            {p("dailyIntake")}
          </p>
          <div className="mt-3 space-y-3">
            <Meter label={p("calories")} value={totals.calories} target={phasePlan.calories} />
            <Meter label={p("protein")} value={totals.proteinG} target={phasePlan.proteinG} unit="g" />
            <Meter label={p("carbs")} value={totals.carbsG} target={phasePlan.carbsG} unit="g" />
            <Meter label={p("fat")} value={totals.fatG} target={phasePlan.fatG} unit="g" />
          </div>
          <div className="mt-4 flex items-center justify-between gap-2">
            <p className="font-sans text-caption text-muted-foreground">
              {t("home.water")} {water} / {goals.waterMl} ml
            </p>
            <div className="flex gap-1">
              {[250, 500].map((ml) => (
                <Button
                  key={ml}
                  variant="secondary"
                  className="h-8 px-2 text-caption"
                  onClick={() => addWater(selectedDate, ml)}
                >
                  +{ml}
                </Button>
              ))}
            </div>
          </div>
          {snapshot.phase ? (
            <>
              <p className="mt-3 font-sans text-caption text-foreground">
                {t(`nutrition.${snapshot.phase}`, {
                  kcal: phasePlan.calories,
                  delta: Math.abs(phasePlan.calorieDelta),
                  fat: phasePlan.fatG,
                  carbs: phasePlan.carbsG,
                  protein: phasePlan.proteinG,
                })}
              </p>
              <Disclaimer>{t("nutrition.disclaimer")}</Disclaimer>
            </>
          ) : (
            <p className="mt-3 font-sans text-caption text-muted-foreground">{t("nutrition.noPhase")}</p>
          )}
        </article>

        <section>
          <h2 className="font-display text-title3 text-foreground">{p("diary")}</h2>
          <ul className="mt-3 space-y-2">
            {MEALS.map((m) => {
              const items = dayFoods.filter((f) => f.meal === m.id);
              const kcal = Math.round(items.reduce((s, i) => s + i.calories, 0));
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => openAdd(m.id)}
                    className="flex w-full items-center gap-3 rounded-md border border-border bg-card px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-body-strong text-foreground">{p(m.label)}</p>
                      <p className="font-sans text-caption text-muted-foreground">
                        {items.length
                          ? p("items", { n: items.length, kcal })
                          : p("tapToAdd")}
                      </p>
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-primary">
                      <Plus size={18} strokeWidth={2} />
                    </span>
                  </button>
                  {items.length ? (
                    <ul className="mt-1 space-y-1 px-1">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-2 rounded-md bg-secondary/70 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-sans text-caption text-foreground">
                              {item.foodName}
                            </p>
                            <p className="font-sans text-[11px] text-muted-foreground">
                              {Math.round(item.calories)} kcal
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              className="text-link underline text-caption"
                              onClick={() => {
                                const food = findFood(item.foodId, customFoods);
                                if (!food) return;
                                setMeal(item.meal);
                                setSelectedFood(food);
                                setEditFoodId(item.id);
                                setMultiplier(item.unit === "serving" ? item.quantity : 1);
                                setGrams(item.unit === "g" ? item.quantity : null);
                                setPickerOpen(true);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="text-error underline text-caption"
                              onClick={() => deleteFoodEntry(item.id)}
                            >
                              {t("common.delete")}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        <article className="rounded-pan border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Coffee size={16} className="text-primary" />
              <h2 className="font-display text-title3 text-foreground">{p("caffeine")}</h2>
            </div>
            <p className="font-sans text-caption font-semibold tabular-nums text-foreground">
              {caffeineMg}/{goals.caffeineMg}mg
            </p>
          </div>
          <p className="mt-2 font-sans text-caption text-muted-foreground">
            {snapshot.phase === "menstrual"
              ? p("caffeineMenstrual")
              : snapshot.phase === "follicular"
                ? p("caffeineFollicular")
                : snapshot.phase === "ovulation"
                  ? p("caffeineOvulation")
                  : snapshot.phase === "luteal"
                    ? p("caffeineLuteal")
                    : p("caffeineNone")}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {quickDrinks.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() =>
                  addCaffeine({
                    date: selectedDate,
                    drinkId: d.id,
                    name: d.name,
                    quantity: 1,
                    caffeineMg: d.caffeineMgPerServing,
                  })
                }
                className="rounded-md border border-border bg-background px-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-lg" aria-hidden="true">
                  {DRINK_ICONS[d.id] ?? "☕"}
                </span>
                <p className="mt-1 font-sans text-body-strong text-foreground">{d.name}</p>
                <p className="font-sans text-caption text-muted-foreground">
                  {d.caffeineMgPerServing}mg
                </p>
              </button>
            ))}
          </div>
          <label className="relative mt-3 block">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"
            />
            <input
              value={caffeineSearch}
              onChange={(e) => setCaffeineSearch(e.target.value)}
              placeholder={p("searchDrinks")}
              className="w-full rounded-md border border-input bg-background py-2.5 pl-9 pr-3 font-sans text-body placeholder:text-ink-subtle"
            />
          </label>
          {filteredExtra.length ? (
            <ul className="mt-2 space-y-1">
              {filteredExtra.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-md bg-secondary px-3 py-2 text-left"
                    onClick={() =>
                      addCaffeine({
                        date: selectedDate,
                        drinkId: d.id,
                        name: d.name,
                        quantity: 1,
                        caffeineMg: d.caffeineMgPerServing,
                      })
                    }
                  >
                    <span className="font-sans text-caption">{d.name}</span>
                    <span className="font-sans text-caption text-muted-foreground">
                      {d.caffeineMgPerServing}mg
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <Disclaimer>
            {p("caffeineEstimate")}
          </Disclaimer>
          {dayCaffeine.length ? (
            <ul className="mt-3 space-y-2">
              {dayCaffeine.map((c) => (
                <li key={c.id} className="flex justify-between gap-2 font-sans text-caption">
                  <span>
                    {c.name} · {c.caffeineMg} mg
                  </span>
                  <span className="flex gap-2">
                    <button
                      type="button"
                      className="text-link underline"
                      onClick={() => {
                        const raw = window.prompt(p("caffeineMg"), String(c.caffeineMg));
                        if (raw == null) return;
                        const n = Number(raw);
                        if (!Number.isFinite(n) || n < 0) return;
                        updateCaffeine(c.id, { caffeineMg: n });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-error underline"
                      onClick={() => deleteCaffeine(c.id)}
                    >
                      {t("common.delete")}
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </article>
      </div>

      {pickerOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-velvet/50 p-4">
          <div className="max-h-[90vh] w-full max-w-[390px] overflow-y-auto rounded-pan bg-card p-4">
            <h2 className="font-display text-title2">{editFoodId ? p("editFood") : p("addFood")}</h2>
            {!selectedFood ? (
              <>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={p("searchFoods")}
                  className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2"
                />
                <div className="mt-2 flex gap-2">
                  <Button variant="secondary" className="h-9" onClick={() => setCustomOpen(true)}>
                    Create custom
                  </Button>
                  <Button variant="secondary" className="h-9" onClick={() => setPickerOpen(false)}>
                    Cancel
                  </Button>
                </div>
                {favoriteFoodIds.length ? (
                  <p className="mt-3 font-sans text-label uppercase text-muted-foreground">{p("favorites")}</p>
                ) : null}
                <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto">
                  {results.map((food) => (
                    <li key={food.id}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-secondary",
                        )}
                        onClick={() => {
                          setSelectedFood(food);
                          setMultiplier(1);
                          setGrams(null);
                        }}
                      >
                        <span>
                          <span className="block font-sans text-body-strong">{food.name}</span>
                          <span className="block font-sans text-caption text-muted-foreground">
                            {food.servingLabel} · {food.calories} kcal
                          </span>
                        </span>
                        <button
                          type="button"
                          className="px-2 text-rose-gold"
                          aria-label={p("favorite")}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteFood(food.id);
                          }}
                        >
                          {favoriteFoodIds.includes(food.id) ? "★" : "☆"}
                        </button>
                      </button>
                    </li>
                  ))}
                </ul>
                <Disclaimer>
                  Search uses a curated local food list. No live nutrition API is connected.
                </Disclaimer>
              </>
            ) : (
              <>
                <p className="mt-2 font-sans text-body-strong">{selectedFood.name}</p>
                <p className="font-sans text-caption text-muted-foreground">{selectedFood.servingLabel}</p>
                <p className="mt-2 font-sans text-label uppercase text-muted-foreground">{p("multiplier")}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {MULTIPLIERS.map((m) => (
                    <Button
                      key={m}
                      variant={multiplier === m && grams == null ? "primary" : "secondary"}
                      className="h-9"
                      onClick={() => {
                        setMultiplier(m);
                        setGrams(null);
                      }}
                    >
                      {m}x
                    </Button>
                  ))}
                </div>
                <label className="mt-3 block font-sans text-caption">
                  Exact grams / ml
                  <input
                    type="number"
                    min={0}
                    value={grams ?? ""}
                    onChange={(e) =>
                      setGrams(e.target.value === "" ? null : Number(e.target.value))
                    }
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                  />
                </label>
                {scaled ? (
                  <p className="mt-2 font-sans text-caption">
                    {Math.round(scaled.calories)} kcal · P {scaled.proteinG}g · C {scaled.carbsG}g · F{" "}
                    {scaled.fatG}g
                  </p>
                ) : null}
                <div className="mt-4 flex gap-2">
                  <Button className="flex-1" onClick={saveFood}>
                    Save
                  </Button>
                  <Button variant="secondary" className="flex-1" onClick={() => setSelectedFood(null)}>
                    Back
                  </Button>
                </div>
              </>
            )}

            {customOpen ? (
              <div className="mt-4 border-t border-border pt-4">
                <h3 className="font-display text-title2">{p("customFood")}</h3>
                {(
                  [
                    ["name", "Name"],
                    ["servingLabel", p("servingLabel")],
                    ["servingGrams", p("servingGrams")],
                    ["calories", p("calories")],
                    ["proteinG", p("proteinG")],
                    ["carbsG", `${p("carbs")} g`],
                    ["fatG", `${p("fat")} g`],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="mt-2 block font-sans text-caption">
                    {label}
                    <input
                      value={String(customForm[key])}
                      onChange={(e) =>
                        setCustomForm((f) => ({
                          ...f,
                          [key]:
                            key === "name" || key === "servingLabel"
                              ? e.target.value
                              : Number(e.target.value),
                        }))
                      }
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                    />
                  </label>
                ))}
                <Button
                  className="mt-3 w-full"
                  onClick={() => {
                    const item = addCustomFood({
                      name: customForm.name,
                      servingLabel: customForm.servingLabel,
                      servingGrams: customForm.servingGrams,
                      calories: customForm.calories,
                      proteinG: customForm.proteinG,
                      carbsG: customForm.carbsG,
                      fatG: customForm.fatG,
                    });
                    setSelectedFood(item);
                    setCustomOpen(false);
                  }}
                >
                  Save custom food
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
