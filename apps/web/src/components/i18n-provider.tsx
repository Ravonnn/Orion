"use client";

import { createI18n, type Locale } from "@orion/i18n";
import { useEffect, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";

const i18n = createI18n("en");

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const stored = window.localStorage.getItem("orion.locale") as Locale | null;
    if (stored === "en" || stored === "nl") {
      void i18n.changeLanguage(stored);
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
