import { View, Text, Pressable } from "react-native";
import { useState } from "react";

export default function TabMenu({
  options,
  activeTab,
  setActiveTab,
}: {
  options: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  return (
    <View className="flex-row w-full rounded-xl bg-gray-100 m-2 h-12 items-center">
      {options.map((option) => (
        <Pressable
          key={option}
          onPress={() => setActiveTab(option)}
          className={`flex-1 h-10 py-2 px-4 rounded-xl ${
            activeTab === option ? "bg-blue-400" : ""
          }`}
        >
          <Text
            className={`text-center font-medium ${
              activeTab === option ? "text-white" : "text-gray-600"
            }`}
          >
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
