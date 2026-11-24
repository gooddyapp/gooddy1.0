import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.gooddy.app",
  appName: "gooddy",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#F7EFDF",
      showSpinner: false,
      launchShowDuration: 400,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#F7EFDF",
    },
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
  },
};

export default config;
