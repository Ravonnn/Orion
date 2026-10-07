import { SymbolView } from "expo-symbols";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#141820" },
        headerTintColor: "#F4F6FA",
        tabBarStyle: {
          backgroundColor: "#141820",
          borderTopColor: "#2A3344",
        },
        tabBarActiveTintColor: "#3DDC97",
        tabBarInactiveTintColor: "#9AA3B5",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("nav.home"),
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "house.fill", android: "home", web: "home" }}
              tintColor={color}
              size={26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="recents"
        options={{
          title: t("nav.recents"),
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "clock.fill", android: "schedule", web: "schedule" }}
              tintColor={color}
              size={26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="playlists"
        options={{
          title: t("nav.playlists"),
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "music.note.list", android: "queue_music", web: "queue_music" }}
              tintColor={color}
              size={26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="charts"
        options={{
          title: t("nav.charts"),
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "chart.bar.fill", android: "bar_chart", web: "bar_chart" }}
              tintColor={color}
              size={26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: t("nav.friends"),
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "person.2.fill", android: "group", web: "group" }}
              tintColor={color}
              size={26}
            />
          ),
        }}
      />
    </Tabs>
  );
}
