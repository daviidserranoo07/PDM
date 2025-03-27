import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, Text, Pressable } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { formatDate } from "../../utils/formatDate";
interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  date: Date;
  location: {
    coords: {
      latitude: number;
      longitude: number;
    };
    address: string;
  };
  priority: string;
}
interface CardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function Card({ task, onComplete, onDelete }: CardProps) {
  const [isCompleted, setIsCompleted] = useState(task?.completed);

  return (
    <View className="flex-row items-center justify-between w-full h-[120px] bg-white border-2 border-black/20 rounded-xl mb-2">
      <View className="flex-col items-center gap-1">
        <Text className="text-2xl text-left w-full pl-4 font-bold">
          {task?.title}
        </Text>
        <Text className="text-sm text-left w-full pl-4">
          {task?.description}
        </Text>
        <Text className="text-sm text-left w-full pl-4">
          {formatDate(task?.date)}
        </Text>
        <Text className="text-sm text-left w-full pl-4">
          {task?.location?.address || "Sin ubicación"}
        </Text>
      </View>
      <View className="flex-row items-center gap-2 mr-4">
        {isCompleted ? (
          <MaterialCommunityIcons
            onPress={() => {
              setIsCompleted(!isCompleted);
              onComplete(task.id);
            }}
            name="check-circle"
            size={35}
            color="green"
          />
        ) : (
          <MaterialCommunityIcons
            onPress={() => {
              setIsCompleted(!isCompleted);
              onComplete(task.id);
            }}
            name="check-circle"
            size={35}
            color="gray"
          />
        )}
        <MaterialCommunityIcons
          onPress={() => onDelete(task.id)}
          name="delete"
          size={35}
          color="red"
        />
      </View>
    </View>
  );
}
