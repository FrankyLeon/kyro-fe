import { cookies } from "next/headers";
import { en } from "@/i18n/messages/en";
import { mn } from "@/i18n/messages/mn";
import { createTranslator, type AppMessages } from "@/i18n/translate";
import { intlLocale, isLocale, LOCALE_COOKIE, type Locale } from "@/i18n/locale";

const dictionaries: Record<Locale, AppMessages> = { en, mn };

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const value = jar.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : "en";
}

export async function getI18n() {
  const locale = await getLocale();
  const messages = dictionaries[locale];
  return {
    locale,
    intl: intlLocale(locale),
    messages,
    t: createTranslator(messages),
  };
}
