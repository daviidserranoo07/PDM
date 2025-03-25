import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CreateTask() {
  const params = useLocalSearchParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(
    params.location ? JSON.parse(params.location as string) : null
  );
  const [priority, setPriority] = useState("normal"); // 'normal' o 'urgent'

  const handleSubmit = async () => {
    try {
      // Crear nueva tarea
      const newTask = {
        id: Date.now().toString(), // ID único
        title,
        description,
        location,
        priority,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      // Obtener tareas existentes
      const existingTasks = await AsyncStorage.getItem("tasks");
      const tasks = existingTasks ? JSON.parse(existingTasks) : [];

      // Añadir nueva tarea
      const updatedTasks = [...tasks, newTask];

      // Guardar en AsyncStorage
      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));

      // Limpiar formulario y volver atrás
      setTitle("");
      setDescription("");
      setLocation(null);
      setPriority("normal");

      router.back();
    } catch (error) {
      console.error("Error saving task:", error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  // Validación antes de guardar
  const isFormValid = () => {
    return title.trim() !== "" && description.trim() !== "";
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="gap-6">
        {/* Título */}
        <View className="gap-2">
          <Text className="text-lg font-medium text-gray-700">Título</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Nombre de la tarea"
            className="w-full p-3 border border-gray-300 rounded-xl"
          />
        </View>

        {/* Descripción */}
        <View className="gap-2">
          <Text className="text-lg font-medium text-gray-700">Descripción</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe la tarea"
            multiline
            numberOfLines={4}
            className="w-full p-3 border border-gray-300 rounded-xl"
            textAlignVertical="top"
          />
        </View>

        {/* Fecha */}
        <View className="gap-2">
          <Text className="text-lg font-medium text-gray-700">Fecha</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe la tarea"
            multiline
            numberOfLines={4}
            className="w-full p-3 border border-gray-300 rounded-xl"
            textAlignVertical="top"
          />
        </View>

        {/* Ubicación */}
        <View className="gap-2">
          <Text className="text-lg font-medium text-gray-700">Ubicación</Text>
          <Pressable
            className="flex-row items-center w-full p-3 border border-gray-300 rounded-xl"
            onPress={() => router.push("/location-modal")}
          >
            <MaterialCommunityIcons
              name="map-marker"
              size={24}
              color="#4b5563"
            />
            <Text className="ml-2 text-gray-500">
              {location ? location.address : "Añadir ubicación"}
            </Text>
          </Pressable>
        </View>

        {/* Prioridad */}
        <View className="gap-2">
          <Text className="text-lg font-medium text-gray-700">Prioridad</Text>
          <View className="flex-row gap-4">
            <Pressable
              onPress={() => setPriority("normal")}
              className={`flex-1 p-3 rounded-xl border ${
                priority === "normal"
                  ? "bg-blue-500 border-blue-500"
                  : "border-gray-300"
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  priority === "normal" ? "text-white" : "text-gray-700"
                }`}
              >
                Normal
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setPriority("urgent")}
              className={`flex-1 p-3 rounded-xl border ${
                priority === "urgent"
                  ? "bg-red-500 border-red-500"
                  : "border-gray-300"
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  priority === "urgent" ? "text-white" : "text-gray-700"
                }`}
              >
                Urgente
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Botón de guardar */}
        <Pressable
          onPress={handleSubmit}
          disabled={!isFormValid()}
          className={`w-full p-4 rounded-xl mt-4 ${
            isFormValid() ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          <Text className="text-white text-center font-bold text-lg">
            Guardar Tarea
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
