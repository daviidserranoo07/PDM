import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

export default function TicketScanner({ onTicketProcessed }: { onTicketProcessed: (data: { concepto: string, cantidad: number, fecha: Date }) => void }) {
    const [isProcessing, setIsProcessing] = useState(false);

    //Función para hacer una foto del ticket y posteriormente procesarla
    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });

            //Si se ha echado la foto correctamente la procesamos
            if (!result.canceled) {
                setIsProcessing(true);
                await processImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error al tomar la foto:', error);
            setIsProcessing(false);
        }
    };

    //Procesamos la imagen pasandola por un OCR
    const processImage = async (imageUri: string) => {
        try {
            const manipulatedImage = await ImageManipulator.manipulateAsync(
                imageUri,
                [
                    { resize: { width: 800 } },
                ],
                {
                    compress: 0.7,
                    format: ImageManipulator.SaveFormat.JPEG
                }
            );

            const base64 = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            //Comprobamos que el tamaño de la imagen sea menor de 900 ya que el máximo es 1024 aceptado por la API
            const sizeInBytes = (base64.length * 3) / 4;
            const sizeInKB = sizeInBytes / 1024;

            if (sizeInKB > 900) {
                const smallerImage = await ImageManipulator.manipulateAsync(
                    imageUri,
                    [
                        { resize: { width: 600 } },
                    ],
                    {
                        compress: 0.5,
                        format: ImageManipulator.SaveFormat.JPEG
                    }
                );

                const newBase64 = await FileSystem.readAsStringAsync(smallerImage.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                return await sendToOcr(newBase64);
            }

            return await sendToOcr(base64);

        } catch (error) {
            console.error('Error procesando la imagen:', error);
            Alert.alert(
                "Error",
                "No se pudo procesar el ticket. Por favor, inténtalo de nuevo.",
                [{ text: "OK" }]
            );
        } finally {
            setIsProcessing(false);
        }
    };

    //Función que manda la imagen a la API del OCR
    const sendToOcr = async (base64: string) => {
        try {
            const formData = new FormData();
            formData.append('apikey', 'K81796944888957');
            formData.append('language', 'spa');
            formData.append('isOverlayRequired', 'false');
            formData.append('base64Image', `data:image/jpeg;base64,${base64}`);

            //Petición a la API que pasa e OCR y nos devuelve la imagen parseada a texto
            const response = await fetch('https://api.ocr.space/parse/image', {
                method: 'POST',
                headers: {
                    'apikey': 'K81796944888957',
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Error en la API: ${response.status}`);
            }

            const result = await response.json();

            if (result.ParsedResults && result.ParsedResults.length > 0) {
                const text = result.ParsedResults[0].ParsedText;
                const data = parseTicketText(text);
                onTicketProcessed(data);
            } else {
                throw new Error('No se pudo extraer texto de la imagen');
            }
        } catch (error) {
            console.error('Error en OCR:', error);
            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    //Función para obtener la información de la imagen después de pasarlo por el OCR
    const parseTicketText = (text: string) => {
        const lines = text.split('\n');
        let total = 0;
        let concepto = '';
        let fecha = new Date();

        //Buscar en el texto una fecha con formaro DD/MM/YYYY o DD-MM-YYYY o DD.MM.YYYY
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const dateMatch = line.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
            if (dateMatch) {
                const [_, day, month, year] = dateMatch;
                const fullYear = year.length === 2 ? 2000 + parseInt(year) : parseInt(year);
                fecha = new Date(fullYear, parseInt(month) - 1, parseInt(day));
                break;
            }
        }

        // Buscar total, y en caso de haber varios cogemos el que tenga mayor valor
        let maxTotal = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.toUpperCase().includes('TOTAL')) {
                const priceMatch = line.match(/(\d+[.,]\d{2})€?/);
                if (priceMatch) {
                    const currentTotal = parseFloat(priceMatch[1].replace(',', '.'));
                    if (currentTotal > maxTotal) {
                        maxTotal = currentTotal;
                    }
                }
            }
        }
        total = maxTotal;

        if (total === 0) {
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const priceMatch = line.match(/(\d+[.,]\d{2})€?/);
                if (priceMatch) {
                    const price = parseFloat(priceMatch[1].replace(',', '.'));
                    if (price > total) {
                        total = price;
                    }
                }
            }
        }

        // Buscamos el nombre de la tienda en las primeras primeras líneas
        for (let i = 0; i < Math.min(5, lines.length); i++) {
            const line = lines[i].trim();
            if (line && !line.match(/(\d+[.,]\d{2})€?/) && !line.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/)) {
                concepto = line;
                break;
            }
        }

        //Si no encontramos nada le ponemos de nombre ticket
        if (!concepto) {
            concepto = 'Ticket';
        }

        console.log("Total:", total);
        console.log("Concepto:", concepto);
        console.log("Fecha:", fecha);

        return {
            concepto: concepto,
            cantidad: total,
            fecha: fecha
        };
    };

    return (
        <View className="flex-1 items-center justify-center">
            {isProcessing ? (
                <View className="items-center">
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text className="mt-2">Procesando ticket...</Text>
                </View>
            ) : (
                <TouchableOpacity
                    className="bg-blue-500 p-4 rounded-full"
                    onPress={pickImage}
                >
                    <MaterialIcons name="camera" size={32} color="white" />
                </TouchableOpacity>
            )}
        </View>
    );
}