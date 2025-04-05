import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as Crypto from "expo-crypto";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  date: Date;
  location: Location;
  priority: string;
  duration: number;
}

interface Location {
  coords: {
    latitude: number;
    longitude: number;
  };
  address: string;
}

export default function CreateTask() {
  const params = useLocalSearchParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [location, setLocation] = useState<Location | null>(
    params.location ? JSON.parse(params.location as string) : null
  );
  const [priority, setPriority] = useState("Normal");
  const [duration, setDuration] = useState("");
  const handleSubmit = async () => {
    try {
      const newTask: Task = {
        id: Crypto.randomUUID(),
        title,
        description,
        duration: parseInt(duration),
        location: location || {
          coords: {
            latitude: 0,
            longitude: 0,
          },
          address: "",
        },
        priority,
        completed: false,
        date: date,
      };

      //Obtenemos las tareas ya existentes del async storage
      const existingTasks = await AsyncStorage.getItem("tasks");
      const tasks = existingTasks ? JSON.parse(existingTasks) : [];

      //Añadimos la nueva tarea a las existentes
      const updatedTasks = [...tasks, newTask];

      //Guardamos tareas en AsyncStorage
      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));

      //Limpiamos el formulario
      setTitle("");
      setDescription("");
      setLocation(null);
      setPriority("Normal");

      //Volvemos a la pantalla anterior
      router.back();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  // Validamos que la tarea tenga un título
  const isFormValid = () => {
    return title.trim() !== "";
  };

  //Función para seleccionar la fecha del evento
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Mantener la hora actual al cambiar la fecha
      const newDate = new Date(selectedDate);
      newDate.setHours(date.getHours(), date.getMinutes());
      setDate(newDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      // Mantener la fecha actual al cambiar la hora
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setDate(newDate);
    }
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

        {/* Duración */}
        <View className="gap-2">
          <Text className="text-lg font-medium text-gray-700">Duración</Text>
          <TextInput
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            placeholder="Duración de la tarea"
            className="w-full p-3 border border-gray-300 rounded-xl"
            textAlignVertical="top"
          />
        </View>

        {/* Fecha y hora */}
        <View className="gap-2">
          <Text className="text-lg font-medium text-gray-700">
            Fecha y hora
          </Text>
          <View className="flex-row gap-2">
            {/* Selector de Fecha */}
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="flex-1 p-3 border border-gray-300 rounded-xl"
            >
              <Text className="text-gray-700">{date.toLocaleDateString()}</Text>
            </Pressable>

            {/* Selector de Hora */}
            <Pressable
              onPress={() => setShowTimePicker(true)}
              className="flex-1 p-3 border border-gray-300 rounded-xl"
            >
              <Text className="text-gray-700">
                {date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </Pressable>
          </View>

          {/* DatePicker para Fecha */}
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              onChange={handleDateChange}
              display={Platform.OS === "ios" ? "spinner" : "default"}
            />
          )}

          {/* DatePicker para Hora */}
          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              onChange={handleTimeChange}
              display={Platform.OS === "ios" ? "spinner" : "default"}
            />
          )}
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
              onPress={() => setPriority("Normal")}
              className={`flex-1 p-3 rounded-xl border ${
                priority === "Normal"
                  ? "bg-blue-500 border-blue-500"
                  : "border-gray-300"
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  priority === "Normal" ? "text-white" : "text-gray-700"
                }`}
              >
                Normal
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setPriority("Urgente")}
              className={`flex-1 p-3 rounded-xl border ${
                priority === "Urgente"
                  ? "bg-red-500 border-red-500"
                  : "border-gray-300"
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  priority === "Urgente" ? "text-white" : "text-gray-700"
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
