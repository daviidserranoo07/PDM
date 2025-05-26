import { Categoria, Subcategoria } from "./Categoria";

export interface Movimiento {
    id: string;
    concepto: string;
    descripcion: string;
    cantidad: number;
    fecha: string;
    categoria: Categoria;
    subcategoria: Subcategoria;
}