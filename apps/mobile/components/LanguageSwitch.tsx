import { type Locale } from "@orion/i18n";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

export function LanguageSwitch() {
  const { t, i18n } = useTranslation();
  const current = (i18n.language?.startsWith("nl") ? "nl" : "en") as Locale;

  function setLocale(locale: Locale) {
    void i18n.changeLanguage(locale);
  }

  return (
    <View className="mt-6 flex-row items-center gap-2">
      <Text className="text-sm text-muted">{t("home.language")}</Text>
      {(["en", "nl"] as const).map((locale) => {
        const active = current === locale;
        return (
          <Pressable
            key={locale}
            onPress={() => setLocale(locale)}
            className={`rounded-md px-3 py-2 ${active ? "bg-accent" : "border border-border"}`}
          >
            <Text className={`text-xs font-medium ${active ? "text-background" : "text-foreground"}`}>
              {t(`language.${locale}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
