import { View, ScrollView, Text } from "react-native";
import "../../global.css";
import React, { useState, useEffect, useCallback } from "react";
import Card from "../../components/ui/Card";
import TabMenu from "../../components/TabMenu";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";

export default function Index() {
  const [normal, setNormal] = useState([]);
  const [urgent, setUrgent] = useState([]);
  const [currentTask, setCurrentTask] = useState([]);
  const [activeTab, setActiveTab] = useState("Urgente");
  const [tasks, setTasks] = useState([]);

  const handleDelete = (id: number) => {
    setNormal(normal.filter((task: any) => task.id !== id));
    setUrgent(urgent.filter((task: any) => task.id !== id));
  };

  useEffect(() => {
    if (activeTab === "Urgente") {
      setCurrentTask(urgent);
    } else {
      setCurrentTask(normal);
    }
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks");
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        // Ordenar por fecha de creación (más recientes primero)
        parsedTasks.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  // Función para marcar tarea como completada
  const toggleTaskComplete = async (taskId: number) => {
    try {
      const updatedTasks = tasks.map((task: any) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
      setTasks(updatedTasks as never[]);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Función para eliminar tarea
  const deleteTask = async (taskId: number) => {
    try {
      const updatedTasks = tasks.filter((task: any) => task.id !== taskId);
      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <View className="flex-1 h-screen bg-white">
      <View className="px-4 pt-4 mt-5">
        <TabMenu
          options={["Urgente", "Tareas"]}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </View>
      <ScrollView
        horizontal
        pagingEnabled
        className="w-full h-full relative"
        showsHorizontalScrollIndicator={false}
      >
        {/* Primera página - Urgentes */}
        <View className="w-screen h-screen px-8">
          <Text className="text-2xl font-bold p-2">{activeTab}</Text>
          <View className="flex-col w-full h-full items-center pb-32 bg-white p-2">
            <ScrollView className="w-full h-full mb-4">
              {tasks.map((task) => (
                <Card
                  key={task.id}
                  title={task.title}
                  description={task.description}
                  completed={task.completed}
                  onComplete={() => toggleTaskComplete(task.id)}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
