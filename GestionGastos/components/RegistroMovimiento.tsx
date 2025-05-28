import { Movimiento } from "@/models/Movimiento";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function RegistroMovimiento({ movimiento, handleAddMovimiento, setMovimiento }: { movimiento: Movimiento, handleAddMovimiento: Function, setMovimiento: Function }) {
    const fecha = new Date(movimiento?.fecha);
    const fechaFormateada = fecha instanceof Date && !isNaN(fecha.getTime())
        ? fecha.toLocaleDateString('es-ES')
        : 'Fecha no válida';

    const handleOnClick = () => {
        handleAddMovimiento(movimiento?.cantidad > 0 ? 'ingreso' : 'gasto');
        setMovimiento(movimiento);
    }

    return (
        <TouchableOpacity
            className="bg-white p-2 rounded-lg mb-2 shadow-sm border border-gray-100"
            onPress={handleOnClick}
        >
            <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-4">
                    <View className="flex-row items-center gap-2 mb-2">
                        <MaterialIcons
                            name={movimiento.cantidad > 0 ? "arrow-upward" : "arrow-downward"}
                            size={20}
                            color={movimiento.cantidad > 0 ? "#16a34a" : "#dc2626"}
                        />
                        {movimiento?.concepto ? (
                            <Text className="font-bold text-md">{movimiento.concepto}</Text>
                        ) : null}
                    </View>

                    <View className="flex flex-row justify-between w-full">
                        <View className="flex-row items-center gap-2 mb-1">
                            {movimiento?.categoria?.nombre ? (
                                <>
                                    <MaterialIcons name="category" size={16} color="#6b7280" />
                                    <Text className="text-gray-600">
                                        <Text>{movimiento.categoria.nombre}</Text>
                                    </Text>
                                </>
                            ) : null}
                        </View>

                        {movimiento?.subcategoria?.nombre ? (
                            <View className="flex-row items-center gap-2 mb-1">
                                <MaterialIcons name="subdirectory-arrow-right" size={16} color="#6b7280" />
                                <Text className="text-gray-600">
                                    <Text>{movimiento.subcategoria.nombre}</Text>
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    {movimiento?.descripcion && (
                        <View className="flex-row items-start gap-2 mt-2">
                            <MaterialIcons name="description" size={16} color="#6b7280" />
                            <Text className="text-gray-600 flex-1">{movimiento.descripcion}</Text>
                        </View>
                    )}
                </View>

                <View className="bg-gray-50 px-3 py-2 rounded-lg">
                    <Text className={`font-bold text-md ${movimiento.cantidad > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {movimiento?.cantidad > 0 ? '+' : ''}{movimiento?.cantidad}€
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}