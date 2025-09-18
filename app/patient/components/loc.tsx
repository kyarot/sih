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
import { useTranslation } from "../../../components/TranslateProvider"; 

const { width } = Dimensions.get('window');

export default function PatientLocation() {
  const { t } = useTranslation(); // ✅ use translation
  const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null }>({
    latitude: null,
    longitude: null,
  });
  const [loading, setLoading] = useState(false);
  const [locationSaved, setLocationSaved] = useState(false);

  const getAndSaveLocation = async () => {
    try {
      setLoading(true);
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("permission_required"), 
          t("permission_required_msg"),
          [{ text: t("ok"), style: "default" }]
        );
        return;
      }

      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setLocation(coords);

      const res = await fetch("https://5aa83c1450d9.ngrok-free.app/api/patients/update-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: "s5JLkvv1h8W8DBGCB9TS4kX1m8f2", 
          coordinates: [coords.longitude, coords.latitude], 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("location_failed"));
      
      setLocationSaved(true);
      Alert.alert(
        t("location_saved"), 
        t("location_saved_msg"),
        [{ text: t("great"), style: "default" }]
      );
    } catch (err: any) {
      console.error("Location error:", err);
      Alert.alert(
        t("location_error"), 
        err.message || t("location_failed"),
        [{ text: t("ok"), style: "default" }]
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
          <Text style={styles.title}>{t("location_services")}</Text>
          <Text style={styles.subtitle}>
            {locationSaved ? t("location_updated") : t("help_find_pharmacies")}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#1E40AF" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>{t("secure_private")}</Text>
              <Text style={styles.infoDescription}>
                {t("secure_private_msg")}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="map-outline" size={24} color="#1E40AF" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>{t("better_service")}</Text>
              <Text style={styles.infoDescription}>
                {t("better_service_msg")}
              </Text>
            </View>
          </View>
        </View>

        {location.latitude && location.longitude && (
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.locationTitle}>{t("current_location")}</Text>
            </View>
            <Text style={styles.coordinatesText}>
              {formatCoordinates(location.latitude, location.longitude)}
            </Text>
            <View style={styles.locationMeta}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.locationTime}>
                {t("updated_at")} {new Date().toLocaleTimeString()}
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
              ? t("getting_location") 
              : locationSaved 
                ? t("update_location") 
                : t("save_location")
            }
          </Text>
        </TouchableOpacity>

        {locationSaved && (
          <Text style={styles.successMessage}>
            ✓ {t("location_success")}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    elevation: 8,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1E40AF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerText: { flex: 1 },
  title: { fontSize: 18, fontWeight: "700", color: "white" },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.9)" },
  content: { padding: 20 },
  infoSection: { marginBottom: 20 },
  infoItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16 },
  infoText: { marginLeft: 12, flex: 1 },
  infoTitle: { fontSize: 16, fontWeight: "600", color: "#1E40AF" },
  infoDescription: { fontSize: 14, color: "#475569" },
  locationCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  locationHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  locationTitle: { fontSize: 16, fontWeight: "700", marginLeft: 8, color: "#1E40AF" },
  coordinatesText: { fontSize: 14, color: "#334155", marginBottom: 4 },
  locationMeta: { flexDirection: "row", alignItems: "center" },
  locationTime: { fontSize: 12, color: "#6B7280", marginLeft: 4 },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E40AF",
    paddingVertical: 14,
    borderRadius: 12,
  },
  locationButtonDisabled: { opacity: 0.6 },
  locationButtonSuccess: { backgroundColor: "#10B981" },
  locationButtonText: { color: "white", fontSize: 16, fontWeight: "600", marginLeft: 8 },
  successMessage: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
    textAlign: "center",
  },
});
