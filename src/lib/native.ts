import { Capacitor } from "@capacitor/core";

/** Native shell hooks (no-ops in browser). Call once at app boot. */
export async function initNativeShell() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    const dark =
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark");
    await StatusBar.setStyle({ style: dark ? Style.Light : Style.Dark });
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setBackgroundColor({
        color: dark ? "#1C0A10" : "#F7EFDF",
      });
    }
  } catch {
    /* Plugin unavailable in this build. */
  }

  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch {
    /* ignore */
  }

  try {
    const { Keyboard } = await import("@capacitor/keyboard");
    await Keyboard.setAccessoryBarVisible({ isVisible: true });
  } catch {
    /* ignore */
  }
}
