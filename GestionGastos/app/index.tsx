import RegistroMovimiento from '@/components/RegistroMovimiento';
import { Categoria, Subcategoria } from '@/models/Categoria';
import { Movimiento } from '@/models/Movimiento';
import { getPrimerDiaMes, getUltimoDiaMes } from '@/utils/fechas';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useContext, useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import FormularioMovimiento from '../components/FormularioMovimiento';
import { CategoryContext } from "../context/CategoryContext";



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
  const { categorias } = useContext(CategoryContext) as { categorias: Categoria[] };
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('');
  const [subcategoriaFiltro, setSubcategoriaFiltro] = useState<string>('');

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

  useEffect(() => {
    let filtrados = historicoMovimientos;
    if (categoriaFiltro) {
      filtrados = filtrados.filter(mov => mov.categoria?.id === categoriaFiltro);
    }
    if (subcategoriaFiltro) {
      filtrados = filtrados.filter(mov => mov.subcategoria?.id === subcategoriaFiltro);
    }
    setFilteredHistorico(filtrados);
  }, [categoriaFiltro, subcategoriaFiltro, historicoMovimientos]);

  const subcategoriasDisponibles = categorias.find(cat => cat.id === categoriaFiltro)?.subcategorias || [];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 pt-8">
        {/* Cabecera visual mejorada */}
        <View className="bg-white border-b border-gray-200 mb-2 shadow-sm">
          <View className="flex-row items-center justify-between w-full px-4 py-4">
            <TouchableOpacity
              onPress={mesAnterior}
              className="bg-gray-100 p-2 rounded-full"
            >
              <MaterialIcons name="chevron-left" size={28} color="#374151" />
            </TouchableOpacity>
            <Text className="text-2xl font-extrabold capitalize px-4 text-gray-800">
              {formatearMesAño(mesSeleccionado)}
            </Text>
            <TouchableOpacity
              onPress={mesSiguiente}
              className="bg-gray-100 p-2 rounded-full"
            >
              <MaterialIcons name="chevron-right" size={28} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Tarjetas de saldo, ingresos y gastos */}
          <View className="flex flex-col">
            <View className="w-full px-4 pb-4 flex-row gap-2">
              <View className={`flex-1 rounded-xl p-4 items-center justify-center shadow-md ${saldo >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                <Text className="text-white text-lg font-semibold mb-1">Saldo</Text>
                <Text className="text-white text-xl font-extrabold">{saldo.toFixed(2)}€</Text>
              </View>
              <TouchableOpacity className="flex-1 rounded-xl p-4 items-center justify-center shadow-md bg-green-100" onPress={() => setCurrentTipo('ingreso')}>
                <Text className="text-green-700 text-lg font-semibold mb-1">Ingresos</Text>
                <Text className="text-green-700 text-xl font-bold">+{ingresos.toFixed(2)}€</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 rounded-xl p-4 items-center justify-center shadow-md bg-red-100" onPress={() => setCurrentTipo('gasto')}>
                <Text className="text-red-700 text-lg font-semibold mb-1">Gastos</Text>
                <Text className="text-red-700 text-xl font-bold">-{gastos.toFixed(2)}€</Text>
              </TouchableOpacity>
            </View>
            {currentTipo !== 'all' && (
              <View className='px-4 py-2'>
                <TouchableOpacity
                  className="w-full h-10 rounded-lg items-center justify-center bg-gray-400"
                  onPress={() => setCurrentTipo('all')}
                >
                  <Text className="text-white text-base font-bold">Ver todos los movimientos</Text>
                </TouchableOpacity>
              </View>

            )}
          </View>

          {/* Filtros visuales */}
          <View className="w-full px-4 flex-row gap-2 mb-2">
            <View className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
              <Picker
                selectedValue={categoriaFiltro}
                onValueChange={(itemValue) => {
                  setCategoriaFiltro(itemValue);
                  setSubcategoriaFiltro('');
                }}
              >
                <Picker.Item label="Todas las categorías" value="" />
                {categorias.map(cat => (
                  <Picker.Item key={cat.id} label={cat.nombre} value={cat.id} />
                ))}
              </Picker>
            </View>
            <View className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
              <Picker
                enabled={!!categoriaFiltro}
                selectedValue={subcategoriaFiltro}
                onValueChange={(itemValue) => setSubcategoriaFiltro(itemValue)}
              >
                <Picker.Item label="Todas las subcategorías" value="" />
                {subcategoriasDisponibles.map(sub => (
                  <Picker.Item key={sub.id} label={sub.nombre} value={sub.id} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Lista de movimientos */}
        <ScrollView className="w-full px-4 pb-32">
          {gastosMensuales.length === 0 ? (
            <View className="items-center justify-center mt-10">
              <MaterialIcons name="hourglass-empty" size={48} color="#9CA3AF" />
              <Text className="text-gray-400 mt-2">No hay movimientos para este mes y filtro</Text>
            </View>
          ) : (
            gastosMensuales.map((ingreso) => (
              <RegistroMovimiento key={ingreso.id} movimiento={ingreso} setMovimiento={setMovimiento} handleAddMovimiento={handleAddMovimiento} />
            ))
          )}
        </ScrollView>
      </View>
      {/* Botones de añadir fijos, fuera del área de tarjetas */}
      <View className="absolute bottom-0 left-0 right-0 flex-row justify-center gap-10 pb-8 bg-transparent z-10">
        <TouchableOpacity
          className="w-16 h-16 rounded-full bg-red-500 items-center justify-center shadow-2xl border-4 border-white"
          onPress={() => {
            handleAddMovimiento('gasto');
          }}
        >
          <MaterialIcons name="remove" size={36} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          className="w-16 h-16 rounded-full bg-green-500 items-center justify-center shadow-2xl border-4 border-white"
          onPress={() => {
            handleAddMovimiento('ingreso');
          }}
        >
          <MaterialIcons name="add" size={36} color="#fff" />
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

