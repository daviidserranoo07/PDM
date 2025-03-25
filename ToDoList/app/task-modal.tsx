import { View, Text, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TaskModal() {
  const { title, description } = useLocalSearchParams();

  return (
    <View className="flex-1 bg-black/50 justify-center items-center p-4">
      <View className="w-full bg-white rounded-2xl p-6 gap-4">
        {/* Header con título y botón cerrar */}
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold">{title}</Text>
          <Pressable onPress={() => router.back()}>
            <MaterialCommunityIcons name="close" size={24} color="black" />
          </Pressable>
        </View>

        {/* Contenido */}
        <View className="gap-4">
          <View>
            <Text className="text-gray-500">Descripción:</Text>
            <Text className="text-lg">{description}</Text>
          </View>

          {/* Puedes añadir más información aquí */}
          <View>
            <Text className="text-gray-500">Estado:</Text>
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color="green"
              />
              <Text className="text-lg">Pendiente</Text>
            </View>
          </View>
        </View>

        {/* Botones de acción */}
        <View className="flex-row gap-4 mt-4">
          <Pressable
            className="flex-1 bg-blue-500 p-3 rounded-xl"
            onPress={() => router.back()}
          >
            <Text className="text-white text-center font-bold">Completar</Text>
          </Pressable>
          <Pressable
            className="flex-1 bg-red-500 p-3 rounded-xl"
            onPress={() => router.back()}
          >
            <Text className="text-white text-center font-bold">Eliminar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
