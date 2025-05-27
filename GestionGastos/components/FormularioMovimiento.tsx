import { CategoryContext } from '@/context/CategoryContext';
import { Categoria, Subcategoria } from '@/models/Categoria';
import { Movimiento } from '@/models/Movimiento';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import FormularioCategoria from './FormularioCategoria';
import ModalConfirmacion from './ModalConfirmacion';
import TicketScanner from './TicketScanner';

export default function FormularioMovimiento({
    handleIngreso,
    handleGasto,
    tipoTransaccion,
    modalVisible,
    setModalVisible,
    movimiento,
    handleDeleteMovimiento,
    setMovimiento,
    setTipoTransaccion
}: {
    handleIngreso: Function,
    handleGasto: Function,
    tipoTransaccion: string,
    modalVisible: boolean,
    setModalVisible: Function,
    movimiento: Movimiento | null,
    handleDeleteMovimiento: Function,
    setMovimiento: Function,
    setTipoTransaccion: Function
}) {
    const [cantidad, setCantidad] = useState('');
    const [concepto, setConcepto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fecha, setFecha] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const { categorias } = useContext(CategoryContext) as {
        categorias: Categoria[];
        handleAddCategoria: Function;
        handleUpdateCategoria: Function;
    };
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
    const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState<Subcategoria | null>(null);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [duplicate, setDuplicate] = useState(false);

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
        let movimientoActual = movimiento;
        if (duplicate) {
            movimientoActual = null;
        }

        if (tipoTransaccion === 'ingreso') {
            await handleIngreso(cantidadNum, concepto, descripcion, fecha, categoriaSeleccionada, subcategoriaSeleccionada, movimientoActual);
        } else {
            await handleGasto(cantidadNum, concepto, descripcion, fecha, categoriaSeleccionada, subcategoriaSeleccionada, movimientoActual);
        }

        //Limpiamos el formulario
        setCantidad('');
        setConcepto('');
        setCategoriaSeleccionada(null);
        setSubcategoriaSeleccionada(null);
        setFecha(new Date());
        setModalVisible(false);
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

    const handleClose = () => {
        //Limpiamos el formulario
        setCantidad('');
        setConcepto('');
        setCategoriaSeleccionada(null);
        setSubcategoriaSeleccionada(null);
        setFecha(new Date());
        setMovimiento(null)
        setModalVisible(false);
    }

    const handleTicketScanned = (data: { concepto: string, cantidad: number, fecha: Date }) => {
        setShowScanner(false);
        setConcepto(data.concepto);
        setCantidad(data.cantidad.toString());
        setFecha(data.fecha);
    };

    const handleDuplicate = () => {
        setDuplicate(true);
    }

    const confirmDuplicate = () => {
        handleSubmit();
    }

    useEffect(() => {
        if (movimiento && modalVisible) {
            setCantidad(Math.abs(movimiento.cantidad).toString());
            setConcepto(movimiento.concepto);
            setDescripcion(movimiento.descripcion || '');
            setFecha(new Date(movimiento.fecha));

            const categoriaEncontrada = categorias.find(cat => cat.id === movimiento.categoria?.id);
            if (categoriaEncontrada) {
                setCategoriaSeleccionada(categoriaEncontrada);

                if (movimiento.subcategoria) {
                    const subcategoriaEncontrada = categoriaEncontrada.subcategorias?.find(
                        sub => sub.id === movimiento.subcategoria?.id
                    );
                    setSubcategoriaSeleccionada(subcategoriaEncontrada || null);
                }
            }
        } else {
            setCantidad('');
            setConcepto('');
            setCategoriaSeleccionada(null);
            setSubcategoriaSeleccionada(null);
            setFecha(new Date());
            setMovimiento(null)
        }
    }, [movimiento, categorias, modalVisible]);

    return (
        <>
            <Modal
                transparent={true}
                animationType='fade'
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-black/60 justify-center px-4">
                    <View className="bg-white rounded-2xl p-6 shadow-xl">
                        <View className="flex-row justify-between items-center mb-6">
                            <View className="flex-row items-center">
                                <TouchableOpacity
                                    onPress={handleClose}
                                    className="p-2 mr-2"
                                >
                                    <MaterialIcons name="close" size={24} color="#374151" />
                                </TouchableOpacity>
                                <Text className="text-2xl font-bold text-gray-800">
                                    {tipoTransaccion === 'ingreso' ? 'Nuevo Ingreso' : 'Nuevo Gasto'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                className="bg-blue-600 p-4 rounded-full shadow-lg flex-row items-center space-x-2"
                                onPress={() => setShowScanner(true)}
                            >
                                <MaterialIcons name="receipt" size={24} color="white" />
                                <Text className="text-white font-medium">Escanear</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView className='max-h-[600px]' showsVerticalScrollIndicator={true}>
                            <View className="mb-6">
                                <Text className="text-gray-700 font-medium mb-2">
                                    Tipo de Transacción
                                </Text>
                                <View className="flex-row space-x-4 gap-2">
                                    <TouchableOpacity
                                        className={`flex-1 border-2 rounded-xl px-4 py-3 ${tipoTransaccion === 'gasto' ? 'bg-red-500 border-red-500' : 'border-gray-300'}`}
                                        onPress={() => {
                                            setTipoTransaccion('gasto');
                                            if (cantidad) {
                                                setCantidad(Math.abs(parseFloat(cantidad)).toString());
                                            }
                                        }}
                                    >
                                        <Text className={`text-center font-medium ${tipoTransaccion === 'gasto' ? 'text-white' : 'text-gray-600'}`}>
                                            Gasto
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className={`flex-1 border-2 rounded-xl px-4 py-3 ${tipoTransaccion === 'ingreso' ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
                                        onPress={() => {
                                            setTipoTransaccion('ingreso');
                                            if (cantidad) {
                                                setCantidad(Math.abs(parseFloat(cantidad)).toString());
                                            }
                                        }}
                                    >
                                        <Text className={`text-center font-medium ${tipoTransaccion === 'ingreso' ? 'text-white' : 'text-gray-600'}`}>
                                            Ingreso
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="mb-6">
                                <Text className="text-gray-700 font-medium mb-2">
                                    Cantidad <Text className="text-red-500">*</Text>
                                </Text>
                                <TextInput
                                    className="border-2 border-gray-300 w-full rounded-xl px-4 py-3 text-lg"
                                    placeholder="0.00"
                                    value={cantidad}
                                    keyboardType='numeric'
                                    onChangeText={(text) => {
                                        if (/^\d*\.?\d*$/.test(text)) {
                                            setCantidad(text);
                                        }
                                    }}
                                />
                            </View>

                            <View className="mb-6">
                                <Text className="text-gray-700 font-medium mb-2">
                                    Concepto
                                </Text>
                                <TextInput
                                    className="border-2 border-gray-300 w-full rounded-xl px-4 py-3"
                                    placeholder="¿En qué has gastado?"
                                    value={concepto}
                                    onChangeText={setConcepto}
                                />
                            </View>

                            <View className="mb-6">
                                <Text className="text-gray-700 font-medium mb-2">
                                    Fecha <Text className="text-red-500">*</Text>
                                </Text>
                                <TouchableOpacity
                                    className="border-2 border-gray-300 rounded-xl px-4 py-3"
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text className="text-gray-700">{fecha.toLocaleDateString()}</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="mb-6">
                                <Text className="text-gray-700 font-medium mb-2">
                                    Descripción
                                </Text>
                                <TextInput
                                    className="border-2 border-gray-300 w-full rounded-xl px-4 py-3"
                                    placeholder="Añade una descripción (opcional)"
                                    value={descripcion}
                                    onChangeText={setDescripcion}
                                    multiline={true}
                                    numberOfLines={3}
                                />
                            </View>

                            <View className="mb-6">
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-gray-700 font-medium">
                                        Categoría
                                    </Text>
                                    <TouchableOpacity
                                        className="bg-blue-500 px-4 py-2 rounded-lg shadow-sm"
                                        onPress={() => setShowAddCategory(true)}
                                    >
                                        <Text className="text-white font-medium">
                                            {categoriaSeleccionada ? 'Editar' : 'Añadir'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View className="border-2 border-gray-300 rounded-xl overflow-hidden">
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

                            {categoriaSeleccionada && (
                                <View className="mb-6">
                                    <Text className="text-gray-700 font-medium mb-2">
                                        Subcategorías
                                    </Text>
                                    {categoriaSeleccionada.subcategorias && categoriaSeleccionada.subcategorias.length > 0 && (
                                        <View className="border-2 border-gray-300 rounded-xl overflow-hidden">
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

                        <View className="flex-row justify-between mt-8">
                            {movimiento && (
                                <TouchableOpacity
                                    className="bg-red-500 px-6 py-3 rounded-xl shadow-sm"
                                    onPress={handleDelete}
                                >
                                    <Text className="text-white font-medium">Eliminar</Text>
                                </TouchableOpacity>
                            )}

                            {movimiento && (
                                <TouchableOpacity
                                    className="bg-blue-500 px-6 py-3 rounded-xl shadow-sm"
                                    onPress={handleDuplicate}
                                >
                                    <Text className="text-white font-medium">Duplicar</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                className="bg-green-600 px-6 py-3 rounded-xl shadow-sm"
                                onPress={handleSubmit}
                            >
                                <Text className="text-white font-medium">Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <Modal
                    transparent={false}
                    animationType='slide'
                    visible={showScanner}
                    onRequestClose={() => setShowScanner(false)}
                >
                    <View className="flex-1">
                        <View className="flex-row justify-between p-4 bg-white shadow-md">
                            <TouchableOpacity
                                className="bg-gray-400 px-4 py-2 rounded-lg"
                                onPress={() => setShowScanner(false)}
                            >
                                <Text className="text-white font-medium">Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                        <TicketScanner onTicketProcessed={handleTicketScanned} />
                    </View>
                </Modal>

                <ModalConfirmacion
                    visible={duplicate}
                    onClose={() => setDuplicate(false)}
                    onConfirm={confirmDuplicate}
                    titulo="Confirmar duplicación"
                    mensaje="¿Estás seguro de que quieres duplicar este movimiento?"
                    textoConfirmar="Duplicar"
                />

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
