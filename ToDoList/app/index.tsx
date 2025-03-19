import { Text, View, ScrollView, Pressable } from "react-native";
import "../global.css";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { router } from "expo-router";
import Card from "../components/ui/Card";
const urgentTasks = [
  {
    id: 1,
    title: "Tarea 1",
    description: "Descripción de la tarea",
    completed: false,
  },
  {
    id: 2,
    title: "Tarea 2",
    description: "Descripción de la tarea",
    completed: false,
  },
  {
    id: 3,
    title: "Tarea 3",
    description: "Descripción de la tarea",
    completed: false,
  },
  {
    id: 4,
    title: "Tarea 4",
    description: "Descripción de la tarea",
    completed: false,
  },
  {
    id: 5,
    title: "Tarea 5",
    description: "Descripción de la tarea",
    completed: false,
  },
  {
    id: 6,
    title: "Tarea 6",
    description: "Descripción de la tarea",
    completed: false,
  },
  {
    id: 7,
    title: "Tarea 7",
    description: "Descripción de la tarea",
    completed: false,
  },
  {
    id: 8,
    title: "Tarea 8",
    description: "Descripción de la tarea",
    completed: false,
  },
];

const normalTasks = [
  {
    id: 1,
    title: "Tarea 1",
    description: "Descripción de la tarea",
    completed: false,
  },
];

export default function Index() {
  const [normal, setNormal] = useState(normalTasks);
  const [urgent, setUrgent] = useState(urgentTasks);

  const handleDelete = (id: number) => {
    setNormal(normal.filter((task) => task.id !== id));
    setUrgent(urgent.filter((task) => task.id !== id));
  };

  return (
    <ScrollView
      horizontal
      pagingEnabled
      className="w-full h-full relative"
      showsHorizontalScrollIndicator={false}
    >
      {/* Primera página - Urgentes */}
      <View className="w-screen h-full">
        <View className="flex-col w-full h-full items-center bg-white py-10 p-2">
          <Text className="text-2xl font-bold mb-4">Urgentes</Text>
          <ScrollView className="w-full h-full mb-4">
            {urgent.map((task) => (
              <Card
                key={task.id}
                title={task.title}
                description={task.description}
                completed={task.completed}
                onDelete={() => handleDelete(task.id)}
              />
            ))}
          </ScrollView>
        </View>
        <View className="absolute bottom-6 right-6">
          <Pressable onPress={() => router.push("/Create")}>
            <MaterialCommunityIcons name="plus" size={40} color="green" />
          </Pressable>
        </View>
      </View>

      {/* Segunda página - Normales */}
      <View className="w-screen h-full">
        <View className="flex-col w-full h-full items-center bg-white py-10 p-2">
          <Text className="text-2xl font-bold mb-4">Normales</Text>
          <ScrollView className="w-full h-full mb-4">
            {normal.map((task) => (
              <Card
                key={task.id}
                title={task.title}
                description={task.description}
                completed={task.completed}
                onDelete={() => handleDelete(task.id)}
              />
            ))}
          </ScrollView>
        </View>
        <View className="absolute bottom-6 right-6">
          <Pressable onPress={() => router.push("/Create")}>
            <MaterialCommunityIcons name="plus" size={40} color="green" />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
