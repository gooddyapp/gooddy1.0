import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/Chip";
import { OnboardingScreen } from "@/screens/OnboardingScreen";
import { useAppStore } from "@/store/useAppStore";
import { LANGUAGES, useT } from "@/i18n";
import type { AppLanguage } from "@/types";

export function ConsentGate({ children }: { children: React.ReactNode }) {
  const consent = useAppStore((s) => s.profile.healthConsentAt);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const acceptConsent = useAppStore((s) => s.acceptConsent);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const language = useAppStore((s) => s.language);
  const t = useT();

  if (!onboardingComplete) {
    return <OnboardingScreen />;
  }

  if (!consent) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col justify-center bg-background px-4 py-10 text-foreground">
        <p className="font-sans text-label uppercase text-muted-foreground">{t("consent.brand")}</p>
        <h1 className="mt-2 font-display text-title1">{t("consent.title")}</h1>
        <p className="mt-3 font-sans text-body">{t("consent.intro")}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 font-sans text-caption text-muted-foreground">
          <li>{t("consent.bullet1")}</li>
          <li>{t("consent.bullet2")}</li>
          <li>{t("consent.bullet3")}</li>
          <li>{t("consent.bullet4")}</li>
        </ul>
        <p className="mt-6 font-sans text-label uppercase text-muted-foreground">{t("settings.language")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <Chip
              key={lang.id}
              selected={language === lang.id}
              onClick={() => setLanguage(lang.id as AppLanguage)}
            >
              {lang.nativeName}
            </Chip>
          ))}
        </div>
        <Button className="mt-6 w-full" onClick={() => acceptConsent()}>
          {t("consent.agree")}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
