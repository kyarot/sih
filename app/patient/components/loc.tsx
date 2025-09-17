// app/patient/PatientLocation.tsx
import React, { useState } from "react";
import { View, Text, Button, Alert } from "react-native";
import * as Location from "expo-location";

export default function PatientLocation() {
  const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null }>({
    latitude: null,
    longitude: null,
  });

  const getAndSaveLocation = async () => {
    try {
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
      const res = await fetch("https://localhost:5000/api/patients/update-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: "s5JLkvv1h8W8DBGCB9TS4kX1m8f2", // replace with actual uid ,ulagadi
          coordinates: [coords.longitude, coords.latitude], // [lng, lat]
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");
      Alert.alert("Success", "Patient location saved successfully");
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
