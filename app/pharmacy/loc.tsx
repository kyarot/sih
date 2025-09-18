// app/pharmacy/PharmacyLocation.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

export default function PharmacyLocation() {
  const router = useRouter();
  const params = useLocalSearchParams<{ pharmacyId?: string }>();
  const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null }>({
    latitude: null,
    longitude: null,
  });
  const [pharmacyId, setPharmacyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationSaved, setLocationSaved] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        let id: string | null = (params?.pharmacyId as string) ?? null;

        if (!id) {
          id = await AsyncStorage.getItem("pharmacyId");
        }

        if (!id) {
          Alert.alert("Missing pharmacy", "No pharmacy selected. Please login again.");
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
    if (!pharmacyId) {
      Alert.alert("Error", "No pharmacy selected. Please login again.");
      return;
    }

    setIsLoading(true);
    
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location access is required");
        setIsLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
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
          coordinates: [coords.longitude, coords.latitude], // [lng, lat]
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");
      setLocationSaved(true);
      Alert.alert("Success", "Location saved successfully");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.contentContainer}>
        <View style={styles.card}>
          <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="location" size={28} color="white" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Pharmacy Location</Text>
          <Text style={styles.subtitle}>
            {locationSaved ? "Location updated" : "Help patients find your pharmacy"}
          </Text>
        </View>
          </View>

          <View style={styles.content}>
            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#1E40AF" />
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoTitle}>Secure & Private</Text>
                  <Text style={styles.infoDescription}>Your location is only used to improve service accuracy</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="map-outline" size={24} color="#1E40AF" />
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoTitle}>Better Reach</Text>
                  <Text style={styles.infoDescription}>Enable precise directions and delivery options for patients</Text>
                </View>
              </View>
            </View>

            {location.latitude !== null && location.longitude !== null && (
              <View style={styles.locationCard}>
                <View style={styles.locationHeader}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  <Text style={styles.locationTitle}>Current Location</Text>
                </View>
                <Text style={styles.coordinatesText}>
                  {`${location.latitude.toFixed(6)}°, ${location.longitude.toFixed(6)}°`}
                </Text>
                <View style={styles.locationMeta}>
                  <Ionicons name="time-outline" size={16} color="#6B7280" />
                  <Text style={styles.locationTime}>Updated {new Date().toLocaleTimeString()}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.locationButton,
                isLoading && styles.locationButtonDisabled,
                locationSaved && styles.locationButtonSuccess,
              ]}
              onPress={getAndSaveLocation}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name={locationSaved ? "checkmark-circle-outline" : "location-outline"} size={20} color="white" />
              )}
              <Text style={styles.locationButtonText}>
                {isLoading ? "Getting Location..." : locationSaved ? "Update Location" : "Save Pharmacy Location"}
              </Text>
            </TouchableOpacity>

            {locationSaved && (
              <Text style={styles.successMessage}>✓ Location saved successfully! Patients can now find you easily.</Text>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    maxWidth: 560,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    backgroundColor: '#1E40AF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: { flex: 1 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  content: { padding: 16 },
  infoSection: { marginBottom: 24 },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoTextWrap: { marginLeft: 16, flex: 1 },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  locationCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  coordinatesText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#1E40AF',
    fontWeight: '600',
    marginBottom: 8,
  },
  locationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTime: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  locationButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 12,
  },
  locationButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  locationButtonSuccess: { backgroundColor: '#10B981' },
  locationButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  successMessage: {
    textAlign: 'center',
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
    backgroundColor: '#D1FAE5',
    padding: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
});