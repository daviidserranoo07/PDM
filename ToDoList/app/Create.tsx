import { View, Text } from "react-native";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
export default function Crear() {
  return (
    <View className="flex-1 items-center w-full justify-center p-2 gap-4">
      <Input placeholder="Título" className="w-full" />
      <Input placeholder="Descripción " className="w-full" />
      <Button title="Crear" className="w-full text-white" />
    </View>
  );
}
