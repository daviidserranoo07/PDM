import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveLocation(latitude: number, longitude: number) {
  await AsyncStorage.setItem(
    "savedLocation",
    JSON.stringify({ latitude, longitude })
  );
}

export async function getSavedLocation() {
  const savedLocation = await AsyncStorage.getItem("savedLocation");
  return savedLocation ? JSON.parse(savedLocation) : null;
}
