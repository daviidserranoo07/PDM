import FormularioCategoria from "@/components/FormularioCategoria";
import { CategoryContext } from "@/context/CategoryContext";
import { Categoria } from "@/models/Categoria";
import { useContext, useState } from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Categorias() {
    const [modalVisible, setModalVisible] = useState(false);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
    const { categorias, handleDeleteCategoria } = useContext(CategoryContext) as {
        categorias: Categoria[];
        handleDeleteCategoria: Function;
    };

    console.log(categorias);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="p-4">
                <Text className="text-2xl font-bold mb-4">Categorías</Text>

                <TouchableOpacity
                    className="bg-blue-500 p-3 rounded-lg mb-4"
                    onPress={() => {
                        setCategoriaSeleccionada(null);
                        setModalVisible(true);
                    }}
                >
                    <Text className="text-white text-center font-semibold">Nueva Categoría</Text>
                </TouchableOpacity>

                <ScrollView>
                    {categorias.map((categoria) => (
                        <View key={categoria?.id} className="bg-gray-50 p-4 rounded-lg mb-3">
                            <View className="flex-row justify-between items-center">
                                <Text className="text-lg font-semibold">{categoria?.nombre}</Text>
                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        className="bg-blue-500 px-3 py-1 rounded"
                                        onPress={() => {
                                            setCategoriaSeleccionada(categoria);
                                            setModalVisible(true);
                                        }}
                                    >
                                        <Text className="text-white">Editar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className="bg-red-500 px-3 py-1 rounded"
                                        onPress={() => handleDeleteCategoria(categoria)}
                                    >
                                        <Text className="text-white">Eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {categoria?.subcategorias && categoria?.subcategorias.length > 0 && (
                                <View className="mt-2">
                                    <Text className="text-gray-600 mb-1">Subcategorías:</Text>
                                    {categoria?.subcategorias.map((sub) => (
                                        <Text key={sub.id} className="text-gray-500 ml-2">• {sub?.nombre}</Text>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>
            </View>

            <FormularioCategoria
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                id={categoriaSeleccionada?.id || ''}
            />
        </SafeAreaView>
    );
}