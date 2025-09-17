import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
export default function SearchPharma() {
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersMap, setOrdersMap] = useState<{ [key: string]: any }>({});
  const [patientUid, setPatientUid] = useState<string | null>(null);
  // const [patientId,setpatientId]=useState<string | null>(null);
  // const [prescriptionId,setprescriptionId]=useState<string | null>(null);
  
  
// useEffect(() => {
//     const fetchUid = async () => {
//       const uid = await AsyncStorage.getItem("patientUid");
//       const id = await AsyncStorage.getItem("patientId");
//       if (!uid) {
//         Alert.alert("Error", "No patient UID found, please log in again.");
//         return;
//       }
//       if (!id) {
//         Alert.alert("Error", "patient id was not found, please log in again.");
//         return;
//       }
//       setPatientUid(uid);
//       setpatientId(id);
//     };
//     fetchUid();
//   }, []);

  
  const API_BASE = "http://localhost:5000/api";

  const patientId = "68ca84ec9d5dbf4593515b75"; // replace with logged-in patient ObjectId
  const prescriptionId = "68c84b6413c049c87529b85c"; // replace with prescription ObjectId

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
        // fallback to /orders if /latest not available
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
        // since backend sorts by createdAt desc, keep the first
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
      // optimistic update
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
        // revert optimistic
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

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  /** Render status line for a given pharmacy */
  const renderStatusText = (pharmacyId: string) => {
    const order = ordersMap[pharmacyId];
    if (!order) return null;

    const status = order.status;
    switch (status) {
      case "pending":
        return <Text>Your order is sent and pending</Text>;
      case "confirmed":
        return <Text>Order is confirmed</Text>;
      case "rejected":
        return <Text style={{ color: "red" }}>Order was rejected</Text>;
      case "ready":
        return <Text>Order is ready at pharmacy</Text>;
      case "completed":
        return <Text>Order is completed</Text>;
      default:
        return <Text>Status: {status ?? "unknown"}</Text>;
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Nearby Pharmacies
      </Text>

      {pharmacies.length === 0 ? (
        <Text>No pharmacies nearby</Text>
      ) : (
        <FlatList
          data={pharmacies}
          keyExtractor={(item) => String(item._id)}
          renderItem={({ item }) => {
            const pharmacyIdKey = String(item._id);
            const existingOrder = ordersMap[pharmacyIdKey];
            const existingStatus = existingOrder ? existingOrder.status : null;

            const isActive =
              existingStatus && ["pending", "confirmed", "ready"].includes(existingStatus);

            return (
              <View
                style={{
                  padding: 15,
                  backgroundColor: "#f2f2f2",
                  marginBottom: 10,
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "600" }}>{item.name}</Text>
                <Text style={{ fontSize: 14, color: "gray" }}>
                  {item.address || "No address"}
                </Text>
                <Text style={{ fontSize: 14 }}>✅ Online</Text>

                <View style={{ marginTop: 8 }}>{renderStatusText(pharmacyIdKey)}</View>

                <TouchableOpacity
                  onPress={() => placeOrder(item._id)}
                  disabled={!!isActive}
                  style={{
                    marginTop: 10,
                    backgroundColor: isActive ? "#ccc" : "#007bff",
                    padding: 10,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "white", textAlign: "center" }}>
                    {existingOrder ? (isActive ? "Order Sent" : "Order Sent") : "Order Now"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
