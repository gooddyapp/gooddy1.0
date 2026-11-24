import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";
import { signInOrUp, signOutCloud } from "@/lib/cloud";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { useAppStore } from "@/store/useAppStore";

export function CloudAccount() {
  const t = useT();
  const profile = useAppStore((s) => s.profile);
  const [email, setEmail] = useState(profile.email);
  const [password, setPassword] = useState("");
  const [signedIn, setSignedIn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      setSignedIn(data.session?.user.email ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(session?.user.email ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (!supabaseConfigured) {
    return <p className="font-sans text-caption text-muted-foreground">{t("flow.cloudMissing")}</p>;
  }

  if (signedIn) {
    return (
      <div>
        <p className="font-sans text-caption">
          {t("settings.cloudSignedIn")}: {signedIn}
        </p>
        <Button
          variant="secondary"
          className="mt-3 w-full"
          onClick={() => {
            void signOutCloud();
          }}
        >
          {t("settings.signOut")}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <p className="font-sans text-caption text-muted-foreground">{t("settings.cloudBody")}</p>
      <label className="mt-3 block font-sans text-caption">
        {t("onboarding.email")}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
        />
      </label>
      <label className="mt-3 block font-sans text-caption">
        {t("flow.password")}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
        />
      </label>
      {error ? <p className="mt-2 font-sans text-caption text-error">{error}</p> : null}
      <Button
        className="mt-3 w-full"
        disabled={busy}
        onClick={() => {
          if (password.length < 8) {
            setError(t("flow.passwordShort"));
            return;
          }
          setBusy(true);
          setError(null);
          void signInOrUp(email.trim().toLowerCase(), password, "sign-in").then((result) => {
            setBusy(false);
            if (result.error) setError(result.error);
            else if (result.needsConfirmation) setError(t("flow.confirmEmail"));
          });
        }}
      >
        {t("flow.haveAccount")}
      </Button>
      <Button
        variant="secondary"
        className="mt-2 w-full"
        disabled={busy}
        onClick={() => {
          if (password.length < 8) {
            setError(t("flow.passwordShort"));
            return;
          }
          setBusy(true);
          setError(null);
          void signInOrUp(email.trim().toLowerCase(), password, "sign-up").then((result) => {
            setBusy(false);
            if (result.error) setError(result.error);
            else if (result.needsConfirmation) setError(t("flow.confirmEmail"));
          });
        }}
      >
        {t("settings.saveCloud")}
      </Button>
    </div>
  );
}
