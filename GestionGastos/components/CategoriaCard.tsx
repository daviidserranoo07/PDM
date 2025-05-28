import { Categoria, Subcategoria } from "@/models/Categoria";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const MAX_SUBCATEGORIAS = 3;

export default function CategoriaCard({ categoria, handleOpenCategoria, handleDeleteCategoria }: { categoria: Categoria, handleOpenCategoria: Function, handleDeleteCategoria: Function }) {
    const [esCategoriaDefault, setEsCategoriaDefault] = useState<boolean>(false);
    const [masSubcategorias, setMasSubcategorias] = useState<boolean>(false);
    const [subcategoriasMostradas, setSubcategoriasMostradas] = useState<Subcategoria[]>([]);

    useEffect(() => {
        if (categoria) {
            if ((categoria?.subcategorias?.length || 0) > MAX_SUBCATEGORIAS) {
                setMasSubcategorias(true);
            }

            if (categoria?.subcategorias) {
                const subcategorias = categoria?.subcategorias?.slice(0, MAX_SUBCATEGORIAS);
                setSubcategoriasMostradas(subcategorias);
            }
        }
    }, [categoria]);

    const handleDelete = async (e: React.MouseEvent) => {
        try {
            e.stopPropagation();
            await handleDeleteCategoria(categoria)
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <TouchableOpacity
            key={categoria?.id}
            className="bg-white p-4 rounded-lg mb-3 shadow-sm border border-gray-100"
            onPress={() => handleOpenCategoria(categoria)}
        >
            <View className="flex-row justify-between items-center">
                <View className="flex-1 mr-2">
                    <View className="flex-row items-center">
                        <Text className="text-lg font-semibold text-gray-800">{categoria?.nombre}</Text>
                        {esCategoriaDefault && (
                            <View className="ml-2 bg-gray-100 px-2 py-1 rounded-full">
                                <Text className="text-xs text-gray-500">Por defecto</Text>
                            </View>
                        )}
                    </View>
                    {categoria?.subcategorias && categoria?.subcategorias.length > 0 && (
                        <View className="mt-2">
                            <Text className="text-sm text-gray-500 mb-1">Subcategorías:</Text>
                            <View className="flex-row flex-wrap gap-1">
                                {subcategoriasMostradas.map((sub) => (
                                    <View key={sub.id} className="bg-gray-100 px-2 py-1 rounded-full">
                                        <Text className="text-xs text-gray-600">{sub?.nombre}</Text>
                                    </View>
                                ))}
                                {masSubcategorias && (
                                    <View className="bg-gray-100 px-2 py-1 rounded-full">
                                        <Text className="text-xs text-gray-500">+{categoria.subcategorias.length - MAX_SUBCATEGORIAS} más</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}
                </View>
                {!esCategoriaDefault && (
                    <TouchableOpacity
                        className="bg-red-500 px-3 py-2 rounded-lg"
                        onPress={(e) => handleDelete(e as unknown as React.MouseEvent)}
                    >
                        <MaterialIcons name="delete" size={15} color="white" />
                    </TouchableOpacity>
                )
                }
            </View >
        </TouchableOpacity >
    )
}