import { Text, View } from "react-native";

export default function HeadInfoElement({text, data} : {text: String, data: String}){

    return(
        <View className="text-center">
            <Text className="text-sm text-gray-500">{text}</Text>
            <Text className="text-lg text-center font-semibold text-blue-600">
                {data}
            </Text>
        </View>
    )
}