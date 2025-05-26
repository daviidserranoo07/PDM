import { CategoryProvider } from "@/context/CategoryProvider";
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from "expo-router";
import '../global.css';

export default function RootLayout() {
  return (
    <CategoryProvider>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="index"
          options={{
            title: "Inicio",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="categorias"
          options={{
            title: "Categorías",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </CategoryProvider>
  );
}
