import RegistroMovimiento from '@/components/RegistroMovimiento';
import { Categoria, Subcategoria } from '@/models/Categoria';
import { Movimiento } from '@/models/Movimiento';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import FormularioMovimiento from '../components/FormularioMovimiento';

export default function Index() {
  const [gastos, setGastos] = useState<number>(0);
  const [ingresos, setIngresos] = useState<number>(0);
  const [saldo, setSaldo] = useState<number>(0);
  const [historicoMovimientos, setHistoricoMovimientos] = useState<Movimiento[]>([]);
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
        setHistoricoMovimientos(historico);
        const totalIngresos = historico.reduce((sum: number, ingreso: Movimiento) => sum + ingreso.cantidad, 0);
        setIngresos(totalIngresos);
        setSaldo(totalIngresos - gastos);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const handleAddMovimiento = (tipoTransaccion: 'ingreso' | 'gasto') => {
    try {
      setTipoTransaccion(tipoTransaccion);
      setModalVisible(true);
    } catch (error) {
      console.log(error);
    }
  }

  const handleIngreso = async (cantidad: number, concepto: string, descripcion: string, fecha: Date, categoria: Categoria, subcategoria: Subcategoria, ingreso: Movimiento) => {
    try {
      const nuevoIngreso: Movimiento = {
        id: ingreso ? ingreso.id : Date.now().toString(),
        concepto,
        descripcion,
        cantidad: cantidad,
        fecha: fecha.toISOString(),
        categoria,
        subcategoria
      };

      let nuevoHistorico: Movimiento[];
      if (!ingreso) {
        nuevoHistorico = [...historicoMovimientos, nuevoIngreso];
      } else {
        nuevoHistorico = historicoMovimientos.map((current) =>
          current.id === ingreso.id ? nuevoIngreso : current
        );
      }

      await AsyncStorage.setItem('historico', JSON.stringify(nuevoHistorico));
      setHistoricoMovimientos(nuevoHistorico);

      const totalIngresos = nuevoHistorico
        .filter(ing => ing.cantidad > 0)
        .reduce((sum, ing) => sum + ing.cantidad, 0);

      const totalGastos = nuevoHistorico
        .filter(ing => ing.cantidad < 0)
        .reduce((sum, ing) => sum + Math.abs(ing.cantidad), 0);

      setIngresos(totalIngresos);
      setGastos(totalGastos);
      setSaldo(totalIngresos - totalGastos);
    } catch (error) {
      console.error('Error al guardar ingreso:', error);
    }
  };

  const handleGasto = async (cantidad: number, concepto: string, descripcion: string, fecha: Date, categoria: Categoria, subcategoria: Subcategoria, gasto: Movimiento) => {
    try {
      console.log("gasto", gasto);
      console.log(cantidad);
      const nuevoGasto: Movimiento = {
        id: gasto ? gasto.id : Date.now().toString(),
        concepto,
        descripcion,
        cantidad: gasto ? cantidad : -cantidad,
        fecha: fecha.toISOString(),
        categoria,
        subcategoria
      };

      let nuevoHistorico: Movimiento[];
      if (!gasto) {
        nuevoHistorico = [...historicoMovimientos, nuevoGasto];
      } else {
        nuevoHistorico = historicoMovimientos.map((current) =>
          current.id === gasto.id ? nuevoGasto : current
        );
      }

      await AsyncStorage.setItem('historico', JSON.stringify(nuevoHistorico));
      setHistoricoMovimientos(nuevoHistorico);

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

  const handleDeleteMovimiento = async (movimiento: Movimiento) => {
    try {
      const nuevoHistorico = historicoMovimientos.filter((current) => {
        if (current.id !== movimiento.id) {
          return current;
        }
      });
      await AsyncStorage.setItem('historico', JSON.stringify(nuevoHistorico));
      setHistoricoMovimientos(nuevoHistorico);
      setMovimiento(null);
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

  useEffect(() => {
    const primerDia = getPrimerDiaMes(mesSeleccionado);
    const ultimoDia = getUltimoDiaMes(mesSeleccionado);

    const gastosFiltrados = historicoMovimientos.filter(ingreso => {
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
  }, [mesSeleccionado, historicoMovimientos]);

  useEffect(() => {
    cargarDatos();
  }, []);

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
          <View className={`${saldo >= 0 ? 'bg-green-600' : 'bg-red-500'} w-full h-12 rounded-lg items-center justify-center mb-2`}>
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

        <ScrollView className="mt-4 w-full px-4">
          {gastosMensuales.map((ingreso) => (
            <RegistroMovimiento key={ingreso.id} movimiento={ingreso} setMovimiento={setMovimiento} handleAddMovimiento={handleAddMovimiento} />
          ))}
        </ScrollView>
      </View>

      <FormularioMovimiento
        handleIngreso={handleIngreso}
        handleGasto={handleGasto}
        tipoTransaccion={tipoTransaccion}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        handleDeleteMovimiento={handleDeleteMovimiento}
        movimiento={movimiento}
      />

      <View className="absolute bottom-5 left-0 right-0 flex-row justify-between px-10 pb-6">
        <TouchableOpacity
          className="w-16 h-16 rounded-full bg-red-500 items-center justify-center shadow-lg"
          onPress={() => {
            handleAddMovimiento('gasto');
          }}
        >
          <Text className="text-3xl font-bold text-white">-</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-16 h-16 rounded-full bg-green-500 items-center justify-center shadow-lg"
          onPress={() => {
            handleAddMovimiento('ingreso');
          }}
        >
          <Text className="text-3xl font-bold text-white">+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

