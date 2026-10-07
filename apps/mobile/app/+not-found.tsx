import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View className="flex-1 items-center justify-center bg-background px-5">
        <Text className="text-xl font-semibold text-foreground">Screen not found</Text>
        <Link href="/" className="mt-4 text-accent">
          Go home
        </Link>
      </View>
    </>
  );
}
