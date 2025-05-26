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
  const [historico, setHistorico] = useState<Movimiento[]>([]);
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date());
  const [gastosMensuales, setGastosMensuales] = useState<Movimiento[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoTransaccion, setTipoTransaccion] = useState<'ingreso' | 'gasto'>('ingreso');
  const [movimiento, setMovimiento] = useState<Movimiento>(null);

  const cargarDatos = async () => {
    try {
      const historicoGuardado = await AsyncStorage.getItem('historico');
      if (historicoGuardado !== null) {
        const historico = JSON.parse(historicoGuardado);
        setHistorico(historico);
        const totalIngresos = historico.reduce((sum: number, ingreso: Movimiento) => sum + ingreso.cantidad, 0);
        setIngresos(totalIngresos);
        setSaldo(totalIngresos - gastos);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  //Función para crear y editar un ingreso
  const handleIngreso = async (ingreso: number, concepto: string, descripcion: string, fecha: Date, categoria: Categoria, movimiento: Movimiento) => {
    try {
      const nuevoIngreso: Movimiento = {
        id: Date.now().toString(),
        concepto,
        cantidad: ingreso,
        descripcion,
        fecha: fecha.toISOString(),
        categoria
      };
      let nuevoHistorico;
      if (!movimiento) {
        nuevoHistorico = [...historico, nuevoIngreso];
      } else {
        nuevoHistorico = historico.map((historico) => {
          if (historico.id === movimiento.id) {
            return nuevoIngreso;
          } else {
            return historico;
          }
        }) as Movimiento[];
      }
      await AsyncStorage.setItem('historico', JSON.stringify(nuevoHistorico));
      setHistorico(nuevoHistorico);

      const totalIngresos = nuevoHistorico.reduce((sum, ing) => sum + ing.cantidad, 0);
      setIngresos(totalIngresos);
      setSaldo(totalIngresos - gastos);

    } catch (error) {
      console.error('Error al guardar ingreso:', error);
    }
  };

  //Función para crear y editar un gasto
  const handleGasto = async (cantidad: number, concepto: string, descripcion: string, fecha: Date, categoria: Categoria, movimiento: Movimiento) => {
    try {
      const nuevoGasto: Movimiento = {
        id: movimiento ? movimiento.id : Date.now().toString(),
        concepto,
        cantidad: movimiento ? cantidad : -cantidad,
        descripcion,
        fecha: fecha.toISOString(),
        categoria
      };

      let nuevoHistorico;
      if (!movimiento) {
        nuevoHistorico = [...historico, nuevoGasto];
      } else {
        nuevoHistorico = historico.map((historico) => {
          if (historico.id === movimiento.id) {
            return nuevoGasto;
          } else {
            return historico;
          }
        }) as Movimiento[];
      }

      await AsyncStorage.setItem('historico', JSON.stringify(nuevoHistorico));
      setHistorico(nuevoHistorico);

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

  //Función para eliminar un movimiento
  const handleDeleteMovimiento = async (movimiento: Movimiento) => {
    try {
      const nuevoHistorico = historico.filter(historico => historico.id !== movimiento.id);

      await AsyncStorage.setItem('historico', JSON.stringify(nuevoHistorico));
      setHistorico(nuevoHistorico);
      setMovimiento(null);
      setModalVisible(false);

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
      console.log(error);
    }
  }

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

  const handleAddMovimiento = (tipo: 'ingreso' | 'gasto') => {
    try {
      setTipoTransaccion(tipo);
      setModalVisible(true);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const primerDia = getPrimerDiaMes(mesSeleccionado);
    const ultimoDia = getUltimoDiaMes(mesSeleccionado);

    const gastosFiltrados = historico.filter(ingreso => {
      if (!ingreso?.fecha) return false;
      const fechaIngreso = new Date(ingreso.fecha);
      return !isNaN(fechaIngreso.getTime()) &&
        fechaIngreso >= primerDia &&
        fechaIngreso <= ultimoDia;
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
  }, [mesSeleccionado, historico]);

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

        <View className="w-full px-4 mb-4">
          <View className="bg-green-600 w-full h-12 rounded-lg items-center justify-center mb-2">
            <Text className="text-white text-2xl">Saldo {saldo}€</Text>
          </View>

          <View className="flex-row justify-between gap-2">
            <View className="bg-green-500 flex-1 h-12 rounded-lg items-center justify-center">
              <Text className="text-white text-lg">Ingresos</Text>
              <Text className="text-white text-xl font-bold">+{ingresos}€</Text>
            </View>

            <View className="bg-red-500 flex-1 h-12 rounded-lg items-center justify-center">
              <Text className="text-white text-lg">Gastos</Text>
              <Text className="text-white text-xl font-bold">-{gastos}€</Text>
            </View>
          </View>
        </View>

        {/* Mostrar histórico de ingresos y gastos del mes */}
        <ScrollView className="mt-4 w-full px-4">
          {gastosMensuales.map((ingreso) => (
            <RegistroMovimiento key={ingreso.id} movimiento={ingreso} handleAddMovimiento={handleAddMovimiento} setMovimiento={setMovimiento} />
          ))}
        </ScrollView>
      </View>

      <FormularioMovimiento
        handleIngreso={handleIngreso}
        handleGasto={handleGasto}
        tipoTransaccion={tipoTransaccion}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        movimiento={movimiento}
        handleDeleteMovimiento={handleDeleteMovimiento}
      />

      <View className="absolute bottom-5 left-0 right-0 flex-row justify-between px-16 pb-16">
        <TouchableOpacity
          className="w-16 h-16 rounded-full bg-red-500 items-center justify-center shadow-lg"
          onPress={() => handleAddMovimiento('gasto')}
        >
          <Text className="text-3xl font-bold text-white">-</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-16 h-16 rounded-full bg-green-500 items-center justify-center shadow-lg"
          onPress={() => handleAddMovimiento('ingreso')}
        >
          <Text className="text-3xl font-bold text-white">+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

