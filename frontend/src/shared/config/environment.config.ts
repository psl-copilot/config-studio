// Environment configuration
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string;
    readonly VITE_APP_TITLE?: string;
    readonly VITE_APP_ENV?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3011',
  APP_TITLE: import.meta.env.VITE_APP_TITLE ?? 'Tazama Config Studio',
  APP_ENV: import.meta.env.VITE_APP_ENV ?? 'development',
} as const;
