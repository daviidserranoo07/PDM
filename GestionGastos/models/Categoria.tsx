export interface Categoria {
    id: string;
    nombre: string;
    subcategorias?: Subcategoria[];
}

export interface Subcategoria {
    id: string;
    nombre: string;
}