import { Text, View, TouchableOpacity } from "react-native";
import Exercise from "@/models/Excercise";
import { useEffect, useState, useRef, useCallback } from "react";
import { formatTime } from "@/utils/formatTime";

export const CardExercise = ({
    currentExercise, 
    setExercises,
    exercises
}: {
    currentExercise: Exercise, 
    setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>,
    exercises: Exercise[]
}) => {
    const [exercise, setExercise] = useState<Exercise>({
        id: 0,
        name: '',
        description: '',
        elapsedTime: 0,
        order:1,
        duration: 0,
        start: false,
        paused: false,
        finish: false
    });
    const [doingExercise, setDoingExercise] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout>();
    // Estado local para el botón deshabilitado
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);


    // Mover la verificación fuera del render
    const isPreviousExerciseCompleted = (): boolean => {
        if (exercise.order === 1) return true;
        const previousExercise = exercises.find(ex => ex.order === exercise.order - 1);
        return previousExercise?.finish || false;
    };

    const updateGlobalExercise = useCallback((updatedExercise: Partial<Exercise>) => {
        setExercises(prevExercises => 
            prevExercises.map(ex => 
                ex.id === currentExercise.id 
                    ? { ...ex, ...updatedExercise }
                    : ex
            )
        );
    }, [currentExercise.id, setExercises]);

    const handleStart = () => {
        try {
            if (!isPreviousExerciseCompleted()) {
                alert('Debes completar el ejercicio anterior primero');
                return;
            }

            const updates = {
                start: true,
                paused: false,
                elapsedTime: 0
            };
            
            setExercise(prev => ({
                ...prev,
                ...updates
            }));
            setElapsedTime(0);
            setDoingExercise(true);
            updateGlobalExercise(updates);
        } catch(error) {
            console.error('Error in handleStart:', error);
        }
    };

    const handlePause = () => {
        try {
            const updates = {
                paused: !exercise.paused,
                elapsedTime: elapsedTime
            };
            setExercise(prev => ({
                ...prev,
                ...updates
            }));
            setDoingExercise(!doingExercise);
            updateGlobalExercise(updates);
        } catch(error) {
            console.error('Error in handlePause:', error);
        }
    };

    const handleFinish = () => {
        try {
            const updates = {
                start: true,
                finish: true,
                paused: false,
                elapsedTime: elapsedTime
            };
            setExercise(prev => ({
                ...prev,
                ...updates
            }));
            setDoingExercise(false);
            updateGlobalExercise(updates);
        } catch(error) {
            console.error('Error in handleFinish:', error);
        }
    };

    // Inicialización del ejercicio
    useEffect(() => {
        if (currentExercise) {
            setExercise(currentExercise);
            setElapsedTime(currentExercise.elapsedTime || 0);
            setDoingExercise(currentExercise.start && !currentExercise.finish && !currentExercise.paused);
        }
    }, [currentExercise]);

    // Temporizador
    useEffect(() => {
        if (exercise.start && !exercise.finish && doingExercise) {
            intervalRef.current = setInterval(() => {
                setElapsedTime(prevTime => {
                    const newTime = prevTime + 1;
                    updateGlobalExercise({ elapsedTime: newTime });
                    return newTime;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = undefined;
            }
        };
    }, [exercise.start, exercise.finish, doingExercise, updateGlobalExercise]);


    // Usar useEffect para actualizar el estado del botón
    useEffect(() => {
        if(exercise){
            setIsButtonDisabled(!isPreviousExerciseCompleted() || exercise.start);
        }
    }, [exercise.start, exercises]);

    return (
        <View className="bg-white p-4 shadow-xl m-2 w-full rounded-lg">
            {/* Encabezado */}
            <View className="flex-row justify-between items-center mb-4">
                <View className="flex flex-col gap-2">
                    <Text className="text-xl font-bold text-gray-800">{exercise.name}</Text>
                    <Text className="text-gray-600">{exercise.description}</Text>
                </View>
                <View className="bg-gray-100 px-3 py-1 rounded-full">
                    <Text className={`font-medium ${
                        exercise.finish 
                            ? 'text-green-600' 
                            : exercise.start 
                                ? 'text-blue-600' 
                                : 'text-gray-600'
                    }`}>
                        {exercise.finish 
                            ? '✓ Terminado'
                            : exercise.start
                                ? exercise.paused
                                    ? '⏸ Pausado'
                                    : '⏵ En progreso'
                                : '⏺ Sin empezar'}
                    </Text>
                </View>
            </View>

            {/* Información del tiempo */}
            <View className="bg-gray-50 p-3 rounded-lg mb-4">
                <View className="flex-row justify-between items-center">
                    <Text className="text-gray-600">Duración objetivo:</Text>
                    <Text className="font-semibold text-gray-800">{exercise.duration} min</Text>
                </View>
                <View className="flex-row justify-between items-center mt-2">
                    <Text className="text-gray-600">Tiempo transcurrido:</Text>
                    <Text className="font-semibold text-gray-800">{formatTime(elapsedTime)}</Text>
                </View>
            </View>

            {/* Botones de control */}
            <View className="flex-row justify-between gap-2">
                <TouchableOpacity 
                    className={`flex-1 py-2 px-4 rounded-lg ${
                        isButtonDisabled 
                            ? 'bg-gray-300'
                            : 'bg-green-500'
                    }`}
                    disabled={isButtonDisabled}
                    onPress={handleStart}
                >
                    <Text className="text-white text-center font-medium">
                        Iniciar
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    className={`flex-1 py-2 px-4 rounded-lg ${
                        exercise.start && !exercise.finish 
                            ? 'bg-yellow-500' 
                            : 'bg-gray-300'
                    }`}
                    disabled={!exercise.start || exercise.finish}
                    onPress={handlePause}
                >
                    <Text className="text-white text-center font-medium">
                        {doingExercise ? 'Pausar' : 'Reanudar'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    className={`flex-1 py-2 px-4 rounded-lg ${
                        exercise.start && !exercise.finish 
                            ? 'bg-blue-500' 
                            : 'bg-gray-300'
                    }`}
                    disabled={!exercise.start || exercise.finish}
                    onPress={handleFinish}
                >
                    <Text className="text-white text-center font-medium">Terminar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default CardExercise;