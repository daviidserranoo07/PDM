import { Movimiento } from "@/models/Movimiento";
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
        <TouchableOpacity className="flex-row justify-between items-center p-2 border-b border-gray-200 mt-2" onPress={handleOnClick}>
            <View>
                <View className="flex flex-col gap-2">
                    <Text className="font-bold">{movimiento?.concepto}</Text>
                    <Text>{movimiento?.categoria?.nombre ? `Categoria: ${movimiento.categoria.nombre}` : 'Sin categoria'}</Text>
                    <Text className="text-gray-500">{fechaFormateada}</Text>
                </View>
                <Text>{movimiento?.descripcion}</Text>
            </View>

            <Text className={`font-bold ${movimiento.cantidad > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {movimiento?.cantidad > 0 ? '+' : ''}{movimiento?.cantidad}€
            </Text>
        </TouchableOpacity>
    );
}