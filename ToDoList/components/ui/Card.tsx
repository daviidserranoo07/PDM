import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, Text, Pressable } from "react-native";
import { useState } from "react";
import { router } from "expo-router";

interface CardProps {
  title: string;
  description: string;
  completed: boolean;
  onDelete: () => void;
}

export default function Card({
  title,
  description,
  completed,
  onDelete,
}: CardProps) {
  const [isCompleted, setIsCompleted] = useState(completed);
  return (
    <Pressable
      onPress={() => {
        router.push({
          pathname: "/task-modal",
          params: { title, description },
        });
      }}
      className="flex-row items-center justify-between w-full h-[100px] bg-white border-2 border-black/20 rounded-xl mb-2"
    >
      <View className="flex-col items-center gap-2">
        <Text className="text-2xl text-left w-full pl-4 font-bold">
          {title}
        </Text>
        <Text className="text-sm text-left w-full pl-4">{description}</Text>
      </View>
      <View className="flex-row items-center gap-2 mr-4">
        {isCompleted ? (
          <MaterialCommunityIcons
            onPress={() => setIsCompleted(!isCompleted)}
            name="check-circle"
            size={35}
            color="green"
          />
        ) : (
          <MaterialCommunityIcons
            onPress={() => setIsCompleted(!isCompleted)}
            name="check-circle"
            size={35}
            color="gray"
          />
        )}
        <MaterialCommunityIcons
          onPress={onDelete}
          name="delete"
          size={35}
          color="red"
        />
      </View>
    </Pressable>
  );
}
