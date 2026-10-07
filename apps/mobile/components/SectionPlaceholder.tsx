import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { LanguageSwitch } from "@/components/LanguageSwitch";

type SectionKey = "home" | "recents" | "playlists" | "charts" | "friends";

export function SectionPlaceholder({
  section,
  showLanguageSwitch = false,
}: {
  section: SectionKey;
  showLanguageSwitch?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-background px-5 pt-4">
      <Text className="text-3xl font-semibold text-foreground">{t(`${section}.title`)}</Text>
      <Text className="mt-4 text-base leading-6 text-muted">{t(`${section}.placeholder`)}</Text>
      {showLanguageSwitch ? <LanguageSwitch /> : null}
    </View>
  );
}
