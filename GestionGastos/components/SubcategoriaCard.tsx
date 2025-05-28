import { Subcategoria } from "@/models/Categoria";
import { Text, TouchableOpacity, View } from "react-native";



export default function SubcategoriaCard({ subcategoria, handleDeleteSubcategoria }: { subcategoria: Subcategoria, handleDeleteSubcategoria: Function }) {

    return (
        <View className="flex-row items-center justify-between mb-2 bg-gray-100 p-2 rounded-lg">
            <Text>{subcategoria.nombre}</Text>
            {subcategoria.id !== 'default-sub' ? <TouchableOpacity
                onPress={() => handleDeleteSubcategoria(subcategoria.id)}
                className="bg-red-500 px-3 py-1 rounded"
            >
                <Text className="text-white">Eliminar</Text>
            </TouchableOpacity> : null}
        </View>
    )
}