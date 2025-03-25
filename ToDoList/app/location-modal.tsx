import { View, Text, Pressable, Dimensions } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import * as Location from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";

export default function LocationModal() {
  const [location, setLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permiso de ubicación denegado");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setSelectedLocation(location.coords);

      // Obtener dirección
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
    })();
  }, []);

  const handleSelectLocation = async (event) => {
    const coords = event.nativeEvent.coordinate;
    setSelectedLocation(coords);

    // Actualizar dirección al seleccionar nueva ubicación
    try {
      const address = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
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
  };

  return (
    <View className="flex-1">
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row justify-between items-center p-4 bg-white">
          <Text className="text-xl font-bold">Seleccionar ubicación</Text>
          <Pressable onPress={() => router.back()}>
            <MaterialCommunityIcons name="close" size={24} color="black" />
          </Pressable>
        </View>

        {/* Mapa */}
        {location ? (
          <View className="flex-1">
            <MapView
              className="w-full h-full"
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
            onPress={() => {
              if (selectedLocation) {
                router.push({
                  pathname: "/(tabs)/create",
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
