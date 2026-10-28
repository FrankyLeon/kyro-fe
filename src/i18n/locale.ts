export const LOCALES = ["en", "mn"] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_COOKIE = "kyro_locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "mn";
}

export function intlLocale(locale: Locale): string {
  return locale === "mn" ? "mn-MN" : "en-US";
}
