import { Pressable, Text } from "react-native";

export default function Button({
  title,
  className,
  onPress,
}: {
  title: string;
  className?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`bg-blue-500 max-h-[50px] h-full p-2 rounded-xl ${className}`}
    >
      <Text className="text-white text-center">{title}</Text>
    </Pressable>
  );
}
