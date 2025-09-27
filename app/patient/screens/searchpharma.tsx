// SearchPharma.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { JSX, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
const { width, height } = Dimensions.get("window");

interface Pharmacy {
  _id: string;
  name: string;
  address?: string;
  distance?: number;
}

interface Order {
  _id: string;
  status: string;
  pharmacyId: any;
  createdAt: string;
}

export default function SearchPharma(): JSX.Element {
  const router = useRouter();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [ordersMap, setOrdersMap] = useState<{ [key: string]: Order }>({});
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patientUid, setPatientUid] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const API_BASE = "https://7300c4c894de.ngrok-free.app/api";

  useEffect(() => {
    const loadPatientData = async () => {
      const id = await AsyncStorage.getItem("patientId");
      const uid = await AsyncStorage.getItem("PatientUid");
      setPatientId(id);
      setPatientUid(uid);
    };
    loadPatientData();
  }, []);

  const extractPharmacyId = (order: Order): string => {
    if (!order) return "";
    if (order.pharmacyId && typeof order.pharmacyId === "object" && order.pharmacyId._id) {
      return String(order.pharmacyId._id);
    }
    if (typeof order.pharmacyId === "string") return order.pharmacyId;
    return "";
  };

  const fetchNearbyPharmacies = async () => {
    if (!patientId || !searchQuery.trim()) {
      Alert.alert("Error", "Please enter a medicine name to search");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    
    try {
      const res = await fetch(`${API_BASE}/pharmacies/nearby/${patientId}?medicine=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to fetch pharmacies");
      
      setPharmacies(data.pharmacies || []);
      
      // Fetch existing orders
      await fetchOrders();
    } catch (err: any) {
      console.warn("fetchNearbyPharmacies:", err.message);
      Alert.alert("Error", err.message);
      setPharmacies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!patientId) return;
    
    try {
      const res = await fetch(`${API_BASE}/orders?patientId=${patientId}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to fetch orders");

      const map: { [key: string]: Order } = {};
      (data.orders || []).forEach((order: Order) => {
        const key = extractPharmacyId(order);
        if (key) map[key] = order;
      });

      setOrdersMap(map);
    } catch (err: any) {
      console.warn("fetchOrders:", err.message);
    }
  };

  const placeOrder = async (pharmacyId: string, pharmacyName: string) => {
    if (!patientId || !searchQuery.trim()) return;

    try {
      // Show optimistic update
      setOrdersMap((prev) => ({ 
        ...prev, 
        [pharmacyId]: { 
          _id: 'temp', 
          status: "pending", 
          pharmacyId: pharmacyId,
          createdAt: new Date().toISOString()
        } 
      }));

      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          patientId, 
          pharmacyId, 
          medicineName: searchQuery 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.order) {
          const key = extractPharmacyId(data.order) || pharmacyId;
          setOrdersMap((prev) => ({ ...prev, [key]: data.order }));
          Alert.alert("Info", data.message || "Order already exists");
          return;
        }
        throw new Error(data.message || "Failed to place order");
      }

      const createdOrder = data.order;
      const key = extractPharmacyId(createdOrder) || pharmacyId;
      setOrdersMap((prev) => ({ ...prev, [key]: createdOrder }));
      
      Alert.alert("Success", `Order sent to ${pharmacyName} successfully!`);
    } catch (err: any) {
      // Revert optimistic update on error
      setOrdersMap((prev) => {
        const updated = { ...prev };
        delete updated[pharmacyId];
        return updated;
      });
      Alert.alert("Error", err.message);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return { text: "Order Sent", backgroundColor: "#F59E0B", icon: "time-outline" };
      case "confirmed":
        return { text: "Confirmed", backgroundColor: "#22C55E", icon: "checkmark-circle-outline" };
      case "rejected":
        return { text: "Rejected", backgroundColor: "#EF4444", icon: "close-circle-outline" };
      case "ready":
        return { text: "Ready for Pickup", backgroundColor: "#1E3A8A", icon: "bag-check-outline" };
      case "completed":
        return { text: "Completed", backgroundColor: "#059669", icon: "checkmark-done-outline" };
      default:
        return { text: "Unknown", backgroundColor: "#6B7280", icon: "help-circle-outline" };
    }
  };

  const renderStatusBadge = (pharmacyId: string) => {
    const order = ordersMap[pharmacyId];
    if (!order) return null;

    const statusConfig = getStatusConfig(order.status);

    return (
      <View style={[styles.statusBadge, { backgroundColor: statusConfig.backgroundColor }]}>
        <Ionicons name={statusConfig.icon as any} size={12} color="white" />
        <Text style={styles.statusText}>{statusConfig.text}</Text>
      </View>
    );
  };

  const renderPharmacyItem = ({ item }: { item: Pharmacy }) => {
    const pharmacyIdKey = String(item._id);
    const existingOrder = ordersMap[pharmacyIdKey];
    const isActive = existingOrder && ["pending", "confirmed", "ready"].includes(existingOrder.status);

    return (
      <View style={styles.pharmacyCard}>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.pharmacyIcon}>
              <Ionicons name="storefront-outline" size={20} color="white" />
            </View>
            <View style={styles.pharmacyInfo}>
              <Text style={styles.pharmacyName}>{item.name}</Text>
              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={14} color="rgba(30, 58, 138, 0.6)" />
                <Text style={styles.pharmacyAddress}>
                  {item.address || "Address not available"}
                </Text>
              </View>
              {item.distance && (
                <View style={styles.distanceRow}>
                  <Ionicons name="navigate-outline" size={14} color="rgba(30, 58, 138, 0.6)" />
                  <Text style={styles.distanceText}>{item.distance.toFixed(1)} km away</Text>
                </View>
              )}
            </View>
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>

          {renderStatusBadge(pharmacyIdKey)}

          <TouchableOpacity
            onPress={() => placeOrder(item._id, item.name)}
            disabled={!!isActive}
            style={[styles.orderButton, isActive && styles.orderButtonDisabled]}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={existingOrder ? "checkmark-circle" : "paper-plane"} 
              size={16} 
              color={isActive ? "rgba(30, 58, 138, 0.4)" : "white"} 
            />
            <Text style={[styles.orderButtonText, isActive && styles.orderButtonTextDisabled]}>
              {existingOrder ? "Order Sent" : "Send Order"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (!hasSearched) {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="search-outline" size={48} color="rgba(255,255,255,0.6)" />
          </View>
          <Text style={styles.emptyStateTitle}>Search for Medicine</Text>
          <Text style={styles.emptyStateText}>
            Enter the name of the medicine you need and we'll show you nearby pharmacies that have it in stock.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="medical-outline" size={48} color="rgba(255,255,255,0.6)" />
        </View>
        <Text style={styles.emptyStateTitle}>No Pharmacies Found</Text>
        <Text style={styles.emptyStateText}>
          No pharmacies found with "{searchQuery}" in your area. Try searching for a different medicine or check back later.
        </Text>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#1E3A8A', '#3B82F6', '#60A5FA']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="medical-outline" size={28} color="white" />
            </View>
            <Text style={styles.headerTitle}>Search Pharmacy</Text>
            <Text style={styles.headerSubtitle}>Find medicines near you</Text>
          </View>

          <TouchableOpacity 
            style={styles.ordersButton}
            onPress={() => router.push('/patient/screens/orders')}
          >
            <Ionicons name="bag-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={20} color="rgba(30, 58, 138, 0.6)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Enter medicine name..."
              placeholderTextColor="rgba(30, 58, 138, 0.4)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={fetchNearbyPharmacies}
            />
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={fetchNearbyPharmacies}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="search" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingIconContainer}>
              <ActivityIndicator size="large" color="white" />
            </View>
            <Text style={styles.loadingText}>Searching pharmacies...</Text>
          </View>
        ) : pharmacies.length > 0 ? (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Available Pharmacies</Text>
              <Text style={styles.resultsSubtitle}>
                {pharmacies.length} {pharmacies.length === 1 ? 'pharmacy' : 'pharmacies'} found
              </Text>
            </View>
            <FlatList
              data={pharmacies}
              keyExtractor={(item) => String(item._id)}
              renderItem={renderPharmacyItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </>
        ) : (
          renderEmptyState()
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerContent: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20
  },
  backButton: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)"
  },
  headerCenter: { alignItems: "center", flex: 1 },
  headerIconContainer: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center", marginBottom: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)"
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "white", marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)" },
  ordersButton: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)"
  },
  searchContainer: { marginTop: 10 },
  searchInputWrapper: {
    flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.3)"
  },
  searchInput: {
    flex: 1, color: "#1E3A8A", fontSize: 16, paddingVertical: 12, marginLeft: 10
  },
  searchButton: {
    backgroundColor: "#1E3A8A", padding: 8, borderRadius: 12, marginLeft: 8,
    shadowColor: "rgba(30, 58, 138, 0.3)", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 3
  },
  content: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingIconContainer: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center", marginBottom: 20,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)"
  },
  loadingText: { fontSize: 16, color: "white", fontWeight: "500" },
  resultsHeader: {
    backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.2)"
  },
  resultsTitle: { fontSize: 18, fontWeight: "600", color: "white", marginBottom: 4 },
  resultsSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)" },
  listContainer: { padding: 20 },
  pharmacyCard: {
    marginBottom: 16, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "rgba(0, 0, 0, 0.3)", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6
  },
  cardContent: { backgroundColor: "rgba(255,255,255,0.95)", margin: 1, borderRadius: 17, padding: 16 },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16 },
  pharmacyIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "#1E3A8A",
    alignItems: "center", justifyContent: "center", marginRight: 12
  },
  pharmacyInfo: { flex: 1, marginRight: 12 },
  pharmacyName: { fontSize: 18, fontWeight: "700", color: "#1E3A8A", marginBottom: 6 },
  addressRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  pharmacyAddress: {
    fontSize: 14, color: "rgba(30, 58, 138, 0.7)", lineHeight: 20, marginLeft: 6, flex: 1
  },
  distanceRow: { flexDirection: "row", alignItems: "center" },
  distanceText: { fontSize: 12, color: "rgba(30, 58, 138, 0.6)", fontStyle: "italic", marginLeft: 6 },
  onlineIndicator: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#D1FAE5",
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12
  },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981", marginRight: 6 },
  onlineText: { fontSize: 12, fontWeight: "600", color: "#059669" },
  statusBadge: {
    flexDirection: "row", alignItems: "center", alignSelf: "flex-start",
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, marginBottom: 16, gap: 6
  },
  statusText: { fontSize: 12, fontWeight: "600", color: "white" },
  orderButton: {
    backgroundColor: "#1E3A8A", borderRadius: 12, paddingVertical: 14, alignItems: "center",
    flexDirection: "row", justifyContent: "center", gap: 8,
    shadowColor: "rgba(30, 58, 138, 0.3)", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6
  },
  orderButtonDisabled: {
    backgroundColor: "rgba(30, 58, 138, 0.1)", shadowOpacity: 0, elevation: 0
  },
  orderButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  orderButtonTextDisabled: { color: "rgba(30, 58, 138, 0.4)" },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  emptyIconContainer: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center", marginBottom: 20,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)"
  },
  emptyStateTitle: {
    fontSize: 24, fontWeight: "700", color: "white", marginBottom: 8, textAlign: "center"
  },
  emptyStateText: {
    fontSize: 16, color: "rgba(255,255,255,0.8)", textAlign: "center", lineHeight: 24
  },
});