// app/patient/PatientLocation.tsx
import React, { useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  ActivityIndicator,
  Dimensions 
} from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

export default function PatientLocation() {
  const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null }>({
    latitude: null,
    longitude: null,
  });
  const [loading, setLoading] = useState(false);
  const [locationSaved, setLocationSaved] = useState(false);

  const getAndSaveLocation = async () => {
    try {
      setLoading(true);
      
      // Request permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required", 
          "Location access is required to find nearby pharmacies and provide better service.",
          [{ text: "OK", style: "default" }]
        );
        return;
      }

      // Get current location
      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setLocation(coords);

      // Send to backend
      const res = await fetch("https://5aa83c1450d9.ngrok-free.app/api/patients/update-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: "s5JLkvv1h8W8DBGCB9TS4kX1m8f2", // replace with actual uid
          coordinates: [coords.longitude, coords.latitude], // [lng, lat]
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update location");
      
      setLocationSaved(true);
      Alert.alert(
        "Location Saved", 
        "Your location has been updated successfully. We can now show you nearby pharmacies.",
        [{ text: "Great!", style: "default" }]
      );
    } catch (err: any) {
      console.error("Location error:", err);
      Alert.alert(
        "Location Error", 
        err.message || "Failed to get your location. Please try again.",
        [{ text: "OK", style: "default" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}°, ${lng.toFixed(6)}°`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="location" size={28} color="white" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Location Services</Text>
          <Text style={styles.subtitle}>
            {locationSaved ? "Location updated" : "Help us find nearby pharmacies"}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#1E40AF" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Secure & Private</Text>
              <Text style={styles.infoDescription}>
                Your location is only used to find nearby pharmacies
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="map-outline" size={24} color="#1E40AF" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Better Service</Text>
              <Text style={styles.infoDescription}>
                Get accurate pharmacy locations and delivery options
              </Text>
            </View>
          </View>
        </View>

        {location.latitude && location.longitude && (
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.locationTitle}>Current Location</Text>
            </View>
            <Text style={styles.coordinatesText}>
              {formatCoordinates(location.latitude, location.longitude)}
            </Text>
            <View style={styles.locationMeta}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.locationTime}>
                Updated {new Date().toLocaleTimeString()}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.locationButton,
            loading && styles.locationButtonDisabled,
            locationSaved && styles.locationButtonSuccess
          ]}
          onPress={getAndSaveLocation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons 
              name={locationSaved ? "checkmark-circle-outline" : "location-outline"} 
              size={20} 
              color="white" 
            />
          )}
          <Text style={styles.locationButtonText}>
            {loading 
              ? "Getting Location..." 
              : locationSaved 
                ? "Update Location" 
                : "Save My Location"
            }
          </Text>
        </TouchableOpacity>

        {locationSaved && (
          <Text style={styles.successMessage}>
            ✓ Location saved successfully! You can now find nearby pharmacies.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#1E40AF",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  content: {
    padding: 24,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  infoText: {
    marginLeft: 16,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  locationCard: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  coordinatesText: {
    fontSize: 14,
    fontFamily: "monospace",
    color: "#1E40AF",
    fontWeight: "600",
    marginBottom: 8,
  },
  locationMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationTime: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  locationButton: {
    backgroundColor: "#1E40AF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1E40AF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 16,
  },
  locationButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  locationButtonSuccess: {
    backgroundColor: "#10B981",
  },
  locationButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  successMessage: {
    textAlign: "center",
    fontSize: 14,
    color: "#10B981",
    fontWeight: "500",
    backgroundColor: "#D1FAE5",
    padding: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
});