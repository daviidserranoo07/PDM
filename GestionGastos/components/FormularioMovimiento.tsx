import { CategoryContext } from '@/context/CategoryContext';
import { Categoria } from '@/models/Categoria';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useContext, useState } from "react";
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import FormularioCategoria from './FormularioCategoria';

export default function FormularioMovimiento({
    handleIngreso,
    handleGasto,
    tipoTransaccion,
    modalVisible,
    setModalVisible
}: {
    handleIngreso: Function,
    handleGasto: Function,
    tipoTransaccion: string,
    modalVisible: boolean,
    setModalVisible: Function
}) {
    const [cantidad, setCantidad] = useState('');
    const [concepto, setConcepto] = useState('');
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
            await handleIngreso(cantidadNum, concepto, fecha, categoriaSeleccionada || '');
        } else {
            await handleGasto(cantidadNum, concepto, fecha, categoriaSeleccionada || '');
        }

        setCantidad('');
        setConcepto('');
        setCategoriaSeleccionada(null);
        setFecha(new Date());
        setModalVisible(false);
    };

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

                            <TextInput
                                className="border border-gray-300 w-full rounded-lg px-3 py-2 mb-4"
                                placeholder="Concepto (opcional)"
                                value={concepto}
                                onChangeText={setConcepto}
                                style={{ borderWidth: 1, borderColor: '#d1d5db' }}
                            />

                            <TextInput
                                className="border border-gray-300 w-full rounded-lg px-3 py-2 mb-4"
                                placeholder="Cantidad (obligatoria)"
                                value={cantidad}
                                keyboardType='numeric'
                                onChangeText={setCantidad}
                                style={{ borderWidth: 1, borderColor: '#d1d5db' }}
                            />

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
                                            className="text-black"
                                        />
                                        {categorias.map(c => (
                                            <Picker.Item
                                                key={c.id}
                                                label={c.nombre}
                                                value={c.id}
                                                className="text-black"
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
                                style={{ borderWidth: 1, borderColor: '#d1d5db' }}
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
