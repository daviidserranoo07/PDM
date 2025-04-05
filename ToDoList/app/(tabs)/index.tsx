import { View, ScrollView, Text, Dimensions, Pressable } from "react-native";
import "../../global.css";
import React, { useState, useEffect, useCallback, useRef } from "react";
import TabMenu from "../../components/TabMenu";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import * as Notifications from "expo-notifications";
import PageTasks from "../../components/ui/PageTasks";
import Task from "../../models/Task";
import useLocation from "../../hooks/useLocation";
import {Switch} from 'react-native';

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

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Index() {
  const [activeTab, setActiveTab] = useState("Urgente");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [tasksCompleted, setTasksCompleted] = useState<Task[]>([]);
  const [allTasksCompleted, setAllTasksCompleted] = useState<Task[]>([]);
  const scrollViewRef = useRef(null);
  const screenWidth = Dimensions.get("window").width;
  const [showCompleted, setShowCompleted] = useState(false);
  const { location, obtenerUbicacion, isLoading} = useLocation();
  const [isEnabled, setIsEnabled] = useState(false);
  const init = async () => {
    await loadTasks();
  };

/*
  useEffect(() => {
    const clear = (async () => {
      await AsyncStorage.clear();
    })
    clear();
  },[]);*/

  const obtenerTareasCercanas = async () => {
    try {
      console.log("Obteniendo ubicación...");
      if(!location && !isLoading) {
       await obtenerUbicacion();
      }
      console.log("Ubicación obtenida:", location);

      //Si tenemos ubicación actual entonces obtenemos las tareas cercanas, en caso de que no nada
      let nearbyTasks = [] as Task[];
      if(location){
          nearbyTasks = (await getNearbyTasks(allTasks, location)) || [];
      }

      console.log("Tareas cercanas urgentes:", nearbyTasks.length);

        // Si hay tareas cercanas, enviar notificación
        if (nearbyTasks.length > 0) {
          console.log("Enviando notificación...");
          try {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "¡Tareas cercanas!",
                body: `Tienes ${
                    nearbyTasks.length
                } tareas cerca de ti`,
              },
              trigger: null,
            });
            console.log("Notificación de cercanas enviada");

            const doItNow = nearbyTasks.filter((task: Task) => {
              const timeToStart = (new Date(task.date).getTime() - Date.now()) / (60 * 1000); // en minutos
              console.log(`Minutes to start: ${timeToStart}`);
              return timeToStart <= 30 && timeToStart >= 0;
            });

            await doItNow.map(async (task: Task) => {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: `¡Se te acaba el tiempo de ${task.title}!`,
                  body: `Tienes que empezar ya la tarea ${task.title}`,
                },
                trigger: null,
              });
            });
          } catch (notificationError) {
            console.error("Error enviando notificación:", notificationError);
          }
        }

        console.log("nearbyTasks", nearbyTasks);

        // Actualizar estado con las tareas cercanas
        setTasks(nearbyTasks);
        console.log("Estado actualizado con tareas cercanas");
    } catch (error) {
      console.error("Error en obtenerUbicacionActual:", error);
    }
  };

  const getNearbyTasks = async (tasks: Task[], currentLocation: Location.LocationObject) => {
  // Filtrar tareas cercanas
  const nearbyTasks = tasks.filter((task: Task) => {
    // Verificar que la tarea tenga coordenadas válidas
    if (task?.location?.coords) {
      console.log(task.location.coords);
      const distance = getDistanceInMeters(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
          task.location.coords.latitude,
          task.location.coords.longitude
      );
      console.log(`Distancia a tarea urgente ${task.title}:`, distance);
      return distance <= 500; // Devolvemos true si está dentro del rango de 500 metros
    }
    return false; // Si no tiene coordenadas, no se incluye en el array
  });

  console.log("Tareas cercanas calculadas:", nearbyTasks.length);
  return nearbyTasks; // Devolvemos el array filtrado
};

  //Función para obtener las tareas del async storage
  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks");
      const storedTasksCompleted = await AsyncStorage.getItem("tasksCompleted");
      if (storedTasks) {
        const allTasks = JSON.parse(storedTasks);
        const urgentTasks = allTasks.filter(
          (task: Task) => task.priority === "Urgente"
        );

        const normalTasks = allTasks.filter(
          (task: Task) => task.priority === "Normal" && !task.completed
        );

        setAllTasks([...normalTasks, ...urgentTasks]);
        setTasks(activeTab === "Urgente" ? urgentTasks : normalTasks);
      }

      if (storedTasksCompleted) {
        const allTasksCompleted = JSON.parse(storedTasksCompleted);

        const urgentCompletedTasks = allTasksCompleted.filter(
          (task: Task) => task.priority === "Urgente"
        );

        const normalCompletedTasks = allTasksCompleted.filter(
          (task: Task) => task.priority === "Normal"
        );

        setAllTasksCompleted([
          ...normalCompletedTasks,
          ...urgentCompletedTasks,
        ]);
        setTasksCompleted(
          activeTab === "Urgente" ? urgentCompletedTasks : normalCompletedTasks
        );
      }
    } catch (error) {
      console.error("Error cargando tareas:", error);
    }
  };

  // Función para marcar tarea como completada
  const toggleTaskComplete = async (task: Task) => {
    try {
      let currentTask = task;
      let newTasks = [];
      let newTasksCompleted = [];
      if (task) {
        currentTask.completed = !currentTask.completed;
        //Si la tarea está completada, se agrega a tasksCompleted y se elimina de tasks
        if (task.completed) {
          newTasksCompleted = [...allTasksCompleted, currentTask];
          newTasks = allTasks.filter((t: Task) => t.id !== currentTask.id);
          setAllTasksCompleted(newTasksCompleted);
          setAllTasks(newTasks);
        } else {
          //Si la tarea no está completada, se agrega a tasks y se elimina de tasksCompleted
          newTasks = [...allTasks, currentTask];
          newTasksCompleted = tasksCompleted.filter(
            (t: Task) => t.id !== currentTask.id
          );
          setAllTasks(newTasks);
          setAllTasksCompleted(newTasksCompleted);
        }
        setTasksCompleted(
          activeTab === "Urgente"
            ? newTasksCompleted.filter(
                (task: Task) => task.priority === "Urgente"
              )
            : newTasksCompleted.filter(
                (task: Task) => task.priority === "Normal"
              )
        );
        setTasks(
          activeTab === "Urgente"
            ? newTasks.filter((task: Task) => task.priority === "Urgente")
            : newTasks.filter((task: Task) => task.priority === "Normal")
        );
        await AsyncStorage.setItem("tasks", JSON.stringify(newTasks));
        await AsyncStorage.setItem(
          "tasksCompleted",
          JSON.stringify(newTasksCompleted)
        );
      }
    } catch (error) {
      console.error("Error al actualizar la tarea:", error);
    }
  };

  // Función para eliminar tarea
  const deleteTask = async (deletedTask: Task) => {
    try {
      console.log("Eliminando tarea:", deletedTask);
      if (deletedTask.completed) {
        const updatedTasks = allTasksCompleted.filter(
          (task: Task) => task.id !== deletedTask.id
        );
        await AsyncStorage.setItem(
          "tasksCompleted",
          JSON.stringify([...allTasksCompleted, ...updatedTasks])
        );
        setAllTasksCompleted(updatedTasks);
        setTasksCompleted(
          activeTab === "Urgente"
            ? updatedTasks.filter((task: Task) => task.priority === "Urgente")
            : updatedTasks.filter((task: Task) => task.priority === "Normal")
        );
      } else {
        const updatedTasks = allTasks.filter(
          (task: Task) => task.id !== deletedTask.id
        );
        console.log("Tareas actualizadas:", updatedTasks);
        console.log("AllTasks", allTasks);
        await AsyncStorage.setItem(
          "tasks",
          JSON.stringify(updatedTasks)
        );
        setAllTasks(updatedTasks);
        setTasks(
          activeTab === "Urgente"
            ? updatedTasks.filter((task: Task) => task.priority === "Urgente")
            : updatedTasks.filter((task: Task) => task.priority === "Normal")
        );
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const currentTab = Math.round(scrollX / screenWidth);
    const newTab = currentTab === 0 ? "Urgente" : "Tareas";
    setActiveTab(newTab);
    setTasks(
      newTab === "Urgente"
        ? allTasks.filter((task: Task) => task.priority === "Urgente")
        : allTasks.filter((task: Task) => task.priority === "Normal")
    );
    setTasksCompleted(
      newTab === "Urgente"
        ? allTasksCompleted.filter((task: Task) => task.priority === "Urgente")
        : allTasksCompleted.filter((task: Task) => task.priority === "Normal")
    );
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    setTasks(
      tab === "Urgente"
        ? tasks.filter((task: Task) => task.priority === "Urgente")
        : tasks.filter((task: Task) => task.priority === "Normal")
    );
    setTasksCompleted(
      tab === "Urgente"
        ? allTasksCompleted.filter((task: Task) => task.priority === "Urgente")
        : allTasksCompleted.filter((task: Task) => task.priority === "Normal")
    );
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: tab === "Urgente" ? 0 : screenWidth,
        animated: true,
      });
    }
  };

  const toggleSwitch = async () => {
    const showAll = !isEnabled;
    console.log(showAll);
    setIsEnabled(showAll);
  }


  useFocusEffect(
      useCallback(() => {
        init();
      }, [activeTab, isEnabled])
  );

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if(activeTab === "Urgente" && !isEnabled){
      obtenerTareasCercanas();
    }
  },[activeTab, location, isEnabled, tasksCompleted]);

  //Función para pedir permisos de notificaciones
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

  return (
      <>
        {isLoading ?
            (<View className="flex-1 justify-center items-center">
              <Text>{"Cargando tareas de la ubicación actual..."}</Text>
            </View>)
            : (
                <View className="flex-1 h-screen bg-white">
                  <View className="px-4 pt-4 mt-5">
                    <TabMenu
                        options={["Urgente", "Tareas"]}
                        activeTab={activeTab}
                        setActiveTab={handleTabPress}
                        defaultTab="Urgente"
                    />
                    {activeTab === "Urgente" && <View className="flex-row justify-end items-center gap-2 mt-4 w-full">
                      <Text>
                        Mostrar todas las tareas:
                      </Text>
                      <Switch
                          trackColor={{false: '#767577', true: '#81b0ff'}}
                          thumbColor={isEnabled ? '#3342ff' : '#f4f3f4'}
                          ios_backgroundColor="#3e3e3e"
                          onValueChange={toggleSwitch}
                          value={isEnabled}
                      />
                    </View>}
                  </View>

                  <ScrollView
                      ref={scrollViewRef}
                      horizontal
                      pagingEnabled
                      className="w-full h-full relative"
                      showsHorizontalScrollIndicator={false}
                      onScroll={handleScroll}
                      scrollEventThrottle={30}
                  >
                    {/* Primera página - Urgentes */}
                    <PageTasks
                        activeTab={activeTab}
                        tasks={tasks}
                        tasksCompleted={tasksCompleted}
                        showCompleted={showCompleted}
                        setShowCompleted={setShowCompleted}
                        toggleTaskComplete={toggleTaskComplete}
                        deleteTask={deleteTask}
                    />

                    {/* Segunda página - Tareas normales */}
                    <PageTasks
                        activeTab={activeTab}
                        tasks={tasks}
                        tasksCompleted={tasksCompleted}
                        showCompleted={showCompleted}
                        setShowCompleted={setShowCompleted}
                        toggleTaskComplete={toggleTaskComplete}
                        deleteTask={deleteTask}
                    />
                  </ScrollView>
                </View>
            )
        }
      </>
  );
}
