import { Categoria } from "@/models/Categoria";
import { MaterialIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export default function CategoriaCard({ categoria, handleOpenCategoria, handleDeleteCategoria }: { categoria: Categoria, handleOpenCategoria: Function, handleDeleteCategoria: Function }) {
    const MAX_SUBCATEGORIAS = 3;
    const subcategoriasMostradas = categoria?.subcategorias?.slice(0, MAX_SUBCATEGORIAS) || [];
    const hayMasSubcategorias = (categoria?.subcategorias?.length || 0) > MAX_SUBCATEGORIAS;

    return (
        <TouchableOpacity
            key={categoria?.id}
            className="bg-white p-4 rounded-lg mb-3 shadow-sm border border-gray-100"
            onPress={() => handleOpenCategoria(categoria)}
        >
            <View className="flex-row justify-between items-center">
                <View className="flex-1 mr-2">
                    <Text className="text-lg font-semibold text-gray-800">{categoria?.nombre}</Text>
                    {categoria?.subcategorias && categoria?.subcategorias.length > 0 && (
                        <View className="mt-2">
                            <Text className="text-sm text-gray-500 mb-1">Subcategorías:</Text>
                            <View className="flex-row flex-wrap gap-1">
                                {subcategoriasMostradas.map((sub) => (
                                    <View key={sub.id} className="bg-gray-100 px-2 py-1 rounded-full">
                                        <Text className="text-xs text-gray-600">{sub?.nombre}</Text>
                                    </View>
                                ))}
                                {hayMasSubcategorias && (
                                    <View className="bg-gray-100 px-2 py-1 rounded-full">
                                        <Text className="text-xs text-gray-500">+{categoria.subcategorias.length - MAX_SUBCATEGORIAS} más</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}
                </View>
                <TouchableOpacity
                    className="bg-red-500 px-3 py-2 rounded-lg"
                    onPress={() => handleDeleteCategoria(categoria)}
                >
                    <MaterialIcons name="delete" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    )
}