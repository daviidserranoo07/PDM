import { CategoryContext } from '@/context/CategoryContext';
import { Categoria, Subcategoria } from '@/models/Categoria';
import { Movimiento } from '@/models/Movimiento';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import FormularioCategoria from './FormularioCategoria';

export default function FormularioMovimiento({
    handleIngreso,
    handleGasto,
    tipoTransaccion,
    modalVisible,
    setModalVisible,
    movimiento,
    handleDeleteMovimiento
}: {
    handleIngreso: Function,
    handleGasto: Function,
    tipoTransaccion: string,
    modalVisible: boolean,
    setModalVisible: Function,
    movimiento: Movimiento | null,
    handleDeleteMovimiento: Function,
}) {
    const [cantidad, setCantidad] = useState('');
    const [concepto, setConcepto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fecha, setFecha] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const { categorias, handleUpdateCategoria } = useContext(CategoryContext) as {
        categorias: Categoria[];
        handleAddCategoria: Function;
        handleUpdateCategoria: Function;
    };
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
    const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState<Subcategoria | null>(null);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [showAddSubcategory, setShowAddSubcategory] = useState(false);
    const [nuevaSubcategoria, setNuevaSubcategoria] = useState('');

    const handleSubmit = async () => {
        if (!cantidad) {
            Alert.alert(
                "No valido",
                "Por favor, introduzca una cantidad",
                [{ text: "OK" }]
            );
            return;
        }
        const cantidadNum = parseFloat(cantidad);
        if (isNaN(cantidadNum)) {
            Alert.alert(
                "No valido",
                "La cantidad debe ser un número válido",
                [{ text: "OK" }]
            );
            return;
        }

        if (tipoTransaccion === 'ingreso') {
            await handleIngreso(cantidadNum, concepto, descripcion, fecha, categoriaSeleccionada, subcategoriaSeleccionada, movimiento);
        } else {
            await handleGasto(cantidadNum, concepto, descripcion, fecha, categoriaSeleccionada, subcategoriaSeleccionada, movimiento);
        }

        //Limpiamos el formulario
        setCantidad('');
        setConcepto('');
        setCategoriaSeleccionada(null);
        setSubcategoriaSeleccionada(null);
        setFecha(new Date());
        setModalVisible(false);
    };

    const handleAddSubcategoria = async () => {
        if (!nuevaSubcategoria || !categoriaSeleccionada) return;

        const subcategoria: Subcategoria = {
            id: Date.now().toString(),
            nombre: nuevaSubcategoria
        };

        const categoriaActualizada = {
            ...categoriaSeleccionada,
            subcategorias: [...(categoriaSeleccionada.subcategorias || []), subcategoria]
        };

        await handleUpdateCategoria(categoriaActualizada);
        setCategoriaSeleccionada(categoriaActualizada);
        setNuevaSubcategoria('');
        setShowAddSubcategory(false);
    };

    const handleDelete = async () => {
        try {
            await handleDeleteMovimiento(movimiento);

            //Limpiamos el formulario
            setCantidad('');
            setConcepto('');
            setCategoriaSeleccionada(null);
            setSubcategoriaSeleccionada(null);
            setFecha(new Date());
            setModalVisible(false);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (movimiento) {
            setCantidad(movimiento.cantidad.toString());
            setConcepto(movimiento.concepto);
            setFecha(new Date(movimiento.fecha));
            const categoriaEncontrada = categorias.find((current) => current.id === movimiento?.categoria?.id);
            setCategoriaSeleccionada(categoriaEncontrada || null);
            setSubcategoriaSeleccionada(movimiento.subcategoria);
        }
    }, [movimiento]);

    return (
        <>
            <Modal
                transparent={false}
                animationType='fade'
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-black/60 justify-center px-4">
                    <View className="bg-white rounded-2xl p-6 ">
                        <Text className="text-xl font-semibold border border-black text-center mb-6">
                            {tipoTransaccion === 'ingreso' ? 'Nuevo Ingreso' : 'Nuevo Gasto'}
                        </Text>
                        <ScrollView className='max-h-[600px]' showsVerticalScrollIndicator={true}>
                            <View className="mb-4">
                                <Text className="text-gray-600 mb-1">
                                    Concepto
                                </Text>
                                <TextInput
                                    className="border border-gray-300 w-full rounded-lg px-3 py-2"
                                    placeholder="Concepto"
                                    value={concepto}
                                    onChangeText={setConcepto}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-600 mb-1">
                                    Cantidad <Text className="text-red-500">*</Text>
                                </Text>
                                <TextInput
                                    className="border border-gray-300 w-full rounded-lg px-3 py-2"
                                    placeholder="Cantidad"
                                    value={cantidad}
                                    keyboardType='numeric'
                                    onChangeText={setCantidad}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-600 mb-1">
                                    Fecha <Text className="text-red-500">*</Text>
                                </Text>
                                <TouchableOpacity
                                    className="border border-gray-300 rounded-lg px-3 py-2"
                                    onPress={() => setShowDatePicker(true)}
                                    style={{ borderWidth: 1, borderColor: '#d1d5db' }}
                                >
                                    <Text>{fecha.toLocaleDateString()}</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-600 mb-1">
                                    Descripción
                                </Text>
                                <TextInput
                                    className="border border-gray-300 w-full rounded-lg px-3 py-2 mb-4"
                                    placeholder="Descripción (opcional)"
                                    value={descripcion}
                                    onChangeText={setDescripcion}
                                />
                            </View>

                            <View className="mb-4">
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-gray-600 mb-1">
                                        Categoría
                                    </Text>
                                    <TouchableOpacity
                                        className="bg-blue-500 px-3 py-1 rounded"
                                        onPress={() => setShowAddCategory(true)}
                                    >
                                        <Text className="text-white">{`${categoriaSeleccionada ? 'Editar categoria' : 'Añadir categoria'}`}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View className="flex-row items-center">
                                    <View className="flex-1 border border-gray-300 rounded-lg overflow-hidden">
                                        <Picker
                                            selectedValue={categoriaSeleccionada?.id}
                                            onValueChange={(itemValue) => {
                                                if (!itemValue) {
                                                    setCategoriaSeleccionada(null);
                                                    setSubcategoriaSeleccionada(null);
                                                    return;
                                                }
                                                const categoria = categorias.find(c => c.id === itemValue);
                                                if (categoria) {
                                                    setCategoriaSeleccionada(categoria);
                                                    setSubcategoriaSeleccionada(null);
                                                }
                                            }}
                                            className="h-12 w-full bg-transparent"
                                        >
                                            <Picker.Item
                                                label="Selecciona una categoría"
                                                value={null}
                                            />
                                            {categorias.map(c => (
                                                <Picker.Item
                                                    key={c?.id}
                                                    label={c?.nombre}
                                                    value={c.id}
                                                />
                                            ))}
                                        </Picker>
                                    </View>
                                </View>
                            </View>

                            {categoriaSeleccionada && (
                                <View className="mb-4">
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-gray-600">Subcategorías</Text>
                                    </View>

                                    {categoriaSeleccionada.subcategorias && categoriaSeleccionada.subcategorias.length > 0 && (
                                        <View className="border border-gray-300 rounded-lg overflow-hidden mb-2">
                                            <Picker
                                                selectedValue={subcategoriaSeleccionada?.id}
                                                onValueChange={(itemValue) => {
                                                    if (!itemValue) {
                                                        setSubcategoriaSeleccionada(null);
                                                        return;
                                                    }
                                                    const subcategoria = categoriaSeleccionada.subcategorias?.find(
                                                        s => s.id === itemValue
                                                    );
                                                    if (subcategoria) {
                                                        setSubcategoriaSeleccionada(subcategoria);
                                                    }
                                                }}
                                                className="h-12 w-full bg-transparent"
                                            >
                                                <Picker.Item
                                                    label="Selecciona una subcategoría"
                                                    value={null}
                                                />
                                                {categoriaSeleccionada.subcategorias.map(sub => (
                                                    <Picker.Item
                                                        key={sub.id}
                                                        label={sub.nombre}
                                                        value={sub.id}
                                                    />
                                                ))}
                                            </Picker>
                                        </View>
                                    )}
                                </View>
                            )}

                            {showDatePicker && (
                                <DateTimePicker
                                    value={fecha}
                                    mode="date"
                                    display="default"
                                    onChange={(e, selectedDate) => {
                                        setShowDatePicker(false);
                                        if (selectedDate) setFecha(selectedDate);
                                    }}
                                />
                            )}
                        </ScrollView>

                        <View className="flex-row justify-between mt-10">
                            <TouchableOpacity
                                className="bg-gray-400 px-5 py-2 rounded-lg"
                                onPress={() => setModalVisible(false)}
                            >
                                <Text className="text-white text-base">Cancelar</Text>
                            </TouchableOpacity>


                            {movimiento ? <TouchableOpacity
                                className="bg-red-500 px-5 py-2 rounded-lg"
                                onPress={handleDelete}
                            >
                                <Text className="text-white text-base">Eliminar</Text>
                            </TouchableOpacity> : null}

                            <TouchableOpacity
                                className="bg-green-600 px-5 py-2 rounded-lg"
                                onPress={handleSubmit}
                            >
                                <Text className="text-white text-base">Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <FormularioCategoria
                    modalVisible={showAddCategory}
                    setModalVisible={setShowAddCategory}
                    categoria={categoriaSeleccionada}
                    setCategoria={null}
                />
            </Modal>
        </>
    );
}
