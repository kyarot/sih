// app/pharmacy/PharmacyLocation.tsx
import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert } from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function PharmacyLocation() {
     const router = useRouter();
  const params = useLocalSearchParams<{ pharmacyId?: string }>();
  const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null }>({
    latitude: null,
    longitude: null,
  });
    const [pharmacyId, setPharmacyId] = useState<string | null>(null);

     useEffect(() => {
    const init = async () => {
      try {
        // params.pharmacyId may be undefined; use it if present
        let id: string | null = (params?.pharmacyId as string) ?? null;

        if (!id) {
          id = await AsyncStorage.getItem("pharmacyId");
        }

        if (!id) {
          Alert.alert("Missing pharmacy", "No pharmacy selected. Please login again.");
          // optional: force navigation back to login
          router.replace("/");
          return;
        }

        setPharmacyId(id);
      } catch (err) {
        console.error("Failed to load pharmacyId:", err);
      }
    };

    init();
  }, [params?.pharmacyId]);

  const getAndSaveLocation = async () => {
    try {
        if (!pharmacyId) {
        Alert.alert("Error", "No pharmacy selected. Please login again.");
        return;
      }
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location access is required");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setLocation(coords);

      // Send to backend
      const res = await fetch("https://5aa83c1450d9.ngrok-free.app/api/pharmacies/update-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           pharmacyId: pharmacyId,
          //pharmacyId: "68c7e45c7e560baf62e8d973", // replace with real _id
          coordinates: [coords.longitude, coords.latitude], // [lng, lat]
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");
      Alert.alert("Success", "Location saved successfully");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View>
      <Button title="Save My Location" onPress={getAndSaveLocation} />
      {location.latitude && location.longitude && (
        <Text>
          Saved Location: {location.latitude}, {location.longitude}
        </Text>
      )}
    </View>
  );
}
