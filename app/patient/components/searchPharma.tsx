import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get('window');

export default function SearchPharma() {
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersMap, setOrdersMap] = useState<{ [key: string]: any }>({});
  const [patientUid, setPatientUid] = useState<string | null>(null);
  
  const API_BASE = "https://5aa83c1450d9.ngrok-free.app/api";
  const patientId = "68ca84ec9d5dbf4593515b75";
  const prescriptionId = "68c84b6413c049c87529b85c";

  /** Extract pharmacyId string from any order shape */
  const extractPharmacyId = (order: any): string => {
    if (!order) return "";

    // Case 1: populated pharmacyId object
    if (order.pharmacyId && typeof order.pharmacyId === "object" && order.pharmacyId._id) {
      return String(order.pharmacyId._id);
    }

    // Case 2: pharmacyId as string
    if (typeof order.pharmacyId === "string") return order.pharmacyId;

    // Case 3: aggregation pipeline added `pharmacy`
    if (order.pharmacy && order.pharmacy._id) {
      return String(order.pharmacy._id);
    }

    return "";
  };

  /** Fetch pharmacies near patient */
  const fetchNearbyPharmacies = async () => {
    try {
      const res = await fetch(`${API_BASE}/pharmacies/nearby/${patientId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch pharmacies");
      setPharmacies(data.pharmacies || []);
    } catch (err: any) {
      console.warn("fetchNearbyPharmacies:", err.message);
    }
  };

  /** Fetch orders (latest per pharmacy if available) */
  const fetchOrders = async () => {
    try {
      let res = await fetch(
        `${API_BASE}/orders/latest?patientId=${patientId}&prescriptionId=${prescriptionId}`
      );

      if (!res.ok) {
        res = await fetch(
          `${API_BASE}/orders?patientId=${patientId}&prescriptionId=${prescriptionId}`
        );
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch orders");

      console.log("fetchOrders - raw:", data.orders);

      const map: { [key: string]: any } = {};
      (data.orders || []).forEach((o: any) => {
        const key = extractPharmacyId(o);
        if (!key) {
          console.warn("Could not extract pharmacyId from order:", o);
          return;
        }
        if (!map[key]) map[key] = o;
      });

      setOrdersMap(map);
    } catch (err: any) {
      console.warn("fetchOrders:", err.message);
    }
  };

  /** Place new order */
  const placeOrder = async (pharmacyId: string) => {
    try {
      setOrdersMap((prev) => ({ ...prev, [pharmacyId]: { status: "pending", _temp: true } }));

      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, pharmacyId, prescriptionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.order) {
          const key = extractPharmacyId(data.order) || pharmacyId;
          setOrdersMap((prev) => ({ ...prev, [key]: data.order }));
          Alert.alert("Info", data.message || "Order already exists");
          return;
        }
        setOrdersMap((prev) => {
          const next = { ...prev };
          delete next[pharmacyId];
          return next;
        });
        throw new Error(data.message || "Failed to place order");
      }

      const createdOrder = data.order;
      const key = extractPharmacyId(createdOrder) || pharmacyId;
      setOrdersMap((prev) => ({ ...prev, [key]: createdOrder }));
      Alert.alert("Success", "Order sent to pharmacy");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchNearbyPharmacies(), fetchOrders()]);
      setLoading(false);
    };

    loadAll();

    const interval = setInterval(() => {
      fetchNearbyPharmacies();
      fetchOrders();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.loadingText}>Finding nearby pharmacies...</Text>
      </View>
    );
  }

  /** Render status with icon and styling */
  const renderStatusBadge = (pharmacyId: string) => {
    const order = ordersMap[pharmacyId];
    if (!order) return null;

    const status = order.status;
    let statusConfig = {
      text: "Unknown",
      backgroundColor: "#E5E7EB",
      textColor: "#6B7280",
      icon: "●"
    };

    switch (status) {
      case "pending":
        statusConfig = {
          text: "Order Sent",
          backgroundColor: "#FEF3C7",
          textColor: "#D97706",
          icon: "⏱"
        };
        break;
      case "confirmed":
        statusConfig = {
          text: "Confirmed",
          backgroundColor: "#D1FAE5",
          textColor: "#059669",
          icon: "✓"
        };
        break;
      case "rejected":
        statusConfig = {
          text: "Rejected",
          backgroundColor: "#FEE2E2",
          textColor: "#DC2626",
          icon: "✗"
        };
        break;
      case "ready":
        statusConfig = {
          text: "Ready for Pickup",
          backgroundColor: "#DBEAFE",
          textColor: "#1E40AF",
          icon: "✓"
        };
        break;
      case "completed":
        statusConfig = {
          text: "Completed",
          backgroundColor: "#D1FAE5",
          textColor: "#059669",
          icon: "✓"
        };
        break;
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: statusConfig.backgroundColor }]}>
        <Text style={[styles.statusIcon, { color: statusConfig.textColor }]}>
          {statusConfig.icon}
        </Text>
        <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
          {statusConfig.text}
        </Text>
      </View>
    );
  };

  interface Pharmacy {
    _id: string;
    name: string;
    address?: string;
    // Add other properties as needed
  }

  const renderPharmacyItem = ({ item }: { item: Pharmacy }) => {
    const pharmacyIdKey = String(item._id);
    const existingOrder = ordersMap[pharmacyIdKey];
    const existingStatus = existingOrder ? existingOrder.status : null;
    const isActive = existingStatus && ["pending", "confirmed", "ready"].includes(existingStatus);

    return (
      <View style={styles.pharmacyCard}>
        <View style={styles.cardHeader}>
          <View style={styles.pharmacyInfo}>
            <Text style={styles.pharmacyName}>{item.name}</Text>
            <Text style={styles.pharmacyAddress}>{item.address || "Address not available"}</Text>
          </View>
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>

        {renderStatusBadge(pharmacyIdKey)}

        <TouchableOpacity
          onPress={() => placeOrder(item._id)}
          disabled={!!isActive}
          style={[
            styles.orderButton,
            isActive && styles.orderButtonDisabled
          ]}
        >
          <Text style={[
            styles.orderButtonText,
            isActive && styles.orderButtonTextDisabled
          ]}>
            {existingOrder ? "Order Sent" : "Send Order"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Pharmacies</Text>
        <Text style={styles.subtitle}>
          {pharmacies.length} {pharmacies.length === 1 ? 'pharmacy' : 'pharmacies'} available
        </Text>
      </View>

      {pharmacies.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🏥</Text>
          <Text style={styles.emptyStateTitle}>No Pharmacies Found</Text>
          <Text style={styles.emptyStateText}>
            We couldn't find any pharmacies in your area at the moment.
          </Text>
        </View>
      ) : (
        <FlatList
          data={pharmacies}
          keyExtractor={(item) => String(item._id)}
          renderItem={renderPharmacyItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#1E40AF',
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
  },
  listContainer: {
    padding: 24,
  },
  pharmacyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#1E40AF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  pharmacyInfo: {
    flex: 1,
    marginRight: 12,
  },
  pharmacyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  pharmacyAddress: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 6,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#1E40AF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  orderButtonDisabled: {
    backgroundColor: '#F3F4F6',
    shadowOpacity: 0,
    elevation: 0,
  },
  orderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  orderButtonTextDisabled: {
    color: '#9CA3AF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});