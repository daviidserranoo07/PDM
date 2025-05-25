import { CategoryProvider } from "@/context/CategoryProvider";
import { Stack } from "expo-router";
import '../global.css';

export default function RootLayout() {
  return (
    <CategoryProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            title: "Mi Título Personalizado"
          }}
        />
      </Stack>
    </CategoryProvider>
  );
}
