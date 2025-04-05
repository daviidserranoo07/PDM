import { Stack } from "expo-router";
import "../global.css";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RootLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)/Create" />
        <Stack.Screen
          name="task-modal"
          options={{
            presentation: "modal",
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="location-modal"
          options={{
            presentation: "transparentModal",
            animation: "fade",
            contentStyle: {
              backgroundColor: "transparent",
            },
          }}
        />
      </Stack>
    </View>
  );
}
