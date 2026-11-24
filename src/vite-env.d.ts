/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_ADMOB_IOS_BANNER?: string;
  readonly VITE_ADMOB_ANDROID_BANNER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
