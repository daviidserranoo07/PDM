import { Movimiento } from "@/models/Movimiento";
import { Text, View } from "react-native";

export default function RegistroMovimiento({ movimiento }: { movimiento: Movimiento }) {
    const fecha = new Date(movimiento.fecha);
    const fechaFormateada = fecha instanceof Date && !isNaN(fecha.getTime())
        ? fecha.toLocaleDateString('es-ES')
        : 'Fecha no válida';

    return (
        <View className="flex-row justify-between items-center p-2 border-b border-gray-200 mt-2">
            <View className="flex flex-col gap-2">
                <Text className="font-bold">{movimiento.concepto}</Text>
                <Text>Categoria: {movimiento?.categoria?.nombre}</Text>
                <Text className="text-gray-500">{fechaFormateada}</Text>
            </View>
            <Text className={`font-bold ${movimiento.cantidad > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {movimiento.cantidad > 0 ? '+' : ''}{movimiento.cantidad}€
            </Text>
        </View>
    );
}