import CategoriaCard from "@/components/CategoriaCard";
import FormularioCategoria from "@/components/FormularioCategoria";
import { CategoryContext } from "@/context/CategoryContext";
import { Categoria } from "@/models/Categoria";
import { MaterialIcons } from "@expo/vector-icons";
import { useContext, useState } from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Categorias() {
    const [modalVisible, setModalVisible] = useState(false);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
    const { categorias, handleDeleteCategoria } = useContext(CategoryContext) as {
        categorias: Categoria[];
        handleDeleteCategoria: Function;
    };

    const handleOpenCategoria = (categoria: Categoria) => {
        setCategoriaSeleccionada(categoria);
        setModalVisible(true);
    }

    return (
        <SafeAreaView className="flex-1 bg-white pt-10">
            <View className="flex-1">
                <View className="p-4">
                    <Text className="text-2xl font-bold mb-4">Categorías</Text>
                </View>

                <ScrollView className="flex-1 px-4">
                    {categorias && categorias.length > 0 ? (
                        categorias.map((categoria) => (
                            <CategoriaCard
                                key={categoria.id}
                                categoria={categoria}
                                handleOpenCategoria={handleOpenCategoria}
                                handleDeleteCategoria={handleDeleteCategoria}
                            />
                        ))
                    ) : (
                        <View className="flex items-center justify-center h-[400px] w-full">
                            <MaterialIcons name="category" size={64} color="#9CA3AF" />
                            <Text className="text-gray-500 text-lg mt-4 font-medium">No hay categorías</Text>
                            <Text className="text-gray-400 text-center mt-2 px-4">
                                Crea tu primera categoría para organizar tus gastos
                            </Text>
                        </View>
                    )}
                </ScrollView>

                <View className="p-4">
                    <TouchableOpacity
                        className="bg-blue-500 p-3 rounded-lg"
                        onPress={() => {
                            setCategoriaSeleccionada(null);
                            setModalVisible(true);
                        }}
                    >
                        <Text className="text-white text-center font-semibold">Nueva Categoría</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FormularioCategoria
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                categoria={categoriaSeleccionada}
                setCategoria={setCategoriaSeleccionada}
            />
        </SafeAreaView>
    );
}