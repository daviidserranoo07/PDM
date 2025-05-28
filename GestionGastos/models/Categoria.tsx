export interface Categoria {
    id: string;
    nombre: string;
    subcategorias?: Subcategoria[];
    tipo: 'ingreso' | 'gasto';
}

export interface Subcategoria {
    id: string;
    nombre: string;
}