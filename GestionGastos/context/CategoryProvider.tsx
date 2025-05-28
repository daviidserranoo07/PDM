import { Categoria } from "@/models/Categoria";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { CategoryContext } from "./CategoryContext";

// Definimos la categoría por defecto
// const CATEGORIA_DEFAULT: Categoria = {
//     id: "default",
//     nombre: "Varios",
//     tipo: 'gasto',
//     subcategorias: [{
//         id: "default-sub",
//         nombre: "Varios"
//     }]
// };

export function CategoryProvider({ children }: { children: React.ReactNode }) {
    const [categorias, setCategorias] = useState<Categoria[]>([]);

    const handleLoadCategorias = async () => {
        try {
            const data = await AsyncStorage.getItem('categorias');
            let categoriasActuales: Categoria[] = [];

            if (data) {
                categoriasActuales = await JSON.parse(data);
            }


            await AsyncStorage.setItem('categorias', JSON.stringify(categoriasActuales));

            setCategorias(categoriasActuales);
        } catch (error) {
            console.log(error);
        }
    }

    //Función para añadir una nueva categoria
    const handleAddCategoria = async (nuevaCategoria: Categoria) => {
        try {
            const data = await AsyncStorage.getItem('categorias');
            if (data) {
                const categoriasActuales = await JSON.parse(data);
                const nuevasCategorias = [...categoriasActuales, nuevaCategoria];
                await AsyncStorage.setItem('categorias', JSON.stringify(nuevasCategorias));
                setCategorias(nuevasCategorias);
            } else {
                const nuevasCategorias = [nuevaCategoria];
                await AsyncStorage.setItem('categorias', JSON.stringify(nuevasCategorias));
                setCategorias(nuevasCategorias);
            }
        } catch (error) {
            console.log(error);
        }
    }

    //Función para editar una categoria ya existente
    const handleUpdateCategoria = async (categoriaEdidata: Categoria) => {
        try {
            const data = await AsyncStorage.getItem('categorias');
            if (data) {
                const categoriasActuales = await JSON.parse(data);
                const nuevasCategoria = categoriasActuales.map((categoria: Categoria) => {
                    if (categoria.id === categoriaEdidata.id) {
                        return categoriaEdidata;
                    } else {
                        return categoria;
                    }
                });
                await AsyncStorage.setItem('categorias', JSON.stringify(nuevasCategoria));
                setCategorias(nuevasCategoria);
            }
        } catch (error) {
            console.log(error);
        }
    }

    //Función para eliminar una categoria
    const handleDeleteCategoria = async (categoriaEliminada: Categoria) => {
        try {
            const data = await AsyncStorage.getItem('categorias');
            if (data) {
                const categoriasActuales = await JSON.parse(data);
                const nuevasCategoria = categoriasActuales
                    .filter((categoria: Categoria) => categoria && categoria.id !== categoriaEliminada.id)
                    .filter(Boolean);
                await AsyncStorage.setItem('categorias', JSON.stringify(nuevasCategoria));
                setCategorias(nuevasCategoria);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        handleLoadCategorias();
    }, [])

    return (
        <CategoryContext.Provider value={{ categorias, handleAddCategoria, handleDeleteCategoria, handleUpdateCategoria }}>
            {children}
        </CategoryContext.Provider>
    )
}