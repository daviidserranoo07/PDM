import React, { ReactNode } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface ModalConfirmacionProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    titulo: string;
    mensaje: string;
    textoCancelar?: string;
    textoConfirmar?: string;
    children: ReactNode
}

export default function ModalConfirmacion({
    visible,
    onClose,
    onConfirm,
    titulo,
    mensaje,
    textoCancelar = "Cancelar",
    textoConfirmar = "Confirmar",
    children
}: ModalConfirmacionProps) {
    return (
        <Modal
            transparent={true}
            animationType='fade'
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/60 justify-center px-4">
                <View className="bg-white rounded-2xl p-6 shadow-xl">
                    <Text className="text-xl font-bold text-gray-800 mb-4">
                        {titulo}
                    </Text>
                    <Text className="text-gray-600 mb-6">
                        {mensaje}
                    </Text>
                    {children}
                    <View className="flex-row justify-end space-x-4 gap-4">
                        <TouchableOpacity
                            className="bg-gray-400 px-6 py-3 rounded-xl"
                            onPress={onClose}
                        >
                            <Text className="text-white font-medium">{textoCancelar}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-green-500 px-6 py-3 rounded-xl"
                            onPress={onConfirm}
                        >
                            <Text className="text-white font-medium">{textoConfirmar}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
} 