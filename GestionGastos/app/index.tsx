import RegistroMovimiento from '@/components/RegistroMovimiento';
import { Categoria, Subcategoria } from '@/models/Categoria';
import { Movimiento } from '@/models/Movimiento';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useContext, useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import FormularioMovimiento from '../components/FormularioMovimiento';
import { CategoryContext } from "../context/CategoryContext";

export default function Index() {
  const [gastos, setGastos] = useState<number>(0);
  const [ingresos, setIngresos] = useState<number>(0);
  const [saldo, setSaldo] = useState<number>(0);
  const [historicoMovimientos, setHistoricoMovimientos] = useState<Movimiento[]>([]);
  const [filteredHistorico, setFilteredHistorico] = useState<Movimiento[]>([]);
  const [fechaInicio, setFechaInicio] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  });
  const [fechaFin, setFechaFin] = useState<Date>(new Date());
  const [showDatePickerInicio, setShowDatePickerInicio] = useState(false);
  const [showDatePickerFin, setShowDatePickerFin] = useState(false);
  const [gastosMensuales, setGastosMensuales] = useState<Movimiento[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoTransaccion, setTipoTransaccion] = useState<'ingreso' | 'gasto'>('ingreso');
  const [currentTipo, setCurrentTipo] = useState<'ingreso' | 'gasto' | 'all'>('all');
  const [movimiento, setMovimiento] = useState<Movimiento | null>(null);
  const { categorias } = useContext(CategoryContext) as { categorias: Categoria[] };
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('');
  const [subcategoriaFiltro, setSubcategoriaFiltro] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const cargarDatos = async () => {
    try {
      //await AsyncStorage.clear();
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

  const handleMovimiento = async (
    tipo: 'ingreso' | 'gasto',
    cantidad: number,
    concepto: string,
    descripcion: string,
    fecha: Date,
    categoria: Categoria,
    subcategoria: Subcategoria,
    movimientoExistente: Movimiento | null
  ) => {
    try {
      // Si es gasto, la cantidad debe ser negativa
      const cantidadFinal = tipo === 'gasto'
        ? (cantidad > 0 ? -cantidad : cantidad)
        : cantidad;

      console.log(fecha);

      const nuevoMovimiento: Movimiento = {
        id: movimientoExistente ? movimientoExistente.id : Date.now().toString(),
        concepto,
        descripcion,
        cantidad: cantidadFinal,
        fecha: fecha.toISOString(),
        categoria,
        subcategoria
      };

      let nuevoHistorico: Movimiento[];
      if (!movimientoExistente) {
        nuevoHistorico = [...historicoMovimientos, nuevoMovimiento];
      } else {
        nuevoHistorico = historicoMovimientos.map((current) =>
          current.id === movimientoExistente.id ? nuevoMovimiento : current
        );
      }

      await AsyncStorage.setItem('historico', JSON.stringify(nuevoHistorico));
      setHistoricoMovimientos(nuevoHistorico);

      // Totales
      const totalIngresos = nuevoHistorico
        .filter(mov => mov.cantidad > 0)
        .reduce((sum, mov) => sum + mov.cantidad, 0);

      const totalGastos = nuevoHistorico
        .filter(mov => mov.cantidad < 0)
        .reduce((sum, mov) => sum + Math.abs(mov.cantidad), 0);

      setIngresos(totalIngresos);
      setGastos(totalGastos);
      setSaldo(totalIngresos - totalGastos);
    } catch (error) {
      console.error('Error al guardar movimiento:', error);
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

  useEffect(() => {
    let gastosFiltrados = filteredHistorico.filter(movimiento => {
      const fechaMovimiento = new Date(movimiento.fecha);
      // Ajustamos las fechas para incluir el día completo
      const fechaInicioAjustada = new Date(fechaInicio);
      fechaInicioAjustada.setHours(0, 0, 0, 0);

      const fechaFinAjustada = new Date(fechaFin);
      fechaFinAjustada.setHours(23, 59, 59, 999);

      return fechaMovimiento >= fechaInicioAjustada && fechaMovimiento <= fechaFinAjustada;
    });

    const ordered = gastosFiltrados.sort((a: Movimiento, b: Movimiento) => {
      const fechaA = new Date(a.fecha).getTime();
      const fechaB = new Date(b.fecha).getTime();
      return fechaB - fechaA;
    });

    setGastosMensuales(ordered);
    // Calculamos los totales usando todos los movimientos del rango de fechas
    const movimientosEnRango = historicoMovimientos.filter(movimiento => {
      const fechaMovimiento = new Date(movimiento?.fecha);
      // Ajustamos las fechas para incluir el día completo
      const fechaInicioAjustada = new Date(fechaInicio);
      fechaInicioAjustada.setHours(0, 0, 0, 0);

      const fechaFinAjustada = new Date(fechaFin);
      fechaFinAjustada.setHours(23, 59, 59, 999);

      return fechaMovimiento >= fechaInicioAjustada && fechaMovimiento <= fechaFinAjustada;
    });

    const totalIngresosPeriodo = movimientosEnRango
      .filter(mov => mov.cantidad > 0)
      .reduce((sum, mov) => sum + mov.cantidad, 0);

    const totalGastosPeriodo = movimientosEnRango
      .filter(mov => mov.cantidad < 0)
      .reduce((sum, mov) => sum + Math.abs(mov.cantidad), 0);

    setIngresos(totalIngresosPeriodo);
    setGastos(totalGastosPeriodo);
    setSaldo(totalIngresosPeriodo - totalGastosPeriodo);
  }, [fechaInicio, fechaFin, filteredHistorico, historicoMovimientos]);

  useEffect(() => {
    cargarDatos();
  }, [categorias]);

  useEffect(() => {
    if (historicoMovimientos) {
      setFilteredHistorico(historicoMovimientos);
    }
  }, [historicoMovimientos]);

  useEffect(() => {
    let filtered;
    if (currentTipo === 'ingreso') {
      filtered = historicoMovimientos.filter((historico) => {
        if (historico.cantidad > 0) {
          return historico;
        }
      });
    } else if (currentTipo === 'gasto') {
      filtered = historicoMovimientos.filter((historico) => {
        if (historico.cantidad < 0) {
          return historico;
        }
      });
    } else if (currentTipo === 'all') {
      filtered = historicoMovimientos;
    }

    if (search !== '') {
      filtered = filtered?.filter((historico) => {
        const searchLower = search.toLowerCase();
        if (categoriaFiltro) {
          if (historico.categoria?.id !== categoriaFiltro) {
            return false;
          }
        }
        return (
          historico.concepto.toLowerCase().includes(searchLower) ||
          historico.descripcion?.toLowerCase().includes(searchLower)
        );
      });
    }

    setFilteredHistorico(filtered || []);
  }, [currentTipo, search, historicoMovimientos]);

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

  //Función para agrupar los movimientos en una misma fecha
  const agruparMovimientosPorFecha = (movimientos: Movimiento[]) => {
    const grupos = movimientos.reduce((acc: { [key: string]: Movimiento[] }, movimiento) => {
      const fecha = new Date(movimiento.fecha).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      if (!acc[fecha]) {
        acc[fecha] = [];
      }
      acc[fecha].push(movimiento);
      return acc;
    }, {});

    return Object.entries(grupos).sort((a, b) => {
      return new Date(b[0]).getTime() - new Date(a[0]).getTime();
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 pt-8">
        {/* Cabecera visual mejorada */}
        <View className="bg-white border-b border-gray-200 mb-2 shadow-sm">
          {/* Date Range Selector - More compact */}
          <View className="flex-row items-center justify-between w-full px-3 py-2">
            <TouchableOpacity
              onPress={() => setShowDatePickerInicio(true)}
              className="flex-1 bg-gray-100 p-2 rounded-lg mr-1"
            >
              <Text className="text-gray-600 text-xs mb-0.5">Desde</Text>
              <Text className="text-gray-800 font-semibold text-sm">
                {fechaInicio.toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDatePickerFin(true)}
              className="flex-1 bg-gray-100 p-2 rounded-lg ml-1"
            >
              <Text className="text-gray-600 text-xs mb-0.5">Hasta</Text>
              <Text className="text-gray-800 font-semibold text-sm">
                {fechaFin.toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Balance Cards - More compact */}
          <View className="flex flex-col">
            <View className="w-full px-3 py-2 flex-row gap-1">
              <View className={`flex-1 rounded-lg p-2 items-center justify-center shadow-slate-50`}>
                <Text className={`${saldo >= 0 ? 'text-green-700' : 'text-red-700'} text-sm font-semibold mb-0.5`}>Saldo</Text>
                <Text className={`${saldo >= 0 ? 'text-green-700' : 'text-red-700'} text-base font-extrabold`}>{saldo.toFixed(2)}€</Text>
              </View>
              <TouchableOpacity className="flex-1 rounded-lg p-2 items-center justify-center shadow-md bg-green-100" onPress={() => setCurrentTipo('ingreso')}>
                <Text className="text-green-700 text-sm font-semibold mb-0.5">Ingresos</Text>
                <Text className="text-green-700 text-base font-bold">+{ingresos.toFixed(2)}€</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 rounded-lg p-2 items-center justify-center shadow-md bg-red-100" onPress={() => setCurrentTipo('gasto')}>
                <Text className="text-red-700 text-sm font-semibold mb-0.5">Gastos</Text>
                <Text className="text-red-700 text-base font-bold">-{gastos.toFixed(2)}€</Text>
              </TouchableOpacity>
            </View>
            {currentTipo !== 'all' && (
              <View className='px-3 py-1'>
                <TouchableOpacity
                  className="w-full h-8 rounded-lg items-center justify-center bg-gray-400"
                  onPress={() => setCurrentTipo('all')}
                >
                  <Text className="text-white text-sm font-bold">Ver todos los movimientos</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Filters - More compact */}
          <View className="w-full px-3 py-1 flex-row gap-1">
            <View className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
              <Picker
                selectedValue={categoriaFiltro}
                onValueChange={(itemValue) => {
                  setCategoriaFiltro(itemValue);
                  setSubcategoriaFiltro('');
                }}
              >
                <Picker.Item label="Todas las categorías" value="" />
                {categorias
                  .filter(cat => currentTipo === 'all' || cat.tipo === currentTipo)
                  .map(cat => (
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

          {/* Search - More compact */}
          <View className="relative mb-2 px-3">
            <TextInput
              className="border border-gray-300 w-full rounded-lg pl-8 pr-2 py-1.5"
              placeholder="Buscar movimiento"
              value={search}
              onChangeText={setSearch}
            />
            <MaterialIcons
              name="search"
              size={18}
              color="#9CA3AF"
              className="absolute left-4 top-1.5"
            />
          </View>

          {/* Date Pickers */}
          {showDatePickerInicio && (
            <DateTimePicker
              value={fechaInicio}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePickerInicio(false);
                if (selectedDate) {
                  setFechaInicio(selectedDate);
                  // Si la fecha de inicio es posterior a la fecha fin, actualizamos la fecha fin
                  if (selectedDate > fechaFin) {
                    setFechaFin(selectedDate);
                  }
                }
              }}
            />
          )}

          {showDatePickerFin && (
            <DateTimePicker
              value={fechaFin}
              mode="date"
              display="default"
              minimumDate={fechaInicio}
              onChange={(event, selectedDate) => {
                setShowDatePickerFin(false);
                if (selectedDate) {
                  setFechaFin(selectedDate);
                }
              }}
            />
          )}
        </View>

        <ScrollView className="w-full px-4 pb-32">
          {gastosMensuales.length === 0 ? (
            <View className="items-center justify-center mt-10">
              <MaterialIcons name="hourglass-empty" size={48} color="#9CA3AF" />
              <Text className="text-gray-400 mt-2">{`No hay ${currentTipo === 'gasto' ? 'gastos' : 'ingresos'} para este rango de fechas`}</Text>
            </View>
          ) : (
            agruparMovimientosPorFecha(gastosMensuales).map(([fecha, movimientos]) => (
              <View key={fecha} className="mb-4">
                {/* Encabezado de fecha */}
                <View className="bg-gray-100 px-4 py-2 rounded-lg mb-2">
                  <Text className="text-gray-700 font-semibold capitalize">
                    {fecha}
                  </Text>
                </View>
                {movimientos.map((movimiento) => (
                  <RegistroMovimiento
                    key={movimiento.id}
                    movimiento={movimiento}
                    setMovimiento={setMovimiento}
                    handleAddMovimiento={handleAddMovimiento}
                  />
                ))}
              </View>
            ))
          )}
        </ScrollView>
      </View>
      <View className="absolute bottom-0 right-10 flex-row justify-center gap-10 pb-8 bg-transparent z-10">
        <TouchableOpacity
          className="w-16 h-16 rounded-full bg-green-500 items-center justify-center shadow-2xl"
          onPress={() => {
            handleAddMovimiento('gasto');
          }}
        >
          <MaterialIcons name="add" size={36} color="#fff" />
        </TouchableOpacity>
      </View>

      <FormularioMovimiento
        handleIngreso={handleMovimiento}
        handleGasto={handleMovimiento}
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

