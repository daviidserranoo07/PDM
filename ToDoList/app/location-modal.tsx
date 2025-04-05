import { View, Text, Pressable, Dimensions, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import * as Location from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Marker, MapPressEvent } from "react-native-maps";
import { LocationObjectCoords } from "expo-location";
import useLocation from "@/hooks/useLocation";

const { width, height } = Dimensions.get("window");

export default function LocationModal() {
  const [selectedLocation, setSelectedLocation] =
    useState<LocationObjectCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [address, setAddress] = useState<string>("");
  const { location, obtenerUbicacion, isLoading} = useLocation();

  useEffect(() => {
    (async () => {
      if(!location && !isLoading){
        await obtenerUbicacion();
      }

      console.log("location 1", location);
      if(location){
        setSelectedLocation(location.coords);

        //En base a la ubicación actual mediante las coordenadas obtenemos la dirección
        try {
          const address = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          if (address[0]) {
            setAddress(
              `${address[0].street || ""} ${address[0].name || ""}, ${
                address[0].city || ""
              }`
            );
          }
        } catch (error) {
          console.log("Error getting address:", error);
        }
      }
    })();
  }, [location]);

  //Función para seleccionar una posición en el mapa y guardar el estado
  const handleSelectLocation = async (event: MapPressEvent) => {
    const coords = event.nativeEvent.coordinate;
    setSelectedLocation({
      latitude: coords.latitude,
      longitude: coords.longitude,
      altitude: 0,
      accuracy: 0,
      altitudeAccuracy: 0,
      heading: 0,
      speed: 0,
    });

    // Actualizar dirección al seleccionar nueva ubicación
    try {
      const address = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      if (address[0]) {
        const addressStr = `${address[0].street || ""} ${
          address[0].name || ""
        }, ${address[0].city || ""}`;
        setAddress(addressStr);

        // Navegar de vuelta a la página de creación con la ubicación seleccionada
        router.push({
          pathname: "/Create",
          params: {
            location: JSON.stringify({
              coords: coords,
              address: addressStr,
            }),
          },
        });
      }
    } catch (error) {
      console.log("Error getting address:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View className="flex-row justify-between items-center p-4 bg-white">
          <Text className="text-xl font-bold">Seleccionar ubicación</Text>
          <Pressable onPress={() => router.back()}>
            <MaterialCommunityIcons name="close" size={24} color="black" />
          </Pressable>
        </View>

        {/* Mapa */}
        {location ? (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              onPress={handleSelectLocation}
            >
              {selectedLocation && (
                <Marker
                  coordinate={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                  }}
                />
              )}
            </MapView>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text>{errorMsg || "Cargando mapa..."}</Text>
          </View>
        )}

        {/* Footer con información y botón */}
        <View className="p-4 bg-white">
          <View className="mb-4">
            <Text className="text-gray-500">Ubicación seleccionada:</Text>
            <Text className="text-lg">
              {address || "Selecciona un punto en el mapa"}
            </Text>
          </View>

          <Pressable
            className="w-full p-4 bg-blue-500 rounded-xl"
            disabled={!selectedLocation}
            onPress={() => {
              if (selectedLocation) {
                router.push({
                  pathname: "/Create",
                  params: {
                    location: JSON.stringify({
                      coords: selectedLocation,
                      address: address,
                    }),
                  },
                });
              }
            }}
          >
            <Text className="text-white text-center font-bold">
              Confirmar ubicación
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: "white",
  },
  mapContainer: {
    flex: 1,
    height: height * 0.6,
    overflow: "hidden",
  },
  map: {
    width: width,
    height: "100%",
    ...StyleSheet.absoluteFillObject,
  },
});
