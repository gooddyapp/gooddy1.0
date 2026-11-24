import type { CyclePhase } from "@/types";

export const PHASE_HEADLINES: Record<CyclePhase, string> = {
  menstrual: "Menstrual: rest & restore",
  follicular: "Follicular: rise & explore",
  ovulation: "Ovulatory: connect & express",
  luteal: "Luteal: settle & nurture",
};

export const PHASE_RING_INSIGHT: Record<CyclePhase, string> = {
  menstrual: "Energy often dips. Soft movement and warmth go a long way.",
  follicular: "Curiosity rises. Gentle challenges and fresh ideas fit well.",
  ovulation: "You may feel your most confident and social. Lean into connection and bright workouts.",
  luteal: "Energy softens. Cozy routines and steady fuel help you settle.",
};

export function hormoneBadge(pattern: string, language?: string): string {
  const p = pattern.toLowerCase();
  const word = (en: string, es: string, tr: string, fi: string) =>
    language === "es" ? es : language === "tr" ? tr : language === "fi" ? fi : en;
  if (p.includes("peak") || p.includes("surge") || p.includes("zirve") || p.includes("pico") || p.includes("huippu")) {
    return word("Peak", "Pico", "Zirve", "Huippu");
  }
  if (p.includes("yüksel") || p.includes("sube") || p.includes("subi") || p.includes("nous") || p.includes("high") || p.includes("rise") || p.includes("rising")) {
    return word("High", "Alto", "Yüksek", "Korkea");
  }
  if (p.includes("düşük") || p.includes("baja") || p.includes("bajo") || p.includes("matala") || p.includes("low") || p.includes("lowest") || p.includes("fall")) {
    return word("Low", "Bajo", "Düşük", "Matala");
  }
  return word("Typical", "Habitual", "Tipik", "Tavallinen");
}

export function caffeinePhaseNote(phase: CyclePhase | null): string {
  if (phase === "menstrual")
    return "Sensitivity can be higher. A lighter cup may feel kinder.";
  if (phase === "follicular")
    return "Metabolism is picking up. Standard intake is usually fine.";
  if (phase === "ovulation")
    return "Caffeine metabolism is efficient. Standard intake is fine.";
  if (phase === "luteal")
    return "Some feel jitters more easily late luteal. Notice how you respond.";
  return "Log what you drink — amounts are estimates.";
}
