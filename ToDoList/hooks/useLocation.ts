import * as Location from "expo-location";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      const current = await AsyncStorage.getItem("location");
      setLocation(current ? JSON.parse(current) : null);
    };
    fetchLocation();
  }, []);

  const obtenerUbicacion = async () => {
    try{
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permiso de ubicación denegado");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      await AsyncStorage.setItem("location", JSON.stringify(currentLocation));
    }catch (error){
      console.log(error);
    }finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    console.log("location:", location);
    if(!location) {
      obtenerUbicacion();
    }
  }, []);

  return { location , obtenerUbicacion, isLoading };
}
