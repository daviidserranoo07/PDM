import { View, ScrollView, Text } from "react-native";
import "../../global.css";
import React, { useState, useEffect, useCallback } from "react";
import Card from "../../components/ui/Card";
import TabMenu from "../../components/TabMenu";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  date: Date;
  location: string;
  priority: string;
}

// Configurar las notificaciones (pon esto fuera del componente)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Index() {
  const [normal, setNormal] = useState([]);
  const [urgent, setUrgent] = useState([]);
  const [activeTab, setActiveTab] = useState("Urgente");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "Urgente") {
      setTasks(urgent);
    } else {
      setTasks(normal);
    }
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      console.log("Componente recibió foco");
      const init = async () => {
        await loadTasks();
        await obtenerUbicacionActual();
      };
      init();
    }, [])
  );

  // Pedir permisos de notificaciones (añade esto al inicio del componente)
  useEffect(() => {
    async function requestPermissions() {
      const { status: notificationStatus } =
        await Notifications.requestPermissionsAsync();
      if (notificationStatus !== "granted") {
        alert("Necesitamos permisos de notificación");
      }
    }
    requestPermissions();
  }, []);

  //Función para obtener las tareas del async storage
  const loadTasks = async () => {
    try {
      console.log("Cargando tareas...");
      const storedTasks = await AsyncStorage.getItem("tasks");
      if (storedTasks) {
        const allTasks = JSON.parse(storedTasks);
        console.log("Tareas cargadas:", allTasks);

        const urgentTasks = allTasks.filter(
          (task) => task.priority === "urgent"
        );
        const normalTasks = allTasks.filter(
          (task) => task.priority === "normal"
        );

        console.log("Tareas urgentes:", urgentTasks.length);
        console.log("Tareas normales:", normalTasks.length);

        setUrgent(urgentTasks);
        setNormal(normalTasks);
      }
    } catch (error) {
      console.error("Error cargando tareas:", error);
    }
  };

  // Función para marcar tarea como completada
  const toggleTaskComplete = async (taskId: string) => {
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
  const deleteTask = async (taskId: string) => {
    try {
      const updatedTasks = tasks.filter((task: any) => task.id !== taskId);
      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const obtenerUbicacionActual = async () => {
    try {
      console.log("Obteniendo ubicación...");
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMsg("Permiso de ubicación denegado");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });
      console.log("Ubicación obtenida:", currentLocation);

      const nearbyTasks = urgent.filter((task: Task) => {
        if (task?.location?.coords) {
          const distance = getDistanceInMeters(
            currentLocation.coords.latitude,
            currentLocation.coords.longitude,
            task.location.coords.latitude,
            task.location.coords.longitude
          );
          console.log(`Distancia a tarea urgente ${task.title}:`, distance);
          return distance <= 500;
        }
        return false;
      });

      const nearbyTasksNormal = normal.filter((task) => {
        if (task?.location?.coords) {
          const distance = getDistanceInMeters(
            currentLocation.coords.latitude,
            currentLocation.coords.longitude,
            task.location.coords.latitude,
            task.location.coords.longitude
          );
          console.log(`Distancia a tarea normal ${task.title}:`, distance);
          return distance <= 500;
        }
        return false;
      });

      console.log("Tareas cercanas urgentes:", nearbyTasks.length);
      console.log("Tareas cercanas normales:", nearbyTasksNormal.length);

      // Si hay tareas cercanas, enviar notificación
      if (nearbyTasks.length > 0 || nearbyTasksNormal.length > 0) {
        console.log("Enviando notificación...");
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "¡Tareas cercanas!",
              body: `Tienes ${
                nearbyTasks.length + nearbyTasksNormal.length
              } tareas cerca de ti`,
            },
            trigger: null,
          });
          console.log("Notificación enviada");
        } catch (notificationError) {
          console.error("Error enviando notificación:", notificationError);
        }
      }

      // Actualizar estado con las tareas cercanas
      setTasks([...nearbyTasks, ...nearbyTasksNormal]);
      console.log("Estado actualizado con tareas cercanas");
    } catch (error) {
      console.error("Error en obtenerUbicacionActual:", error);
    }
  };

  useEffect(() => {
    if (tasks.length > 0) {
      console.log("Tareas:", tasks);
    }
  }, [tasks]);

  // Función para calcular distancia entre dos puntos en metros
  const getDistanceInMeters = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371e3; // Radio de la tierra en metros
    const φ1 = (lat1 * Math.PI) / 180; // φ, λ en radianes
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // en metros
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
                  task={task}
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
