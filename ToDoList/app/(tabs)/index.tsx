import {
  View,
  ScrollView,
  Text,
  Dimensions,
  Pressable,
  ActivityIndicator,
} from "react-native";
import "../../global.css";
import React, { useState, useEffect, useCallback, useRef } from "react";
import TabMenu from "../../components/TabMenu";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import PageTasks from "../../components/ui/PageTasks";
import Task from "../../models/Task";
import useLocation from "../../hooks/useLocation";
import { Switch } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Función para calcular distancia entre dos puntos en metros
const getDistanceInMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export default function Index() {
  const [activeTab, setActiveTab] = useState("Urgente");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [tasksCompleted, setTasksCompleted] = useState<Task[]>([]);
  const [allTasksCompleted, setAllTasksCompleted] = useState<Task[]>([]);
  const scrollViewRef = useRef(null);
  const screenWidth = Dimensions.get("window").width;
  const [showCompleted, setShowCompleted] = useState(false);
  const { location, obtenerUbicacion, isLoading, error } = useLocation();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const init = async () => {
    await loadTasks();
  };

  const obtenerTareasCercanas = async () => {
    try {
      setIsLoadingTasks(true);
      if (!location || error) {
        await obtenerUbicacion();
        if (error) {
          setIsLoadingTasks(false);
          return;
        }
      }

      if (!location) {
        setIsLoadingTasks(false);
        return;
      }

      //Obtenemos todas las tareas cercanas que sean urgentes
      const nearbyTasks = await getNearbyTasks(
        allTasks.filter((task) => task.priority === "Urgente"),
        location
      );

      if (activeTab === "Urgente") {
        if (isEnabled) {
          // Mostrar todas las tareas urgentes
          const urgentTasks = allTasks.filter(
            (task) => task.priority === "Urgente"
          );
          setTasks(urgentTasks);
        } else {
          setTasks(nearbyTasks);
          if (nearbyTasks.length > 0) {
            try {
              //Notificamos al usuario de que tiene tareas cercanas a su ubicación actual
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: "¡Tareas cercanas!",
                  body: `Tienes ${nearbyTasks.length} ${
                    nearbyTasks.length === 1
                      ? "tarea cercana"
                      : "tareas cercanas"
                  } que requieren tu atención`,
                },
                trigger: null,
              });
              const doItNow = nearbyTasks.filter((task: Task) => {
                if (task.duration > 0) {
                  const endTime = new Date(task.date).getTime();
                  const duration = task.duration || 0;

                  //Calculamos el momento en que deberia empezar la tarea
                  const startTime = endTime - duration * 60 * 1000;

                  //Calculamos los minutos que faltan de maximo para que se pueda empezar la tarea a tiempo
                  const timeToStart = (startTime - Date.now()) / (60 * 1000);

                  // Notificamos solo si faltan 30 minutos o menos
                  return timeToStart <= 30 && timeToStart >= 0;
                }
                return false;
              });

              doItNow.map(async (task: Task) => {
                const endTime = new Date(task.date).getTime();
                const duration = task.duration || 0;
                const startTime = endTime - duration * 60 * 1000;
                const timeToStart = (startTime - Date.now()) / (60 * 1000);

                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: `¡Necesitas empezar ${task.title}!`,
                    body: `Tienes ${timeToStart.toFixed(
                      0
                    )} minutos para empezar esta tarea que dura ${duration} minutos`,
                  },
                  trigger: null,
                });
              });
            } catch (notificationError) {
              console.error(
                "Error enviando notificaciones:",
                notificationError
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Error en obtenerTareasCercanas:", error);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const getNearbyTasks = async (
    tasks: Task[],
    currentLocation: Location.LocationObject
  ) => {
    // Filtrar tareas cercanas
    const nearbyTasks = tasks.filter((task: Task) => {
      if (task?.location?.coords) {
        const distance = getDistanceInMeters(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
          task.location.coords.latitude,
          task.location.coords.longitude
        );
        return distance <= 500; // Devolvemos true si la tarea esta a menos de 500 metros
      }
      return false; // Si no tiene coordenadas, no se incluye en el array
    });

    return nearbyTasks;
  };

  //Función para obtener las tareas del async storage
  const loadTasks = async () => {
    try {
      const storedTasks = (await AsyncStorage.getItem("tasks")) || [];
      console.log(
        "storedTasks",
        JSON.parse(storedTasks).filter(
          (task: Task) => task.priority === "Normal"
        )
      );
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

        //Si estamos en tab urgente y el switch esta activado, mostramos todas las urgentes
        if (activeTab === "Urgente" && isEnabled) {
          setTasks(urgentTasks);
        }
        //Si estamos en tab normal mostramos todas las normales
        if (activeTab !== "Urgente") {
          setTasks(normalTasks);
        }
      }

      if (storedTasksCompleted) {
        //Obtenemos todas las tareas completadas
        const allTasksCompleted = JSON.parse(storedTasksCompleted);

        //Obtenemos todas las tareas urgentes completadas
        const urgentCompletedTasks = allTasksCompleted.filter(
          (task: Task) => task.priority === "Urgente"
        );

        //Obtenemos todas las tareas normales completadas
        const normalCompletedTasks = allTasksCompleted.filter(
          (task: Task) => task.priority === "Normal"
        );

        //Actualizamos el estado de las tareas completadas
        setAllTasksCompleted([
          ...normalCompletedTasks,
          ...urgentCompletedTasks,
        ]);

        //Actualizamos el estado de las tareas completadas segun el estado actual del tab
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

        //Primero actualizamos el async storage con la tarea que cambio su estado
        if (task.completed) {
          newTasksCompleted = [...allTasksCompleted, currentTask];
          newTasks = allTasks.filter((t: Task) => t.id !== currentTask.id);
        } else {
          newTasks = [...allTasks, currentTask];
          newTasksCompleted = tasksCompleted.filter(
            (t: Task) => t.id !== currentTask.id
          );
        }

        await AsyncStorage.setItem("tasks", JSON.stringify(newTasks));
        await AsyncStorage.setItem(
          "tasksCompleted",
          JSON.stringify(newTasksCompleted)
        );

        //Actualizamos las tareas totales completadas y no completadas
        setAllTasksCompleted(newTasksCompleted);
        setAllTasks(newTasks);

        //Actualizamos las tareas completadas segun el tab
        const filteredCompleted =
          activeTab === "Urgente"
            ? newTasksCompleted.filter((t: Task) => t.priority === "Urgente")
            : newTasksCompleted.filter((t: Task) => t.priority === "Normal");
        setTasksCompleted(filteredCompleted);

        //Actualizamos las tareas no completadas segun el estado actual del tab
        if (activeTab === "Urgente") {
          if (!isEnabled) {
            //En modo cercanas, primero filtramos las tareas urgentes
            const urgentTasks = newTasks.filter(
              (t: Task) => t.priority === "Urgente"
            );
            //Luego actualizamos el estado con las tareas cercanas
            if (location) {
              const nearbyTasks = await getNearbyTasks(urgentTasks, location);
              setTasks(nearbyTasks);
            }
          } else {
            //Si el switch esta activado, mostramos todas las urgentes
            setTasks(newTasks.filter((t: Task) => t.priority === "Urgente"));
          }
        } else {
          //Si estamos en tab normal mostramos todas las normales
          setTasks(newTasks.filter((t: Task) => t.priority === "Normal"));
        }
      }
    } catch (error) {
      console.error("Error al actualizar la tarea:", error);
    }
  };

  // Función para eliminar tarea
  const deleteTask = async (deletedTask: Task) => {
    try {
      if (deletedTask.completed) {
        const updatedTasksCompleted = allTasksCompleted.filter(
          (task: Task) => task.id !== deletedTask.id
        );

        // Actualizar AsyncStorage
        await AsyncStorage.setItem(
          "tasksCompleted",
          JSON.stringify(updatedTasksCompleted)
        );

        // Actualizar estados
        setAllTasksCompleted(updatedTasksCompleted);
        setTasksCompleted(
          activeTab === "Urgente"
            ? updatedTasksCompleted.filter(
                (task: Task) => task.priority === "Urgente"
              )
            : updatedTasksCompleted.filter(
                (task: Task) => task.priority === "Normal"
              )
        );
      } else {
        const updatedTasks = allTasks.filter(
          (task: Task) => task.id !== deletedTask.id
        );

        // Actualizar AsyncStorage
        await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));

        // Actualizar estado global
        setAllTasks(updatedTasks);

        // Actualizar tareas visibles según el modo y tab
        if (activeTab === "Urgente") {
          if (!isEnabled) {
            // Si estamos en modo cercanas y hay ubicación
            if (location) {
              // Primero filtrar las tareas urgentes
              const urgentTasks = updatedTasks.filter(
                (t: Task) => t.priority === "Urgente"
              );
              // Luego obtener las cercanas del nuevo conjunto de tareas
              const nearbyTasks = await getNearbyTasks(urgentTasks, location);
              setTasks(nearbyTasks);
            }
          } else {
            // En modo todas las urgentes
            setTasks(
              updatedTasks.filter((t: Task) => t.priority === "Urgente")
            );
          }
        } else {
          // Para tareas normales
          setTasks(updatedTasks.filter((t: Task) => t.priority === "Normal"));
        }
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleScroll = useCallback(
    (event: any) => {
      const scrollX = event.nativeEvent.contentOffset.x;
      const currentTab = Math.round(scrollX / screenWidth);
      const newTab = currentTab === 0 ? "Urgente" : "Tareas";

      console.log(
        "allTasks",
        allTasks.filter((task: Task) => task.priority === "Normal")
      );

      // Solo proceder si el tab ha cambiado realmente
      if (newTab !== activeTab) {
        setActiveTab(newTab);

        if (newTab === "Urgente") {
          if (!isEnabled) {
            //Si estamos en modo cercanas, actualizamos las tareas cercanas
            console.log("Actualizando tareas cercanas...");
            obtenerTareasCercanas();
          } else {
            //Si no, mostramos todas las urgentes
            setTasks(
              allTasks.filter((task: Task) => task.priority === "Urgente")
            );
          }
        } else {
          //Si estamos en tab normal, mostramos todas las normales
          setTasks(allTasks.filter((task: Task) => task.priority === "Normal"));
        }

        setTasksCompleted(
          newTab === "Urgente"
            ? allTasksCompleted.filter(
                (task: Task) => task.priority === "Urgente"
              )
            : allTasksCompleted.filter(
                (task: Task) => task.priority === "Normal"
              )
        );
      }
    },
    [activeTab, isEnabled, allTasks, allTasksCompleted, obtenerTareasCercanas]
  );

  const toggleSwitch = async () => {
    const showAll = !isEnabled;
    setIsEnabled(showAll);
  };

  // Cargar tareas iniciales
  useFocusEffect(
    useCallback(() => {
      init();
    }, [])
  );

  //Manejamos cambios en la ubicación y el modo de visualización
  useEffect(() => {
    console.log("allTasks", allTasks);
    if (activeTab === "Urgente" && allTasks.length > 0) {
      if (!isEnabled) {
        obtenerTareasCercanas();
      } else {
        setTasks(allTasks.filter((task: Task) => task.priority === "Urgente"));
      }
    } else if (activeTab === "Tareas") {
      // Actualizar tareas normales cuando cambia allTasks
      setTasks(allTasks.filter((task: Task) => task.priority === "Normal"));
    }
  }, [location, isEnabled, allTasks, activeTab]);

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
      {isLoading || location === null ? (
        <View className="flex-1 justify-center items-center">
          <Text>{"Cargando tareas de la ubicación actual..."}</Text>
        </View>
      ) : (
        <View className="flex-1 h-screen bg-white">
          <View className="px-4 pt-4 mt-5">
            <TabMenu
              options={["Urgente", "Tareas"]}
              activeTab={activeTab}
              defaultTab="Urgente"
              setActiveTab={setActiveTab}
            />
            {activeTab === "Urgente" && (
              <View className="flex-row justify-end items-center gap-2 mt-4 w-full">
                <Text>
                  {isEnabled
                    ? "Mostrando todas las tareas"
                    : "Mostrando solo tareas cercanas"}
                </Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  thumbColor={isEnabled ? "#3342ff" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={toggleSwitch}
                  value={isEnabled}
                />
              </View>
            )}
          </View>

          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            className="w-full h-full relative"
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={100}
            onMomentumScrollEnd={handleScroll}
          >
            {/* Primera página - Urgentes */}
            {isLoadingTasks ? (
              <View className="flex-1 justify-center items-center w-screen">
                <ActivityIndicator size="large" color="#3342ff" />
                <Text className="mt-2 text-gray-600">
                  Actualizando tareas...
                </Text>
              </View>
            ) : (
              <PageTasks
                activeTab={activeTab}
                tasks={tasks}
                tasksCompleted={tasksCompleted}
                showCompleted={showCompleted}
                setShowCompleted={setShowCompleted}
                toggleTaskComplete={toggleTaskComplete}
                deleteTask={deleteTask}
              />
            )}

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
      )}
    </>
  );
}
