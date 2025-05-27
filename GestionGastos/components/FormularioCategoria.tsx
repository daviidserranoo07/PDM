import { CategoryContext } from "@/context/CategoryContext";
import { Categoria, Subcategoria } from "@/models/Categoria";
import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import SubcategoriaCard from "./SubcategoriaCard";

// Custom hook para manejar las subcategorías
const useSubcategorias = (initialSubcategorias: Subcategoria[] = []) => {
    const [subcategorias, setSubcategorias] = useState<Subcategoria[]>(initialSubcategorias);
    const [search, setSearch] = useState<string>('');
    const [nuevaSubcategoria, setNuevaSubcategoria] = useState('');

    const filteredSubcategorias = useMemo(() => {
        if (!search) return subcategorias;
        return subcategorias.filter((subcategoria) =>
            subcategoria.nombre.toLowerCase().includes(search.toLowerCase())
        );
    }, [subcategorias, search]);

    const addSubcategoria = useCallback(() => {
        if (!nuevaSubcategoria.trim()) return;

        const subcategoria: Subcategoria = {
            id: Date.now().toString(),
            nombre: nuevaSubcategoria.trim()
        };

        setSubcategorias(prev => [...prev, subcategoria]);
        setNuevaSubcategoria('');
    }, [nuevaSubcategoria]);

    const deleteSubcategoria = useCallback((subcategoriaId: string) => {
        setSubcategorias(prev => prev.filter(sub => sub.id !== subcategoriaId));
    }, []);

    const resetSubcategorias = useCallback(() => {
        setSubcategorias([]);
        setSearch('');
        setNuevaSubcategoria('');
    }, []);

    return {
        subcategorias,
        filteredSubcategorias,
        search,
        setSearch,
        nuevaSubcategoria,
        setNuevaSubcategoria,
        addSubcategoria,
        deleteSubcategoria,
        resetSubcategorias
    };
};

export default function FormularioCategoria({
    modalVisible,
    setModalVisible,
    categoria,
    setCategoria
}: {
    modalVisible: boolean,
    setModalVisible: Function,
    categoria: Categoria | null,
    setCategoria: Function | null
}) {
    const [nombre, setNombre] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const context = useContext(CategoryContext);
    const { handleAddCategoria, handleUpdateCategoria } = context as {
        handleAddCategoria: Function;
        handleUpdateCategoria: Function;
    };

    const {
        subcategorias,
        filteredSubcategorias,
        search,
        setSearch,
        nuevaSubcategoria,
        setNuevaSubcategoria,
        addSubcategoria,
        deleteSubcategoria,
        resetSubcategorias
    } = useSubcategorias(categoria?.subcategorias || []);

    const handleSubmit = async () => {
        if (!nombre.trim() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            const newCategoria = {
                id: categoria?.id || Date.now().toString(),
                nombre: nombre.trim(),
                subcategorias
            } as Categoria;

            if (categoria) {
                await handleUpdateCategoria(newCategoria);
            } else {
                await handleAddCategoria(newCategoria);
            }

            handleClose();
        } catch (error) {
            console.error('Error al guardar la categoría:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = useCallback(() => {
        setNombre('');
        resetSubcategorias();
        setModalVisible(false);
        setCategoria?.(null);
    }, [setModalVisible, setCategoria, resetSubcategorias]);

    useEffect(() => {
        if (categoria) {
            setNombre(categoria.nombre);
        }
    }, [categoria]);

    return (
        <Modal
            transparent={true}
            animationType='fade'
            visible={modalVisible}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="flex-1 bg-black/60 justify-center px-4">
                    <View className="bg-white rounded-2xl p-6 max-h-[90%]">
                        <ScrollView
                            showsVerticalScrollIndicator={true}
                            keyboardShouldPersistTaps="handled"
                        >
                            <Text className="text-xl font-semibold border border-black text-center mb-6">
                                {categoria ? 'Editar categoría' : 'Nueva categoría'}
                            </Text>

                            <View className="mb-4">
                                <Text className="text-lg font-semibold mb-2">Nombre de la categoría</Text>
                                <TextInput
                                    className="border border-gray-300 w-full rounded-lg px-3 py-2 mb-4"
                                    placeholder="Nombre de la categoría"
                                    value={nombre}
                                    onChangeText={setNombre}
                                    style={{ borderWidth: 1, borderColor: '#d1d5db' }}
                                    maxLength={50}
                                    autoCapitalize="words"
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-lg font-semibold mb-2">Subcategorías</Text>

                                <ScrollView
                                    className="max-h-32"
                                    showsVerticalScrollIndicator={true}
                                    keyboardShouldPersistTaps="handled"
                                >
                                    {subcategorias.length > 0 && (
                                        <View className="relative mb-4">
                                            <TextInput
                                                className="border border-gray-300 w-full rounded-lg pl-10 pr-3 py-2"
                                                placeholder="Buscar subcategoría"
                                                value={search}
                                                onChangeText={setSearch}
                                                maxLength={30}
                                            />
                                            <MaterialIcons
                                                name="search"
                                                size={20}
                                                color="#9CA3AF"
                                                style={{ position: 'absolute', left: 12, top: 8 }}
                                            />
                                        </View>
                                    )}
                                    {filteredSubcategorias.map((sub) => (
                                        <SubcategoriaCard
                                            key={sub.id}
                                            subcategoria={sub}
                                            handleDeleteSubcategoria={deleteSubcategoria}
                                        />
                                    ))}
                                </ScrollView>

                                <View className="flex-row items-center mt-2">
                                    <TextInput
                                        className="border border-gray-300 flex-1 rounded-lg px-3 py-2 mr-2"
                                        placeholder="Nueva subcategoría"
                                        value={nuevaSubcategoria}
                                        onChangeText={setNuevaSubcategoria}
                                        maxLength={30}
                                        onSubmitEditing={addSubcategoria}
                                        returnKeyType="done"
                                    />
                                    <TouchableOpacity
                                        onPress={addSubcategoria}
                                        className="bg-blue-500 px-4 py-2 rounded-lg"
                                        disabled={!nuevaSubcategoria.trim()}
                                        style={{ opacity: nuevaSubcategoria.trim() ? 1 : 0.5 }}
                                    >
                                        <Text className="text-white">Añadir</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="flex-row justify-between mt-10">
                                <TouchableOpacity
                                    className="bg-gray-400 px-5 py-2 rounded-lg"
                                    onPress={handleClose}
                                >
                                    <Text className="text-white text-base">Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className={`${isSubmitting ? 'bg-green-400' : 'bg-green-600'} px-5 rounded-lg`}
                                    onPress={handleSubmit}
                                    disabled={isSubmitting || !nombre.trim()}
                                    style={{ opacity: (!nombre.trim() || isSubmitting) ? 0.5 : 1 }}
                                >
                                    <Text className="text-white text-base p-2">
                                        {isSubmitting ? 'Guardando...' : 'Guardar'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}