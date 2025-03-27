export const formatDate = (date) => {
  if (!date) return null;

  try {
    const d = date instanceof Date ? date : new Date(date);

    if (isNaN(d.getTime())) {
      return null;
    }

    // Format to yyyy-MM-dd
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error(error);
    return null;
  }
};
