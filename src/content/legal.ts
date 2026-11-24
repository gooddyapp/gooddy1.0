export const LEGAL = {
  privacy: {
    title: "Privacy policy",
    updated: "24 November 2026",
    sections: [
      {
        heading: "Who we are",
        body: "This policy covers the gooddy iPhone app, Android app, and the website pages we publish. The apps are com.gooddy.app. The controller is gooddy. Email gooddy.wellness@gmail.com.",
      },
      {
        heading: "Age",
        body: "gooddy is for people aged 16 and over. It is not directed at children. If you are under 16, do not create a profile.",
      },
      {
        heading: "What this is",
        body: "gooddy is a wellness companion. Cycle dates, phase notes, calorie targets, and fertile-window estimates are educational estimates. They are not medical advice, a diagnosis, contraception, or proof of ovulation.",
      },
      {
        heading: "What you can enter",
        body: "Name, email, gender, birthday and the age calculated from it, height, weight, activity, diet, goals, cycle dates, symptoms, mood, energy, sleep, appetite, meals, water, caffeine, steps, workouts, habits, and journal text. You do not have to fill in every field. Cycle and symptom notes are health information. We ask for a separate health-data consent before we use them to personalize the app. Marketing email is optional, separate, and off in this version.",
      },
      {
        heading: "Where it lives",
        body: "A copy stays on your phone or in this browser until you delete it. If you create an account, a private copy is stored for your sign-in (Supabase), sent over HTTPS, and not sold. Those servers may be outside your country, including in the United States. If you never create an account, that copy is not made.",
      },
      {
        heading: "Ads",
        body: "The phone apps can show one Google AdMob banner. We request a non-personalized ad. We do not send your cycle, symptoms, birthday, weight, journal, or email to choose the ad, and we do not use health information to track you across other apps. Google may receive device and network information, such as an IP address, to deliver and measure the banner. These website pages do not show that banner.",
      },
      {
        heading: "Other services",
        body: "The app may request typefaces from Google Fonts. That request does not include your cycle or email. Reminders stay off until you enable them. Apple or Google then delivers the notification you asked for.",
      },
      {
        heading: "What we do not do",
        body: "We do not sell personal information. We do not share health information with data brokers. We do not use health information for advertising.",
      },
      {
        heading: "Your rights",
        body: "Settings → Privacy & data → Delete my account and all data removes the on-device copy and the signed-in account record. You can email gooddy.wellness@gmail.com to access, correct, export, or delete the account copy, or to withdraw health-data consent. If you are in the EEA or the UK, you can complain to your data protection authority. In Finland that is the Office of the Data Protection Ombudsman.",
      },
      {
        heading: "How long",
        body: "We keep data until you delete it. A database backup may remain for a short time after account deletion, then drop out.",
      },
    ],
  },
  terms: {
    title: "Terms",
    updated: "24 November 2026",
    sections: [
      {
        heading: "Agreement",
        body: "These terms are between you and gooddy for the apps and the website pages we publish. If you do not agree, do not create a profile. Contact gooddy.wellness@gmail.com.",
      },
      {
        heading: "Age",
        body: "You must be 16 or older.",
      },
      {
        heading: "Not medical care",
        body: "gooddy is a wellness companion, not a doctor, a clinic, a medical device, or an emergency service. Nothing here is medical advice, a diagnosis, fertility treatment, or contraception. Do not delay care because of an estimate in the app.",
      },
      {
        heading: "Estimates",
        body: "Cycle day, phase, next period, fertile window, calories, and macros are estimates. They can be wrong, especially with irregular cycles, hormonal contraception, pregnancy, or missing dates.",
      },
      {
        heading: "Your content and account",
        body: "You keep what you log. You let gooddy store it only to run the service, including a private account copy if you create one. You are responsible for the email and password. Do not submit someone else’s health information unless you are allowed to.",
      },
      {
        heading: "Ads",
        body: "The phone apps may show one non-personalized banner. Health information is not used to choose ads.",
      },
      {
        heading: "License",
        body: "You receive a personal, non-transferable license to use the app on devices you own or control. gooddy keeps the app, the name, and the brand.",
      },
      {
        heading: "Apple",
        body: "If you downloaded gooddy from the App Store, the agreement is between you and gooddy, not Apple. Apple is not responsible for the app or its content. Support is gooddy’s responsibility. If an applicable warranty fails, you may notify Apple, and Apple may refund a purchase price if one was paid. Apple has no other warranty obligation to the extent the law allows. gooddy is responsible for product claims and intellectual-property claims. Apple and its subsidiaries are third-party beneficiaries of this section. You must also follow any third-party terms that apply to your phone.",
      },
      {
        heading: "Google Play",
        body: "If you downloaded gooddy from Google Play, Google’s store terms apply to the download. Google is the store, not the other party to these terms.",
      },
      {
        heading: "Liability",
        body: "Where the law allows, gooddy is not liable for indirect loss or for health, training, or food decisions you make from an estimate. We do not limit liability for death or personal injury caused by negligence, fraud, or any right a consumer law says we cannot limit.",
      },
      {
        heading: "Law",
        body: "These terms use the laws of Finland, except where the consumer law where you live gives you a right that cannot be waived. You can delete the account in Settings under Privacy & data.",
      },
    ],
  },
  support: {
    title: "Support",
    updated: "24 November 2026",
    sections: [
      {
        heading: "On this device",
        body: "Logs and your profile stay on the device. If you created an account, a private copy is also stored for that sign-in. This screen cannot reset that account from the website.",
      },
      {
        heading: "Delete everything",
        body: "Open Settings, then Privacy & data, then Delete my account and all data. That removes the on-device copy and the signed-in account record. You can also email gooddy.wellness@gmail.com and ask for the account copy to be deleted.",
      },
      {
        heading: "Contact",
        body: "Email gooddy.wellness@gmail.com. Do not send health details you are not comfortable sharing. We cannot see logs that never left your device.",
      },
    ],
  },
} as const;

export type LegalKind = keyof typeof LEGAL;
