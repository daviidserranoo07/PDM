import { View, Text, ScrollView, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Card from "./Card";
import Task from "../../models/Task";

export default function PageTasks({
  tasks,
  tasksCompleted,
  showCompleted,
  setShowCompleted,
  toggleTaskComplete,
  deleteTask,
  activeTab,
}) {
  return (
    <View className="w-screen h-screen px-8">
      <Text className="text-2xl font-bold p-2">{activeTab}</Text>
      <View className="flex-col w-full h-full items-center pb-32 bg-white p-2">
        <ScrollView className="w-full h-full mb-4">
          {tasks.map((task) => (
            <Card
              key={task.id}
              task={task}
              onComplete={() => toggleTaskComplete(task)}
              onDelete={() => deleteTask(task)}
            />
          ))}

          {/* Botón para mostrar/ocultar completadas */}
          {tasksCompleted.length > 0 && (
            <Pressable
              onPress={() => setShowCompleted(!showCompleted)}
              className="flex-row items-center justify-between w-full p-4 bg-gray-100 rounded-xl mt-4"
            >
              <Text className="text-gray-600 font-medium">
                {showCompleted ? "Ocultar completadas" : "Mostrar completadas"}
              </Text>
              <MaterialCommunityIcons
                name={showCompleted ? "chevron-up" : "chevron-down"}
                size={24}
                color="gray"
              />
            </Pressable>
          )}

          {/* Tareas completadas */}
          {showCompleted && (
            <View className="mt-2">
              {tasksCompleted.map((task) => (
                <View key={task.id} className="opacity-60">
                  <Card
                    task={task}
                    onComplete={() => toggleTaskComplete(task)}
                    onDelete={() => deleteTask(task)}
                  />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
