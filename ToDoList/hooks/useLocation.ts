import * as Location from "expo-location";
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LocationError = {
  message: string;
  code?: string;
};

export default function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);

  const loadStoredLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedLocation = await AsyncStorage.getItem("location");
      if (storedLocation) {
        setLocation(JSON.parse(storedLocation));
        return true;
      }
      return false;
    } catch (error) {
      setError({ message: "Error loading stored location" });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const obtenerUbicacion = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError({
          message: "Location permission denied",
          code: "PERMISSION_DENIED",
        });
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(currentLocation);
      await AsyncStorage.setItem("location", JSON.stringify(currentLocation));
    } catch (error) {
      setError({
        message: "Error getting location",
        code: error instanceof Error ? error.message : "UNKNOWN_ERROR",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeLocation = async () => {
      // Solo proceder si el componente sigue montado
      if (!isMounted) return;

      setIsLoading(true);

      try {
        // Primero intentar cargar la ubicación almacenada
        const hasStoredLocation = await loadStoredLocation();

        // Si no hay ubicación almacenada y el componente sigue montado,
        // intentar obtener la ubicación actual
        if (!hasStoredLocation && isMounted) {
          await obtenerUbicacion();
        }
      } catch (error) {
        if (isMounted) {
          setError({
            message: "Error initializing location",
            code: "INIT_ERROR",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeLocation();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [loadStoredLocation, obtenerUbicacion]);

  return {
    location,
    obtenerUbicacion,
    isLoading,
    error,
    setIsLoading,
  };
}
