// app/patient/components/PatientLocation.tsx
import React, { useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  ActivityIndicator,
  Dimensions,
  Platform
} from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "../../../components/TranslateProvider"; 

const { width } = Dimensions.get("window");

type Props = {
  uid: string | undefined; // ✅ uid comes from parent
};

export default function PatientLocation({ uid }: Props) {
  const { t } = useTranslation();
  const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null }>({
    latitude: null,
    longitude: null,
  });
  const [loading, setLoading] = useState(false);
  const [locationSaved, setLocationSaved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const getAndSaveLocation = async () => {
    if (!uid) {
      Alert.alert("No Profile Selected", "Please select a patient profile first.");
      return;
    }

    try {
      setLoading(true);
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

      const res = await fetch("https://5aa83c1450d9.ngrok-free.app/api/patients/update-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid, // ✅ dynamic uid
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
    <TouchableOpacity
      style={[
        styles.container,
        isExpanded && styles.containerExpanded
      ]}
      onPress={() => setIsExpanded(!isExpanded)}
      activeOpacity={0.8}
    >
      {/* Compact View */}
      <View style={styles.compactView}>
        <View style={[
          styles.iconContainer,
          locationSaved && styles.iconContainerSaved
        ]}>
          <Ionicons 
            name={locationSaved ? "checkmark-circle" : "location"} 
            size={20} 
            color="white" 
          />
        </View>
        
        <View style={styles.compactText}>
          <Text style={styles.title}>Location Services</Text>
          <Text style={styles.subtitle}>
            {locationSaved ? "Location saved" : "Tap to manage"}
          </Text>
        </View>

        <View style={styles.expandIcon}>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#64748B" 
          />
        </View>
      </View>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />
          
          <Text style={styles.description}>
            Enable location services to help healthcare providers deliver personalized care and locate nearby medical facilities.
          </Text>

          {/* Location Info */}
          {location.latitude && location.longitude && (
            <View style={styles.locationInfo}>
              <View style={styles.locationHeader}>
                <Ionicons name="pin" size={16} color="#1E40AF" />
                <Text style={styles.locationTitle}>Current Position</Text>
              </View>
              <Text style={styles.coordinates}>
                {formatCoordinates(location.latitude, location.longitude)}
              </Text>
              <Text style={styles.timestamp}>
                Updated: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              loading && styles.actionButtonLoading,
              locationSaved && styles.actionButtonSaved
            ]}
            onPress={getAndSaveLocation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons 
                name={locationSaved ? "refresh" : "location"} 
                size={18} 
                color="white" 
              />
            )}
            <Text style={styles.actionButtonText}>
              {loading 
                ? "Getting Location..." 
                : locationSaved 
                  ? "Update Location" 
                  : "Save Location"
              }
            </Text>
          </TouchableOpacity>

          {/* Privacy Note */}
          <View style={styles.privacyNote}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#64748B" />
            <Text style={styles.privacyText}>
              Your location is encrypted and secure
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

/* ============================
   Styles
   ============================ */
const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  containerExpanded: {
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  compactView: { flexDirection: "row", alignItems: "center", padding: 16 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E40AF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconContainerSaved: { backgroundColor: "#10B981" },
  compactText: { flex: 1 },
  title: { fontSize: 16, fontWeight: "600", color: "#1E293B", marginBottom: 2 },
  subtitle: { fontSize: 13, color: "#64748B", fontWeight: "500" },
  expandIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  expandedContent: { paddingHorizontal: 16, paddingBottom: 16 },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginBottom: 16, marginHorizontal: -16 },
  description: { fontSize: 14, color: "#475569", lineHeight: 20, marginBottom: 16 },
  locationInfo: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  locationHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  locationTitle: { fontSize: 14, fontWeight: "600", color: "#1E40AF", marginLeft: 6 },
  coordinates: {
    fontSize: 13,
    color: "#374151",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginBottom: 4,
  },
  timestamp: { fontSize: 12, color: "#64748B", fontWeight: "500" },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E40AF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  actionButtonLoading: { opacity: 0.8 },
  actionButtonSaved: { backgroundColor: "#10B981" },
  actionButtonText: { fontSize: 15, fontWeight: "600", color: "white", marginLeft: 8 },
  privacyNote: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  privacyText: { fontSize: 12, color: "#64748B", fontWeight: "500", marginLeft: 6 },
});
