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

      const res = await fetch("http://localhost:5000/api/pharmacies/update-location", {
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
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.contentContainer}>
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
              <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color="#64748B" />
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
                  <View style={styles.benefitIcon}>
                    <Ionicons name="people-outline" size={18} color="#1E40AF" />
                  </View>
                  <View style={styles.benefitText}>
                    <Text style={styles.benefitTitle}>{t("patientDiscovery")}</Text>
                    <Text style={styles.benefitDesc}>{t("helpPatientsLocate")}</Text>
                  </View>
                </View>

                <View style={styles.benefitItem}>
                  <View style={styles.benefitIcon}>
                    <Ionicons name="car-outline" size={18} color="#10B981" />
                  </View>
                  <View style={styles.benefitText}>
                    <Text style={styles.benefitTitle}>{t("deliveryServices")}</Text>
                    <Text style={styles.benefitDesc}>{t("enableDeliveryOptions")}</Text>
                  </View>
                </View>

                <View style={styles.benefitItem}>
                  <View style={styles.benefitIcon}>
                    <Ionicons name="shield-checkmark-outline" size={18} color="#7C3AED" />
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
                    <Ionicons name="pin" size={16} color="#1E40AF" />
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
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name={locationSaved ? "refresh" : "location"} size={18} color="white" />
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
                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                  </View>
                  <Text style={styles.successText}>
                    {t("pharmacyLocationSaved")}
                  </Text>
                </View>
              )}

              {/* Status Info */}
              <View style={styles.statusInfo}>
                <Ionicons name="information-circle-outline" size={14} color="#64748B" />
                <Text style={styles.statusText}>
                  {t("locationServicesHelp")}
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
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
    padding: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    width: '100%',
  },
  cardExpanded: {
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  // Compact View
  compactView: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconContainerSaved: {
    backgroundColor: '#10B981',
  },
  compactText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  expandIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Expanded Content
  expandedContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
    marginHorizontal: -14,
  },
  description: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 16,
    fontWeight: '400',
  },

  // Benefits Section
  benefitsSection: {
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 1,
  },
  benefitDesc: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },

  // Location Info
  locationInfo: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E40AF',
    marginLeft: 6,
  },
  coordinates: {
    fontSize: 12,
    color: '#374151',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 3,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },

  // Action Button
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E40AF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  actionButtonLoading: {
    opacity: 0.8,
  },
  actionButtonSaved: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginLeft: 6,
  },

  // Success Message
  successContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 10,
  },
  successIcon: {
    marginRight: 6,
    marginTop: 1,
  },
  successText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
    flex: 1,
    lineHeight: 16,
  },

  // Status Info
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
    marginLeft: 5,
    lineHeight: 14,
  },
});