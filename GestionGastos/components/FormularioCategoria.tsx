import { CategoryContext } from "@/context/CategoryContext";
import { Categoria, Subcategoria } from "@/models/Categoria";
import { MaterialIcons } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import SubcategoriaCard from "./SubcategoriaCard";

export default function FormularioCategoria({ modalVisible, setModalVisible, categoria, setCategoria }: { modalVisible: boolean, setModalVisible: Function, categoria: Categoria | null, setCategoria: Function | null }) {
    const [nombre, setNombre] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [tipo, setTipo] = useState<'ingreso' | 'gasto'>('gasto');
    const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
    const [fileteredSubcategorias, setFilteredSubcategorias] = useState<Subcategoria[]>([]);
    const [nuevaSubcategoria, setNuevaSubcategoria] = useState('');
    const context = useContext(CategoryContext);
    const { handleAddCategoria, handleUpdateCategoria } = context as {
        categorias: Categoria[];
        handleAddCategoria: Function;
        handleUpdateCategoria: Function;
    };

    const handleSubmit = async () => {
        if (!nombre) return;

        const newCategoria = {
            id: categoria ? categoria.id : Date.now().toString(),
            nombre,
            tipo,
            subcategorias
        } as Categoria;

        if (categoria) {
            await handleUpdateCategoria(newCategoria);
        } else {
            await handleAddCategoria(newCategoria);
        }

        //Limpiamos los datos del formulario
        setNombre('');
        setSubcategorias([]);
        setFilteredSubcategorias([]);
        setNuevaSubcategoria('');
        setModalVisible(false);
        setCategoria && setCategoria(null);
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

    const handleCloseCategoria = () => {
        setNombre('');
        setSubcategorias([]);
        setFilteredSubcategorias([]);
        setNuevaSubcategoria('');
        setModalVisible(false);
        setCategoria && setCategoria(null);
    }

    useEffect(() => {
        if (categoria) {
            setNombre(categoria.nombre);
            setTipo(categoria.tipo || 'ingreso');
            setSubcategorias(categoria.subcategorias || []);
        }
    }, [categoria]);

    useEffect(() => {
        if (search !== '') {
            const filtered = subcategorias.filter((subcategoria) => subcategoria.nombre.includes(search));
            setFilteredSubcategorias(filtered);
        } else {
            setFilteredSubcategorias(subcategorias);
        }
    }, [search]);

    useEffect(() => {
        if (subcategorias) {
            setFilteredSubcategorias(subcategorias);
        }
    }, [subcategorias])

    return (
        <Modal
            transparent={true}
            animationType='fade'
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View className="flex-1 bg-black/60 justify-center px-4">
                <View className="bg-white rounded-2xl p-6 ">
                    <View className="flex-row items-center mb-4">
                        <TouchableOpacity
                            onPress={handleCloseCategoria}
                            className="p-2 mr-2"
                        >
                            <MaterialIcons name="close" size={24} color="#374151" />
                        </TouchableOpacity>
                        <Text className="text-xl font-semibold text-center flex-1">
                            {categoria ? 'Editar categoria' : 'Nueva categoria'}
                        </Text>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={true}>
                        <View className="mb-4">
                            <TextInput
                                className="border border-gray-300 w-full rounded-lg px-3 py-2 mb-4"
                                placeholder="Nombre de la categoría"
                                value={nombre}
                                onChangeText={setNombre}
                                style={{ borderWidth: 1, borderColor: '#d1d5db' }}
                            />
                        </View>

                        {/* Selector de tipo */}
                        <View className="mb-6">
                            <View className="flex-row space-x-4 gap-2">
                                <TouchableOpacity
                                    className={`flex-1 border-2 rounded-xl px-4 py-3 ${tipo === 'gasto' ? 'bg-red-500 border-red-500' : 'border-gray-300'}`}
                                    onPress={() => {
                                        setTipo('gasto');
                                    }}
                                >
                                    <Text className={`text-center font-medium ${tipo === 'gasto' ? 'text-white' : 'text-gray-600'}`}>
                                        Gasto
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className={`flex-1 border-2 rounded-xl px-4 py-3 ${tipo === 'ingreso' ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
                                    onPress={() => {
                                        setTipo('ingreso');
                                    }}
                                >
                                    <Text className={`text-center font-medium ${tipo === 'ingreso' ? 'text-white' : 'text-gray-600'}`}>
                                        Ingreso
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Sección de subcategorías */}
                        <View className="mb-4">
                            {subcategorias && subcategorias.length > 0 ? (
                                <View className="relative mb-4">
                                    <TextInput
                                        className="border border-gray-300 w-full rounded-lg pl-10 pr-3 py-2"
                                        placeholder="Buscar subcategoria"
                                        value={search}
                                        onChangeText={setSearch}
                                    />
                                    <MaterialIcons
                                        name="search"
                                        size={20}
                                        color="#9CA3AF"
                                        className="absolute left-3 top-2"
                                    />
                                </View>
                            ) : null}

                            {/* Lista de subcategorías existentes */}
                            <ScrollView className="max-h-32" showsVerticalScrollIndicator={true}>
                                {fileteredSubcategorias.map((sub) => (
                                    <SubcategoriaCard key={sub.id} subcategoria={sub} handleDeleteSubcategoria={handleDeleteSubcategoria} />
                                ))}
                            </ScrollView>

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

                        <View className="flex-row justify-end mt-5">
                            <TouchableOpacity
                                className="bg-green-600 px-5 rounded-lg"
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