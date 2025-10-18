/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HF_TOKEN?: string;
  readonly VITE_DEFAULT_MODEL?: string;
  readonly VITE_BASE_URL?: string;
  readonly VITE_DEFAULT_MAX_TOKENS?: string;
  readonly VITE_DEFAULT_TEMPERATURE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
