import { Capacitor } from "@capacitor/core";
import {
  AdMob,
  BannerAdPosition,
  BannerAdSize,
  MaxAdContentRating,
} from "@capacitor-community/admob";

/** Google's public sample banner units. They never pay and never count as real traffic. */
const TEST_BANNER = {
  ios: "ca-app-pub-3940256099942544/2934735716",
  android: "ca-app-pub-3940256099942544/6300978111",
} as const;

function bannerUnit(): { adId: string; isTesting: boolean } {
  const ios = import.meta.env.VITE_ADMOB_IOS_BANNER?.trim();
  const android = import.meta.env.VITE_ADMOB_ANDROID_BANNER?.trim();
  if (Capacitor.getPlatform() === "ios" && ios) return { adId: ios, isTesting: false };
  if (Capacitor.getPlatform() === "android" && android) return { adId: android, isTesting: false };
  const adId = Capacitor.getPlatform() === "ios" ? TEST_BANNER.ios : TEST_BANNER.android;
  return { adId, isTesting: true };
}

let started = false;

/** One banner, above the tab bar. No cycle, symptom, or account data is attached. */
export async function startBanner(): Promise<boolean> {
  if (!Capacitor.isNativePlatform() || started) return started;
  const unit = bannerUnit();
  await AdMob.initialize({
    initializeForTesting: unit.isTesting,
    maxAdContentRating: MaxAdContentRating.Teen,
    tagForChildDirectedTreatment: false,
  });
  try {
    const consent = await AdMob.requestConsentInfo();
    if (consent.isConsentFormAvailable && !consent.canRequestAds) {
      await AdMob.showConsentForm();
    }
    const ready = await AdMob.requestConsentInfo();
    if (!ready.canRequestAds) return false;
  } catch {
    /* A missing consent message should not block a non-personalized test banner. */
  }
  await AdMob.showBanner({
    adId: unit.adId,
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 64,
    isTesting: unit.isTesting,
    npa: true,
  });
  started = true;
  return true;
}

export async function setBannerPaused(paused: boolean): Promise<void> {
  if (!started) return;
  if (paused) await AdMob.hideBanner();
  else await AdMob.resumeBanner();
}

export async function stopBanner(): Promise<void> {
  if (!started) return;
  await AdMob.removeBanner();
  started = false;
}
