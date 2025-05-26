import { CategoryContext } from "@/context/CategoryContext";
import { Categoria, Subcategoria } from "@/models/Categoria";
import { useContext, useEffect, useState } from "react";
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function FormularioCategoria({ modalVisible, setModalVisible, id }: { modalVisible: boolean, setModalVisible: Function, id: string }) {
    const [nombre, setNombre] = useState('');
    const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
    const [nuevaSubcategoria, setNuevaSubcategoria] = useState('');
    const context = useContext(CategoryContext);
    const { categorias, handleAddCategoria, handleUpdateCategoria } = context as {
        categorias: Categoria[];
        handleAddCategoria: Function;
        handleUpdateCategoria: Function;
    };

    const handleSubmit = async () => {
        if (!nombre) return;

        const categoria = {
            id: id ? categorias.find((current: Categoria) => current.id === id)?.id : Date.now().toString(),
            nombre,
            subcategorias
        } as Categoria;

        if (id) {
            await handleUpdateCategoria(categoria);
        } else {
            await handleAddCategoria(categoria);
        }

        //Limpiamos los datos del formulario
        setNombre('');
        setSubcategorias([]);
        setNuevaSubcategoria('');
        setModalVisible(false);
    };

    const handleAddSubcategoria = () => {
        if (!nuevaSubcategoria) return;

        const subcategoria: Subcategoria = {
            id: Date.now().toString(),
            nombre: nuevaSubcategoria
        };

        setSubcategorias([...subcategorias, subcategoria]);
        setNuevaSubcategoria('');
    };

    const handleDeleteSubcategoria = (subcategoriaId: string) => {
        setSubcategorias(subcategorias.filter(sub => sub.id !== subcategoriaId));
    };

    useEffect(() => {
        if (id) {
            const current = categorias.find((current: Categoria) => current.id === id) as Categoria;
            setNombre(current.nombre);
            setSubcategorias(current.subcategorias || []);
        }
    }, [id]);

    return (
        <Modal
            transparent={true}
            animationType='fade'
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View className="flex-1 bg-black/60 justify-center px-4">
                <View className="bg-white rounded-2xl p-6 ">
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text className="text-xl font-semibold border border-black text-center mb-6">
                            Nueva categoria
                        </Text>

                        <TextInput
                            className="border border-gray-300 w-full rounded-lg px-3 py-2 mb-4"
                            placeholder="Nombre de la categoría"
                            value={nombre}
                            onChangeText={setNombre}
                            style={{ borderWidth: 1, borderColor: '#d1d5db' }}
                        />

                        {/* Sección de subcategorías */}
                        <View className="mb-4">
                            <Text className="text-lg font-semibold mb-2">Subcategorías</Text>

                            {/* Lista de subcategorías existentes */}
                            {subcategorias.map((sub) => (
                                <View key={sub.id} className="flex-row items-center justify-between mb-2 bg-gray-100 p-2 rounded-lg">
                                    <Text>{sub.nombre}</Text>
                                    <TouchableOpacity
                                        onPress={() => handleDeleteSubcategoria(sub.id)}
                                        className="bg-red-500 px-3 py-1 rounded"
                                    >
                                        <Text className="text-white">Eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {/* Input para nueva subcategoría */}
                            <View className="flex-row items-center mt-2">
                                <TextInput
                                    className="border border-gray-300 flex-1 rounded-lg px-3 py-2 mr-2"
                                    placeholder="Nueva subcategoría"
                                    value={nuevaSubcategoria}
                                    onChangeText={setNuevaSubcategoria}
                                />
                                <TouchableOpacity
                                    onPress={handleAddSubcategoria}
                                    className="bg-blue-500 px-4 py-2 rounded-lg"
                                >
                                    <Text className="text-white">Añadir</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="flex-row justify-between mt-10">
                            <TouchableOpacity
                                className="bg-gray-400 px-5 py-2 rounded-lg"
                                onPress={() => setModalVisible(false)}
                            >
                                <Text className="text-white text-base">Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="bg-green-600 px-5 py-2 rounded-lg"
                                onPress={handleSubmit}
                            >
                                <Text className="text-white text-base p-2">Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}