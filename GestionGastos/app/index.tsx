import RegistroMovimiento from '@/components/RegistroMovimiento';
import { Categoria, Subcategoria } from '@/models/Categoria';
import { Movimiento } from '@/models/Movimiento';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import FormularioMovimiento from '../components/FormularioMovimiento';

export default function Index() {
  const [gastos, setGastos] = useState<number>(0);
  const [ingresos, setIngresos] = useState<number>(0);
  const [saldo, setSaldo] = useState<number>(0);
  const [historicoMovimientos, setHistoricoMovimientos] = useState<Movimiento[]>([]);
  const [filteredHistorico, setFilteredHistorico] = useState<Movimiento[]>([]);
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date());
  const [gastosMensuales, setGastosMensuales] = useState<Movimiento[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoTransaccion, setTipoTransaccion] = useState<'ingreso' | 'gasto'>('ingreso');
  const [currentTipo, setCurrentTipo] = useState<'ingreso' | 'gasto' | 'all'>('all');
  const [movimiento, setMovimiento] = useState<Movimiento | null>(null);

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
      const nuevoGasto: Movimiento = {
        id: gasto ? gasto.id : Date.now().toString(),
        concepto,
        descripcion,
        cantidad: cantidad > 0 ? -cantidad : cantidad,
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

    //Obtenemos los gastos del mes
    let gastosFiltrados = filteredHistorico.filter(ingreso => {
      const fechaIngreso = new Date(ingreso.fecha);
      return fechaIngreso >= primerDia && fechaIngreso <= ultimoDia;
    });

    //Ordenamos los gastod de más a menos recientes
    const ordered = gastosFiltrados.sort((a: Movimiento, b: Movimiento) => {
      const fechaA = new Date(a.fecha).getTime();
      const fechaB = new Date(b.fecha).getTime();
      return fechaB - fechaA;
    });

    setGastosMensuales(ordered);

    gastosFiltrados = historicoMovimientos.filter(ingreso => {
      const fechaIngreso = new Date(ingreso.fecha);
      return fechaIngreso >= primerDia && fechaIngreso <= ultimoDia;
    });

    const totalIngresosMes = gastosFiltrados
      .filter(ing => ing.cantidad > 0)
      .reduce((sum, ing) => sum + ing.cantidad, 0);

    const totalGastosMes = gastosFiltrados
      .filter(ing => ing.cantidad < 0)
      .reduce((sum, ing) => sum + Math.abs(ing.cantidad), 0);

    //Calculamos ingresos, gastos y saldo del mes
    setIngresos(totalIngresosMes);
    setGastos(totalGastosMes);
    setSaldo(totalIngresosMes - totalGastosMes);
  }, [mesSeleccionado, filteredHistorico]);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (historicoMovimientos) {
      setFilteredHistorico(historicoMovimientos);
    }
  }, [historicoMovimientos]);

  useEffect(() => {
    if (currentTipo === 'ingreso') {
      const filtered = historicoMovimientos.filter((historico) => {
        if (historico.cantidad > 0) {
          return historico;
        }
      });
      setFilteredHistorico(filtered);
    } else if (currentTipo === 'gasto') {
      const filtered = historicoMovimientos.filter((historico) => {
        if (historico.cantidad < 0) {
          return historico;
        }
      });
      setFilteredHistorico(filtered);
    } else if (currentTipo === 'all') {
      setFilteredHistorico(historicoMovimientos);
    }
  }, [currentTipo]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 pt-8">
        <View className="bg-white border-b border-gray-200 mb-2">
          <View className="flex-row items-center justify-between w-full px-4 py-4">
            <TouchableOpacity
              onPress={mesAnterior}
              className="bg-gray-100 p-2 rounded-full"
            >
              <MaterialIcons name="chevron-left" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold capitalize px-4">
              {formatearMesAño(mesSeleccionado)}
            </Text>
            <TouchableOpacity
              onPress={mesSiguiente}
              className="bg-gray-100 p-2 rounded-full"
            >
              <MaterialIcons name="chevron-right" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <View className="w-full px-4 pb-4">
            <View className={`${saldo >= 0 ? 'bg-green-600' : 'bg-red-500'} w-full h-12 rounded-lg items-center justify-center mb-2`}>
              <Text className="text-white text-2xl">Saldo {saldo.toFixed(2)}€</Text>
            </View>

            <View className="flex-row justify-between gap-2">
              <TouchableOpacity
                className={`${currentTipo === 'ingreso' ? 'bg-green-600' : 'bg-green-500'} flex-1 h-12 rounded-lg items-center justify-center`}
                onPress={() => setCurrentTipo('ingreso')}
              >
                <Text className="text-white text-lg">Ingresos</Text>
                <Text className="text-white text-xl font-bold">+{ingresos.toFixed(2)}€</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`${currentTipo === 'gasto' ? 'bg-red-600' : 'bg-red-500'} flex-1 h-12 rounded-lg items-center justify-center`}
                onPress={() => setCurrentTipo('gasto')}
              >
                <Text className="text-white text-lg">Gastos</Text>
                <Text className="text-white text-xl font-bold">-{gastos.toFixed(2)}€</Text>
              </TouchableOpacity>
            </View>

            {currentTipo !== 'all' && (
              <TouchableOpacity
                className="mt-2 bg-gray-500 h-10 rounded-lg items-center justify-center"
                onPress={() => setCurrentTipo('all')}
              >
                <Text className="text-white text-base">Ver todos los movimientos</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView className="w-full px-4 pb-30">
          {gastosMensuales.map((ingreso) => (
            <RegistroMovimiento key={ingreso.id} movimiento={ingreso} setMovimiento={setMovimiento} handleAddMovimiento={handleAddMovimiento} />
          ))}
        </ScrollView>
      </View>
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

      <FormularioMovimiento
        handleIngreso={handleIngreso}
        handleGasto={handleGasto}
        tipoTransaccion={tipoTransaccion}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        handleDeleteMovimiento={handleDeleteMovimiento}
        movimiento={movimiento}
        setMovimiento={setMovimiento}
        setTipoTransaccion={setTipoTransaccion}
      />
    </SafeAreaView >
  );
}

