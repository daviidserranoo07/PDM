import { Categoria } from "./Categoria";

export interface Movimiento {
    id: string;
    concepto: string;
    cantidad: number;
    fecha: string;
    categoria: Categoria
}