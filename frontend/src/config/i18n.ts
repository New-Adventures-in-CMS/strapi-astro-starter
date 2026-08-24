// frontend/src/config/i18n.ts
// PREDISPOSTO ma non attivo. Per attivare il multilingua vedi SETUP.md → "i18n".

export const i18n = {
  defaultLocale: "it",
  /** Aggiungi qui altre lingue (es. "en") per attivare il multilingua */
  locales: ["it"] as const,
  /** Se true, la lingua di default NON ha prefisso nell'URL */
  prefixDefaultLocale: false,
} as const;

export type Locale = (typeof i18n.locales)[number];
