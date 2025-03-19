import { TextInput } from "react-native";

export default function Input({
  placeholder,
  className,
}: {
  placeholder: string;
  className?: string;
}) {
  return (
    <TextInput
      placeholder={placeholder}
      className={`border-2 border-black/20 rounded-xl p-2 ${className}`}
    />
  );
}
