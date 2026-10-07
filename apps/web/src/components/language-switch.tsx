"use client";

import { type Locale } from "@orion/i18n";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function LanguageSwitch() {
  const { t, i18n } = useTranslation();
  const current = (i18n.language?.startsWith("nl") ? "nl" : "en") as Locale;

  function setLocale(locale: Locale) {
    void i18n.changeLanguage(locale);
    window.localStorage.setItem("orion.locale", locale);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted">{t("home.language")}</span>
      <Button
        type="button"
        size="sm"
        variant={current === "en" ? "default" : "outline"}
        onClick={() => setLocale("en")}
      >
        {t("language.en")}
      </Button>
      <Button
        type="button"
        size="sm"
        variant={current === "nl" ? "default" : "outline"}
        onClick={() => setLocale("nl")}
      >
        {t("language.nl")}
      </Button>
    </div>
  );
}
