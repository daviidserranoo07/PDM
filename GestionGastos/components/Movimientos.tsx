// app/components/TransactionModal.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface TransactionModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: () => void;
    tipoTransaccion: 'ingreso' | 'gasto';
    cantidad: string;
    setCantidad: (value: string) => void;
    concepto: string;
    setConcepto: (value: string) => void;
    fecha: Date;
    setFecha: (date: Date) => void;
    showDatePicker: boolean;
    setShowDatePicker: (show: boolean) => void;
}

export function Movimientos({
    visible,
    onClose,
    onSubmit,
    tipoTransaccion,
    cantidad,
    setCantidad,
    concepto,
    setConcepto,
    fecha,
    setFecha,
    showDatePicker,
    setShowDatePicker,
}: TransactionModalProps) {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-white w-11/12 p-6 rounded-xl">
                    <Text className="text-2xl font-bold mb-4 text-center">
                        {tipoTransaccion === 'ingreso' ? 'Nuevo Ingreso' : 'Nuevo Gasto'}
                    </Text>

                    <View className="flex-row items-center mb-4">
                        <TextInput
                            className="flex-1 border border-gray-300 rounded-lg p-2 mr-2"
                            placeholder="Concepto"
                            value={concepto}
                            onChangeText={setConcepto}
                        />
                    </View>

                    <View className="flex-row items-center mb-4">
                        <TextInput
                            className="flex-1 border border-gray-300 rounded-lg p-2 mr-2"
                            placeholder="Cantidad"
                            value={cantidad}
                            keyboardType='numeric'
                            onChangeText={setCantidad}
                        />
                    </View>

                    <TouchableOpacity
                        className="border border-gray-300 rounded-lg p-2 mb-4"
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text>{fecha.toLocaleDateString()}</Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={fecha}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) {
                                    setFecha(selectedDate);
                                }
                            }}
                        />
                    )}

                    <View className="flex-row justify-between mt-4">
                        <TouchableOpacity
                            className="bg-gray-500 px-6 py-2 rounded-lg"
                            onPress={onClose}
                        >
                            <Text className="text-white">Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-green-500 px-6 py-2 rounded-lg"
                            onPress={onSubmit}
                        >
                            <Text className="text-white">Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}