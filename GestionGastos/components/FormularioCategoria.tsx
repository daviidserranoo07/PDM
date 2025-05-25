import { CategoryContext } from "@/context/CategoryContext";
import { Categoria } from "@/models/Categoria";
import { useContext, useEffect, useState } from "react";
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function FormularioCategoria({ modalVisible, setModalVisible, id }: { modalVisible: boolean, setModalVisible: Function, id: string }) {
    const [nombre, setNombre] = useState('');
    const context = useContext(CategoryContext);
    const { categorias, handleAddCategoria, handleUpdateCategoria } = context as {
        categorias: Categoria[];
        handleAddCategoria: Function;
        handleUpdateCategoria: Function;
    };

    console.log("llega");

    const handleSubmit = async () => {
        if (!nombre) return;

        const categoria = {
            id: id ? categorias.find((current: Categoria) => current.id === id) : Date.now().toString(),
            nombre
        } as Categoria;

        if (id) {
            await handleUpdateCategoria(categoria);
        } else {
            await handleAddCategoria(categoria);
        }

        //Limpiamos los datos del formulario
        setNombre('')
        setModalVisible(false);
    };

    useEffect(() => {
        if (id) {
            const current = categorias.find((current: Categoria) => current.id === id) as Categoria;
            setNombre(current.nombre);
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
                            placeholder="Concepto (opcional)"
                            value={nombre}
                            onChangeText={setNombre}
                            style={{ borderWidth: 1, borderColor: '#d1d5db' }}
                        />

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
                                <Text className="text-white text-base">Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}