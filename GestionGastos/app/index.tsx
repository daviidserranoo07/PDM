import RegistroMovimiento from '@/components/RegistroMovimiento';
import { Categoria } from '@/models/Categoria';
import { Movimiento } from '@/models/Movimiento';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import FormularioMovimiento from '../components/FormularioMovimiento';

export default function Index() {
  const [gastos, setGastos] = useState<number>(0);
  const [ingresos, setIngresos] = useState<number>(0);
  const [saldo, setSaldo] = useState<number>(0);
  const [historicoIngresos, setHistoricoIngresos] = useState<Movimiento[]>([]);
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date());
  const [gastosMensuales, setGastosMensuales] = useState<Movimiento[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoTransaccion, setTipoTransaccion] = useState<'ingreso' | 'gasto'>('ingreso');

  const cargarDatos = async () => {
    try {
      const historicoGuardado = await AsyncStorage.getItem('historicoIngresos');
      if (historicoGuardado !== null) {
        const historico = JSON.parse(historicoGuardado);
        setHistoricoIngresos(historico);
        const totalIngresos = historico.reduce((sum: number, ingreso: Movimiento) => sum + ingreso.cantidad, 0);
        setIngresos(totalIngresos);
        setSaldo(totalIngresos - gastos);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const handleIngreso = async (ingreso: number, concepto: string, fecha: Date, categoria: Categoria) => {
    try {
      console.log(categoria);
      const nuevoIngreso: Movimiento = {
        id: Date.now().toString(),
        concepto,
        cantidad: ingreso,
        fecha: fecha.toISOString(),
        categoria
      };

      const nuevoHistorico = [...historicoIngresos, nuevoIngreso];
      await AsyncStorage.setItem('historicoIngresos', JSON.stringify(nuevoHistorico));
      setHistoricoIngresos(nuevoHistorico);

      const totalIngresos = nuevoHistorico.reduce((sum, ing) => sum + ing.cantidad, 0);
      setIngresos(totalIngresos);
      setSaldo(totalIngresos - gastos);
    } catch (error) {
      console.error('Error al guardar ingreso:', error);
    }
  };

  const handleGasto = async (cantidad: number, concepto: string, fecha: Date, categoria: Categoria) => {
    try {
      const nuevoGasto: Movimiento = {
        id: Date.now().toString(),
        concepto,
        cantidad: -cantidad,
        fecha: fecha.toISOString(),
        categoria
      };

      const nuevoHistorico = [...historicoIngresos, nuevoGasto];
      await AsyncStorage.setItem('historicoIngresos', JSON.stringify(nuevoHistorico));
      setHistoricoIngresos(nuevoHistorico);

      const totalGastos = nuevoHistorico
        .filter(ing => ing.cantidad < 0)
        .reduce((sum, ing) => sum + Math.abs(ing.cantidad), 0);

      const totalIngresos = nuevoHistorico
        .filter(ing => ing.cantidad > 0)
        .reduce((sum, ing) => sum + ing.cantidad, 0);

      setGastos(totalGastos);
      setIngresos(totalIngresos);
      setSaldo(totalIngresos - totalGastos);
    } catch (error) {
      console.error('Error al guardar gasto:', error);
    }
  };

  const getPrimerDiaMes = (fecha: Date) => {
    return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  };

  const getUltimoDiaMes = (fecha: Date) => {
    return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
  };

  const mesAnterior = () => {
    const nuevoMes = new Date(mesSeleccionado);
    nuevoMes.setMonth(nuevoMes.getMonth() - 1);
    setMesSeleccionado(nuevoMes);
  };

  const mesSiguiente = () => {
    const nuevoMes = new Date(mesSeleccionado);
    nuevoMes.setMonth(nuevoMes.getMonth() + 1);
    setMesSeleccionado(nuevoMes);
  };

  const formatearMesAño = (fecha: Date) => {
    return fecha.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  };

  useEffect(() => {
    const primerDia = getPrimerDiaMes(mesSeleccionado);
    const ultimoDia = getUltimoDiaMes(mesSeleccionado);

    const gastosFiltrados = historicoIngresos.filter(ingreso => {
      const fechaIngreso = new Date(ingreso.fecha);
      return fechaIngreso >= primerDia && fechaIngreso <= ultimoDia;
    });

    setGastosMensuales(gastosFiltrados);

    const totalIngresosMes = gastosFiltrados
      .filter(ing => ing.cantidad > 0)
      .reduce((sum, ing) => sum + ing.cantidad, 0);

    const totalGastosMes = gastosFiltrados
      .filter(ing => ing.cantidad < 0)
      .reduce((sum, ing) => sum + Math.abs(ing.cantidad), 0);

    setIngresos(totalIngresosMes);
    setGastos(totalGastosMes);
    setSaldo(totalIngresosMes - totalGastosMes);
  }, [mesSeleccionado, historicoIngresos]);

  return (
    <SafeAreaView className="flex-1 bg-white pt-20">
      <View className="flex-1 items-center justify-center">
        <View className="flex-row items-center justify-between w-full px-4 mb-4">
          <TouchableOpacity onPress={mesAnterior}>
            <Text className="text-2xl">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold capitalize">
            {formatearMesAño(mesSeleccionado)}
          </Text>
          <TouchableOpacity onPress={mesSiguiente}>
            <Text className="text-2xl">→</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-green-600 w-1/3 h-12 rounded-lg items-center justify-center">
          <Text className="text-white text-2xl">Saldo {saldo}€</Text>
        </View>

        {/* Mostrar histórico de ingresos y gastos del mes */}
        <ScrollView className="mt-4 w-full px-4">
          {gastosMensuales.map((ingreso) => (
            <RegistroMovimiento key={ingreso.id} movimiento={ingreso} />
          ))}
        </ScrollView>
      </View>

      <FormularioMovimiento
        handleIngreso={handleIngreso}
        handleGasto={handleGasto}
        tipoTransaccion={tipoTransaccion}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />

      <View className="absolute bottom-5 left-0 right-0 flex-row justify-between px-16 pb-16">
        <TouchableOpacity
          className="w-16 h-16 rounded-full bg-red-500 items-center justify-center shadow-lg"
          onPress={() => {
            setTipoTransaccion('gasto');
            setModalVisible(true);
          }}
        >
          <Text className="text-3xl font-bold text-white">-</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-16 h-16 rounded-full bg-green-500 items-center justify-center shadow-lg"
          onPress={() => {
            setTipoTransaccion('ingreso');
            setModalVisible(true);
          }}
        >
          <Text className="text-3xl font-bold text-white">+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

