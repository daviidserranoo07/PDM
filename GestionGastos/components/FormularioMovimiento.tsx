import { CategoryContext } from '@/context/CategoryContext';
import { Categoria } from '@/models/Categoria';
import { Movimiento } from '@/models/Movimiento';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useContext, useEffect, useState } from "react";
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
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
    movimiento: Movimiento,
    handleDeleteMovimiento: Function
}) {
    const [cantidad, setCantidad] = useState('');
    const [concepto, setConcepto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fecha, setFecha] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const { categorias } = useContext(CategoryContext) as {
        categorias: Categoria[];
        handleAddCategoria: Function;
    };
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
    const [showAddCategory, setShowAddCategory] = useState(false);

    const handleSubmit = async () => {
        if (!cantidad) return;
        const cantidadNum = parseFloat(cantidad);
        if (isNaN(cantidadNum)) return;

        if (tipoTransaccion === 'ingreso') {
            await handleIngreso(cantidadNum, concepto, descripcion, fecha, categoriaSeleccionada, movimiento);
        } else {
            await handleGasto(cantidadNum, concepto, descripcion, fecha, categoriaSeleccionada, movimiento);
        }

        //Limpiamos el formulario
        setCantidad('');
        setConcepto('');
        setDescripcion('');
        setCategoriaSeleccionada(null);
        setFecha(new Date());
        setModalVisible(false);
    };

    const handleDelete = async () => {
        try {
            await handleDeleteMovimiento(movimiento);

            //Limpiamos el formulario
            setCantidad('');
            setConcepto('');
            setDescripcion('');
            setCategoriaSeleccionada(null);
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
            setDescripcion(movimiento.descripcion);
            setCategoriaSeleccionada(movimiento.categoria);
            setFecha(new Date(movimiento.fecha));
        }
    }, [movimiento])

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
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text className="text-xl font-semibold border border-black text-center mb-6">
                                {tipoTransaccion === 'ingreso' ? 'Nuevo Ingreso' : 'Nuevo Gasto'}
                            </Text>

                            <View className="mb-4">
                                <Text className="text-gray-600 mb-1">Concepto</Text>
                                <TextInput
                                    className="border border-gray-300 w-full rounded-lg px-3 py-2"
                                    placeholder="Concepto (opcional)"
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
                                <Text className="text-gray-600 mb-1">Descripción</Text>
                                <TextInput
                                    className="border border-gray-300 w-full rounded-lg px-3 py-2"
                                    placeholder="Descripción (opcional)"
                                    value={descripcion}
                                    onChangeText={setDescripcion}
                                />
                            </View>

                            <View className="flex-row items-center mb-4">
                                <View className="flex-1 border border-gray-300 rounded-lg overflow-hidden">
                                    <Picker
                                        selectedValue={categoriaSeleccionada?.id}
                                        onValueChange={(itemValue) => {
                                            if (!itemValue) {
                                                setCategoriaSeleccionada(null);
                                                return;
                                            }
                                            const categoria = categorias.find(c => c.id === itemValue);
                                            if (categoria) {
                                                setCategoriaSeleccionada(categoria);
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
                                                key={c.id}
                                                label={c.nombre}
                                                value={c.id}
                                            />
                                        ))}
                                    </Picker>
                                </View>

                                <TouchableOpacity
                                    className="ml-2 bg-blue-600 rounded-full w-10 h-10 justify-center items-center"
                                    onPress={() => {
                                        console.log("Estado actual:", showAddCategory);
                                        setShowAddCategory(true);
                                        console.log("Nuevo estado:", true);
                                    }}
                                >
                                    <Text className="text-white text-xl">+</Text>
                                </TouchableOpacity>
                            </View>

                            <FormularioCategoria
                                modalVisible={showAddCategory}
                                setModalVisible={setShowAddCategory}
                                id={''}
                            />

                            <TouchableOpacity
                                className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text>{fecha.toLocaleDateString()}</Text>
                            </TouchableOpacity>

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
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
}
