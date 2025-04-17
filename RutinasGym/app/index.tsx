import CardExercise from "@/components/CardExercise";
import { useEffect, useRef, useState } from "react";
import { Text, View, ScrollView, TouchableOpacity } from "react-native";
import Exercise from "@/models/Excercise";
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatTime } from "@/utils/formatTime";

const initial = [
  {
    id: 1,
    name: 'Prueba',
    description: 'Realizar en press plano',
    elapsedTime: 0,
    order: 1,
    duration: 10,
    start: false,
    paused: false,
    finish: false
  },
  {
    id: 2,
    name: 'Prueba 2',
    description: 'Realizar en press plano',
    elapsedTime: 0,
    order: 2,
    duration: 10,
    start: false,
    paused: false,
    finish: false
  },
  {
    id: 3,
    name: 'Prueba 2',
    description: 'Realizar en press plano',
    elapsedTime: 0,
    order: 3,
    duration: 10,
    start: false,
    paused: false,
    finish: false
  },
  {
    id: 4,
    name: 'Prueba 2',
    description: 'Realizar en press plano',
    elapsedTime: 0,
    order: 4,
    duration: 10,
    start: false,
    paused: false,
    finish: false
  },
  {
    id: 5,
    name: 'Prueba 2',
    description: 'Realizar en press plano',
    elapsedTime: 0,
    order: 5,
    duration: 10,
    start: false,
    paused: false,
    finish: false
  },
  {
    id: 6,
    name: 'Prueba 2',
    description: 'Realizar en press plano',
    elapsedTime: 0,
    order: 6,
    duration: 10,
    start: false,
    paused: false,
    finish: false
  },  
  {
    id: 7,
    name: 'Prueba 2',
    description: 'Realizar en press plano',
    elapsedTime: 0,
    order: 7,
    duration: 10,
    start: false,
    paused: false,
    finish: false
  }
];

const STORAGE_KEY = '@exercises_key';

// Función para calcular el tiempo total
const calculateTotalTime = (exercises: Exercise[]): number => {
    return exercises.reduce((total, exercise) => total + (exercise.elapsedTime || 0), 0);
};

export default function Index() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Cargar ejercicios del storage
  const loadExercises = async () => {
    try {
      const storedExercises = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedExercises !== null) {
        const parsedExercises = JSON.parse(storedExercises);
        setExercises(parsedExercises);
        // Calcular tiempo total
        const totalTime = calculateTotalTime(parsedExercises);
        setTotalElapsedTime(totalTime);
      } else {
        setExercises(initial);
        setTotalElapsedTime(0);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
      setExercises(initial);
      setTotalElapsedTime(0);
    }
  };

  // Guardar ejercicios en storage
  const saveExercises = async (newExercises: Exercise[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newExercises));
    } catch (error) {
      console.error('Error saving exercises:', error);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    if(exercises){
      saveExercises(exercises);
    }
  },[exercises]);

  // useEffect(() => {
  //   saveExercises(initial);
  //   setExercises(initial);
  // },[]);

  // useEffect(() => {
  //   AsyncStorage.clear();
  // },[]);

  useEffect(() => {
    const sortedExercises = [...exercises].sort((a, b) => a.order - b.order);
    if (sortedExercises.length > 0 && sortedExercises[0].start) {
      intervalRef.current = setInterval(() => {
        setTotalElapsedTime((prev) => prev + 1);
      }, 1000);

      return () => {
          if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = undefined;
          }
      };
    }
}, [exercises]);

// Actualizar el tiempo total cuando cambian los ejercicios
useEffect(() => {
    const newTotalTime = calculateTotalTime(exercises);
    setTotalElapsedTime(newTotalTime);
}, [exercises]);

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 w-full px-4">
        <View className="flex-1 min-h-screen py-8">
          <View className="bg-white p-4 mb-4 rounded-lg shadow-sm">
            <View className="flex-row justify-between items-center mb-2">
                <Text className="text-2xl font-bold text-gray-800">
                    Ejercicios
                </Text>
                <Text className="text-base text-gray-600">
                    {new Date().toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}
                </Text>
            </View>
            
            <View className="flex-row justify-between items-center mt-2 bg-gray-50 p-3 rounded-lg">
                <View>
                    <Text className="text-sm text-gray-500">Tiempo total</Text>
                    <Text className="text-lg font-semibold text-blue-600">
                        {formatTime(totalElapsedTime)}
                    </Text>
                </View>
                <View>
                    <Text className="text-sm text-gray-500">Completados</Text>
                    <Text className="text-lg font-semibold text-green-600">
                        {exercises.filter(ex => ex.finish).length}/{exercises.length}
                    </Text>
                </View>
                <View>
                    <Text className="text-sm text-gray-500">En progreso</Text>
                    <Text className="text-lg font-semibold text-yellow-600">
                        {exercises.filter(ex => ex.start && !ex.finish).length}
                    </Text>
                </View>
            </View>
          </View>
          {exercises && exercises.length > 0 ? (
            exercises.map((exercise) => (
              <CardExercise 
                key={exercise.id} 
                currentExercise={exercise} 
                setExercises={setExercises} 
                exercises={exercises}
              />
            ))
          ) : (
            <Text className="text-center">No hay ejercicios</Text>
          )}
        </View>
      </ScrollView>
      
      <TouchableOpacity 
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
      >
        <AntDesign name="plus" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}
