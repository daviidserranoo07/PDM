export const formatDate = (date) => {
  if (!date) return null;

  try {
    const d = date instanceof Date ? date : new Date(date);

    if (isNaN(d.getTime())) {
      return null;
    }

    // Format date
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");

    // Format time
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");

    // Return formatted date and time
    return {
      fullDate: `${year}-${month}-${day} ${hours}:${minutes}`,
      dateOnly: `${year}-${month}-${day}`,
      timeOnly: `${hours}:${minutes}`,
      formatted: `${day}/${month}/${year} ${hours}:${minutes}`,
      relative: getRelativeTime(d),
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Función auxiliar para tiempo relativo
const getRelativeTime = (date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) {
    return minutes <= 1 ? "Hace un minuto" : `Hace ${minutes} minutos`;
  } else if (hours < 24) {
    return hours === 1 ? "Hace una hora" : `Hace ${hours} horas`;
  } else if (days < 7) {
    return days === 1 ? "Ayer" : `Hace ${days} días`;
  } else {
    return date.toLocaleDateString();
  }
};
