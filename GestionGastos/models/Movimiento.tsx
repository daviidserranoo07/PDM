import { Categoria, Subcategoria } from "./Categoria";

export interface Movimiento {
    id: string;
    concepto: string;
    cantidad: number;
    descripcion: string;
    fecha: string;
    categoria: Categoria;
    subcategoria: Subcategoria;
}