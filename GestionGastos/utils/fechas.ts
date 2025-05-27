//Obtiene el primer dia del mes actual
export const getPrimerDiaMes = (fecha: Date) => {
    return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  };
  
  //Obtiene el último dia del mes actual
export const getUltimoDiaMes = (fecha: Date) => {
    return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
  };