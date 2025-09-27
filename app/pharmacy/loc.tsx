import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "../../components/TranslateProvider"; // adjust path if needed

const { width } = Dimensions.get('window');

export default function PharmacyLocation() {
  const router = useRouter();
  const params = useLocalSearchParams<{ pharmacyId?: string }>();
  const { t } = useTranslation(); // <-- Translation hook

  const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null }>({
    latitude: null,
    longitude: null,
  });
  const [pharmacyId, setPharmacyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationSaved, setLocationSaved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        let id: string | null = (params?.pharmacyId as string) ?? null;

        if (!id) {
          id = await AsyncStorage.getItem("pharmacyId");
        }

        if (!id) {
          Alert.alert(t("missingPharmacy"), t("noPharmacySelected"));
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
      Alert.alert(t("error"), t("noPharmacySelected"));
      return;
    }

    setIsLoading(true);
    
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("permissionDenied"), t("locationRequired"));
        setIsLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setLocation(coords);

      const res = await fetch("https://7300c4c894de.ngrok-free.app/api/pharmacies/update-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pharmacyId,
          coordinates: [coords.longitude, coords.latitude],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("failedUpdate"));
      setLocationSaved(true);
      Alert.alert(t("success"), t("locationSaved"));
    } catch (err: any) {
      Alert.alert(t("error"), err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpanded = () => setIsExpanded(!isExpanded);
  const handleSaveLocation = (e: any) => { e.stopPropagation(); getAndSaveLocation(); };

  return (
    <SafeAreaView style={styles.screen}>
      <TouchableOpacity
        style={[styles.card, isExpanded && styles.cardExpanded]}
        onPress={toggleExpanded}
        activeOpacity={0.8}
      >
          {/* Compact View */}
          <View style={styles.compactView}>
            <View style={[styles.iconContainer, locationSaved && styles.iconContainerSaved]}>
              <Ionicons name={locationSaved ? "checkmark-circle" : "storefront"} size={22} color="white" />
            </View>
            <View style={styles.compactText}>
              <Text style={styles.title}>{t("pharmacyLocation")}</Text>
              <Text style={styles.subtitle}>
                {locationSaved ? t("locationActive") : t("setupLocationServices")}
              </Text>
            </View>
            <View style={styles.expandIcon}>
              <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color="rgba(255, 255, 255, 0.7)" />
            </View>
          </View>

          {/* Expanded Content */}
          {isExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.divider} />
              
              <Text style={styles.description}>
                {t("enableLocationServicesDescription")}
              </Text>

              {/* Benefits Section */}
              <View style={styles.benefitsSection}>
                <View style={styles.benefitItem}>
                  <View style={[styles.benefitIcon, {backgroundColor: 'rgba(78, 205, 196, 0.2)'}]}>
                    <Ionicons name="people-outline" size={18} color="#4ECDC4" />
                  </View>
                  <View style={styles.benefitText}>
                    <Text style={styles.benefitTitle}>{t("patientDiscovery")}</Text>
                    <Text style={styles.benefitDesc}>{t("helpPatientsLocate")}</Text>
                  </View>
                </View>

                <View style={styles.benefitItem}>
                  <View style={[styles.benefitIcon, {backgroundColor: 'rgba(168, 230, 207, 0.2)'}]}>
                    <Ionicons name="car-outline" size={18} color="#A8E6CF" />
                  </View>
                  <View style={styles.benefitText}>
                    <Text style={styles.benefitTitle}>{t("deliveryServices")}</Text>
                    <Text style={styles.benefitDesc}>{t("enableDeliveryOptions")}</Text>
                  </View>
                </View>

                <View style={styles.benefitItem}>
                  <View style={[styles.benefitIcon, {backgroundColor: 'rgba(255, 230, 109, 0.2)'}]}>
                    <Ionicons name="shield-checkmark-outline" size={18} color="#FFE66D" />
                  </View>
                  <View style={styles.benefitText}>
                    <Text style={styles.benefitTitle}>{t("securePrivate")}</Text>
                    <Text style={styles.benefitDesc}>{t("dataEncrypted")}</Text>
                  </View>
                </View>
              </View>

              {/* Location Info */}
              {location.latitude !== null && location.longitude !== null && (
                <View style={styles.locationInfo}>
                  <View style={styles.locationHeader}>
                    <Ionicons name="pin" size={16} color="#FFFFFF" />
                    <Text style={styles.locationTitle}>{t("currentPharmacyLocation")}</Text>
                  </View>
                  <Text style={styles.coordinates}>
                    {`${location.latitude.toFixed(6)}°, ${location.longitude.toFixed(6)}°`}
                  </Text>
                  <Text style={styles.timestamp}>
                    {t("lastUpdated")}: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              )}

              {/* Action Button */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isLoading && styles.actionButtonLoading,
                  locationSaved && styles.actionButtonSaved
                ]}
                onPress={handleSaveLocation}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#2E4EC6" />
                ) : (
                  <Ionicons name={locationSaved ? "refresh" : "location"} size={18} color="#2E4EC6" />
                )}
                <Text style={styles.actionButtonText}>
                  {isLoading 
                    ? t("acquiringLocation") 
                    : locationSaved 
                      ? t("updatePharmacyLocation") 
                      : t("savePharmacyLocation")}
                </Text>
              </TouchableOpacity>

              {/* Success Message */}
              {locationSaved && !isLoading && (
                <View style={styles.successContainer}>
                  <View style={styles.successIcon}>
                    <Ionicons name="checkmark-circle" size={18} color="#4ECDC4" />
                  </View>
                  <Text style={styles.successText}>
                    {t("pharmacyLocationSaved")}
                  </Text>
                </View>
              )}

              {/* Status Info */}
              <View style={styles.statusInfo}>
                <Ionicons name="information-circle-outline" size={14} color="rgba(255, 255, 255, 0.6)" />
                <Text style={styles.statusText}>
                  {t("locationServicesHelp")}
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: 'transparent',
  },
  contentContainer: {
    padding: 0,
  },
  card: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  cardExpanded: {
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  // Compact View
  compactView: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 43, 125, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainerSaved: {
    backgroundColor: 'rgba(78, 205, 196, 0.9)',
  },
  compactText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  expandIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Expanded Content
  expandedContent: {
    paddingHorizontal: 0,
    paddingBottom: 0,
    paddingTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
    marginHorizontal: 0,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 18,
    fontWeight: '400',
  },

  // Benefits Section
  benefitsSection: {
    marginBottom: 18,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  benefitDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },

  // Location Info
  locationInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  coordinates: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 4,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },

  // Action Button
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonLoading: {
    opacity: 0.8,
  },
  actionButtonSaved: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#4ECDC4',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E4EC6',
    marginLeft: 8,
  },

  // Success Message
  successContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
    marginBottom: 12,
    backdropFilter: 'blur(20px)',
  },
  successIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  successText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Status Info
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    flex: 1,
    marginLeft: 6,
    lineHeight: 16,
  },
});