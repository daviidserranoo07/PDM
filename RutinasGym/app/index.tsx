import CardExercise from "@/components/CardExercise";
import { useEffect, useRef, useState } from "react";
import { Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import Exercise from "@/models/Excercise";
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatTime } from "@/utils/formatTime";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import HeadInfoElement from "@/components/HeadInfoElement";

const STORAGE_KEY = '@exercises_key';

// Función para calcular el tiempo total de un array de ejercicios que se le pasa
const calculateTotalTime = (exercises: Exercise[]): number => {
    return exercises.reduce((total, exercise) => total + (exercise.elapsedTime || 0), 0);
};

export default function Index() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

// Función principal para importar ejercicios
const handleImportExercises = async () => {
  try {
      // Seleccionar archivo que quiero importar en la aplicación
      const result = await DocumentPicker.getDocumentAsync({
          type: 'application/json',
          copyToCacheDirectory: true
      });

      // Verificar que se seleccionó un archivo al menos para importar
      if (!result.assets || !result.assets[0]) {
          Alert.alert('Error', 'No se seleccionó ningún archivo');
          return;
      }

      // Leer la información del archivo
      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);

      // Parsear el archivo a JSON
      let exercises;
      try {
          exercises = JSON.parse(fileContent);
      } catch (error) {
          Alert.alert('Error', 'El archivo no contiene un JSON válido');
          return;
      }

      // Compruebo que el JSON tenga un array
      if (!Array.isArray(exercises)) {
          Alert.alert('Error', 'El archivo debe contener un array de ejercicios');
          return;
      }

      // Ordeno los ejecicios por prioridad según su order
      const orderedExercises = [...exercises].sort((a, b) => a.order - b.order);

      // Confirmo que la importación ha sido correcta
      Alert.alert(
          'Confirmar importación',
          `¿Deseas importar ${exercises.length} ejercicios? Esto reemplazará los ejercicios existentes.`,
          [
              {
                  text: 'Cancelar',
                  style: 'cancel'
              },
              {
                  text: 'Importar',
                  onPress: async () => {
                      try {
                          // 10. Guardar en AsyncStorage
                          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(orderedExercises));
                          
                          // 11. Actualizar estado
                          setExercises(orderedExercises);
                          
                          Alert.alert(
                              'Éxito', 
                              `Se importaron ${exercises.length} ejercicios correctamente`
                          );
                      } catch (error) {
                          Alert.alert('Error', 'No se pudieron guardar los ejercicios');
                      }
                  }
              }
          ]
      );

  } catch (error) {
      console.error('Error importing exercises:', error);
      Alert.alert(
          'Error', 
          'Ocurrió un error al importar los ejercicios'
      );
  }
};

  // Cargar ejercicios del async storage 
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
        setExercises([]);
        setTotalElapsedTime(0);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
      setExercises([]);
      setTotalElapsedTime(0);
    }
  };

  // Función para exportar ejercicios a JSON
  const handleDownloadExercises = async () => {
    try {
        // Crear el contenido JSON con formato legible
        const exercisesJson = JSON.stringify(exercises, null, 2);
        
        // Crear el archivo con el nombre de la fecha de hoy
        const date = new Date();
        const fileName = `ejercicios_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.json`;
        
        // Ruta completa del archivo que quiero exportar
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        
        // Escribo en el archivo el JSON con los ejercicios
        await FileSystem.writeAsStringAsync(fileUri, exercisesJson);
        
        // Verificar si el dispositivo móvil permite compartir archivos
        const canShare = await Sharing.isAvailableAsync();
        
        if (canShare) {
            // Descargar el archivo
            await Sharing.shareAsync(fileUri, {
                mimeType: 'application/json',
                dialogTitle: 'Descargar Ejercicios',
                UTI: 'public.json' // para iOS
            });
            
            Alert.alert(
                'Éxito',
                'Los ejercicios se han exportado correctamente'
            );
        } else {
            Alert.alert(
                'Error',
                'Tu dispositivo no soporta la función de compartir archivos'
            );
        }
        
        // Limpiar el archivo temporal que habua creado
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
        
    } catch (error) {
        console.error('Error downloading exercises:', error);
        Alert.alert(
            'Error',
            'No se pudieron descargar los ejercicios'
        );
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

  //Cargamos la información de los último ejercicios almacenados en el async storage
  useEffect(() => {
    loadExercises();
  }, []);

  //Cuando cambie el array de ejercicios volver a guardarlo en el async storage
  useEffect(() => {
    if(exercises){
      saveExercises(exercises);
    }
  },[exercises]);

  // useEffect(() => {
  //   AsyncStorage.clear();
  // },[]);

  useEffect(() => {
    const sortedExercises = [...exercises].sort((a, b) => a.order - b.order);
    if (sortedExercises.length > 0 && sortedExercises[0].start) {
      if(exercises.filter(ex => ex.finish).length < exercises.length){
        intervalRef.current = setInterval(() => {
          setTotalElapsedTime((prev) => prev + 1);
        }, 1000);
      }

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
            {/* Información del entrenamiento actual */}
            <View className="flex-row justify-between items-center mt-2 bg-gray-50 p-3 rounded-lg">
                <HeadInfoElement text="Tiempo total" data={formatTime(totalElapsedTime)} />
                <HeadInfoElement text="Completados" data={`${exercises.filter(ex => ex.finish).length}/${exercises.length}`}  />
                <HeadInfoElement text="En progreso" data={`${exercises.filter(ex => ex.start && !ex.finish).length}`} />
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
        onPress={() => {
          Alert.alert(
            'Gestionar Ejercicios',
            '¿Qué deseas hacer?',
            [
              {
                text: 'Cancelar',
                style: 'cancel'
              },
              {
                text: 'Descargar Ejercicios',
                onPress: handleDownloadExercises
              },              {
                text: 'Importar JSON',
                onPress: handleImportExercises
              }
            ]
          );
        }}
      >
        <AntDesign name="file1" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}
