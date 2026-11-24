import { en } from "@/i18n/locales/en";
import { es } from "@/i18n/locales/es";
import { fi } from "@/i18n/locales/fi";
import { tr } from "@/i18n/locales/tr";
import type { AppLanguage, Dictionary } from "@/i18n/types";
import { useAppStore } from "@/store/useAppStore";

export type { AppLanguage, Dictionary } from "@/i18n/types";
export { LANGUAGES, LOCALE_TAGS } from "@/i18n/types";

const dictionaries: Record<AppLanguage, Dictionary> = { en, es, tr, fi };

type Leaves<T, P extends string = ""> = T extends string
  ? P
  : {
      [K in keyof T & string]: Leaves<T[K], P extends "" ? K : `${P}.${K}`>;
    }[keyof T & string];

export type TranslationKey = Leaves<Dictionary>;

function getByPath(dict: Dictionary, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = dict;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === "string" ? cur : undefined;
}

export function translate(
  language: AppLanguage,
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string {
  let value = getByPath(dictionaries[language], key) ?? getByPath(en, key) ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      value = value.replaceAll(`{${k}}`, String(v));
    }
  }
  return value;
}

export function useT() {
  const language = useAppStore((s) => s.language);
  return (key: TranslationKey, vars?: Record<string, string | number>) =>
    translate(language, key, vars);
}

export function useLanguage() {
  return useAppStore((s) => s.language);
}
