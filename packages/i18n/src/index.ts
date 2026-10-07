import i18n, { type i18n as I18nInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import nl from "./locales/nl.json";

export const supportedLocales = ["en", "nl"] as const;
export type Locale = (typeof supportedLocales)[number];

export const resources = {
  en: { translation: en },
  nl: { translation: nl },
} as const;

export type TranslationResources = typeof resources;

let initialized = false;

export function createI18n(locale: Locale = "en"): I18nInstance {
  if (!initialized) {
    void i18n.use(initReactI18next).init({
      resources,
      lng: locale,
      fallbackLng: "en",
      interpolation: { escapeValue: false },
      compatibilityJSON: "v4",
    });
    initialized = true;
  } else if (i18n.language !== locale) {
    void i18n.changeLanguage(locale);
  }
  return i18n;
}

export { en, nl };
export default i18n;
