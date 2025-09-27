// Orders.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { JSX, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    
} from "react-native";

const { width, height } = Dimensions.get("window");

interface Order {
  _id: string;
  patientId: string;
  pharmacyId: {
    _id: string;
    name: string;
    address?: string;
  };
  prescriptionId?: string;
  medicineName?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'ready' | 'completed';
  createdAt: string;
  updatedAt: string;
  estimatedTime?: string;
  totalAmount?: number;
  orderNotes?: string;
}

export default function Orders(): JSX.Element {
  const navigation = useNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const API_BASE = "https://7300c4c894de.ngrok-free.app/api";

  const statusFilters = [
    { key: 'all', label: 'All Orders', icon: 'list-outline' },
    { key: 'pending', label: 'Pending', icon: 'time-outline' },
    { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-outline' },
    { key: 'ready', label: 'Ready', icon: 'bag-check-outline' },
    { key: 'completed', label: 'Completed', icon: 'checkmark-done-outline' },
  ];

  useEffect(() => {
    const loadPatientData = async () => {
      const id = await AsyncStorage.getItem("patientId");
      setPatientId(id);
      if (id) {
        fetchOrders(id);
      }
    };
    loadPatientData();
  }, []);

  const fetchOrders = async (patientIdParam?: string) => {
    const id = patientIdParam || patientId;
    if (!id) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/orders?patientId=${id}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch orders");

      // Sort orders by creation date (newest first)
      const sortedOrders = (data.orders || []).sort((a: Order, b: Order) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setOrders(sortedOrders);
    } catch (err: any) {
      console.warn("fetchOrders:", err.message);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return { 
          text: "Pending", 
          backgroundColor: "rgba(251, 191, 36, 0.15)", 
          textColor: "#F59E0B", 
          icon: "time-outline",
          description: "Order sent to pharmacy",
          borderColor: "rgba(251, 191, 36, 0.3)"
        };
      case "confirmed":
        return { 
          text: "Confirmed", 
          backgroundColor: "rgba(59, 130, 246, 0.15)", 
          textColor: "#3B82F6", 
          icon: "checkmark-outline",
          description: "Order confirmed by pharmacy",
          borderColor: "rgba(59, 130, 246, 0.3)"
        };
      case "rejected":
        return { 
          text: "Rejected", 
          backgroundColor: "rgba(239, 68, 68, 0.15)", 
          textColor: "#EF4444", 
          icon: "close-outline",
          description: "Order rejected by pharmacy",
          borderColor: "rgba(239, 68, 68, 0.3)"
        };
      case "ready":
        return { 
          text: "Ready for Pickup", 
          backgroundColor: "rgba(34, 197, 94, 0.15)", 
          textColor: "#22C55E", 
          icon: "bag-check-outline",
          description: "Ready for collection",
          borderColor: "rgba(34, 197, 94, 0.3)"
        };
      case "completed":
        return { 
          text: "Completed", 
          backgroundColor: "rgba(34, 197, 94, 0.15)", 
          textColor: "#22C55E", 
          icon: "checkmark-done-outline",
          description: "Order completed",
          borderColor: "rgba(34, 197, 94, 0.3)"
        };
      default:
        return { 
          text: "Unknown", 
          backgroundColor: "rgba(107, 114, 128, 0.15)", 
          textColor: "#6B7280", 
          icon: "help-outline",
          description: "Status unknown",
          borderColor: "rgba(107, 114, 128, 0.3)"
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 2) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
      });
    }
  };

  const getFilteredOrders = () => {
    if (activeFilter === 'all') return orders;
    return orders.filter(order => order.status === activeFilter);
  };

  const renderStatusBadge = (status: string) => {
    const config = getStatusConfig(status);
    return (
      <View style={[styles.statusBadge, { 
        backgroundColor: config.backgroundColor,
        borderColor: config.borderColor,
      }]}>
        <Ionicons 
          name={config.icon as any} 
          size={12} 
          color={config.textColor} 
          style={styles.statusBadgeIcon} 
        />
        <Text style={[styles.statusBadgeText, { color: config.textColor }]}>
          {config.text}
        </Text>
      </View>
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusConfig = getStatusConfig(item.status);
    const pharmacyName = typeof item.pharmacyId === 'object' 
      ? item.pharmacyId.name 
      : 'Unknown Pharmacy';
    const pharmacyAddress = typeof item.pharmacyId === 'object' 
      ? item.pharmacyId.address 
      : '';

    return (
      <View style={styles.orderCard}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
          style={styles.orderCardGradient}
        >
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderTitle}>
                {item.medicineName || 'Medicine Order'}
              </Text>
              <Text style={styles.pharmacyName}>{pharmacyName}</Text>
              {pharmacyAddress && (
                <Text style={styles.pharmacyAddress} numberOfLines={1}>
                  {pharmacyAddress}
                </Text>
              )}
            </View>
            {renderStatusBadge(item.status)}
          </View>

          <View style={styles.orderDetails}>
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="calendar-outline" size={14} color="#6366F1" />
              </View>
              <Text style={styles.detailText}>{formatDate(item.createdAt)}</Text>
            </View>
            
            {item.estimatedTime && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="time-outline" size={14} color="#6366F1" />
                </View>
                <Text style={styles.detailText}>Est. {item.estimatedTime}</Text>
              </View>
            )}

            {item.totalAmount && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="card-outline" size={14} color="#6366F1" />
                </View>
                <Text style={styles.detailText}>₹{item.totalAmount}</Text>
              </View>
            )}
          </View>

          {item.orderNotes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesTitle}>Notes:</Text>
              <Text style={styles.notesText}>{item.orderNotes}</Text>
            </View>
          )}

          <View style={styles.orderFooter}>
            <Text style={styles.orderDescription}>{statusConfig.description}</Text>
            <TouchableOpacity style={styles.viewDetailsButton} activeOpacity={0.8}>
              <LinearGradient
                colors={['rgba(30, 58, 138, 0.1)', 'rgba(59, 130, 246, 0.1)']}
                style={styles.viewDetailsButtonGradient}
              >
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Ionicons name="chevron-forward" size={16} color="#1E3A8A" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderFilterTabs = () => {
    return (
      <View style={styles.filterContainer}>
        <FlatList
          data={statusFilters}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterTabs}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterTab]}
              onPress={() => setActiveFilter(item.key)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={activeFilter === item.key 
                  ? ['#1E3A8A', '#3B82F6'] 
                  : ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.6)']
                }
                style={styles.filterTabGradient}
              >
                <Ionicons 
                  name={item.icon as any} 
                  size={16} 
                  color={activeFilter === item.key ? "white" : "#6366F1"} 
                  style={styles.filterTabIcon}
                />
                <Text style={[
                  styles.filterTabText,
                  activeFilter === item.key && styles.filterTabTextActive
                ]}>
                  {item.label}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderEmptyState = () => {
    const isFiltered = activeFilter !== 'all';
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyStateIconContainer}>
          <LinearGradient
            colors={['rgba(30, 58, 138, 0.1)', 'rgba(59, 130, 246, 0.05)']}
            style={styles.emptyStateIconGradient}
          >
            <Text style={styles.emptyStateIcon}>📋</Text>
          </LinearGradient>
        </View>
        <Text style={styles.emptyStateTitle}>
          {isFiltered ? `No ${activeFilter} orders` : 'No Orders Yet'}
        </Text>
        <Text style={styles.emptyStateText}>
          {isFiltered 
            ? `You don't have any ${activeFilter} orders at the moment.`
            : 'Start by searching for medicines and placing your first order!'
          }
        </Text>
        {!isFiltered && (
          <TouchableOpacity 
            style={styles.searchMedicineButton}
            onPress={() => navigation.navigate("SearchPharma" as never)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#1E3A8A', '#3B82F6']}
              style={styles.searchMedicineButtonGradient}
            >
              <Text style={styles.searchMedicineButtonText}>Search Medicine</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const filteredOrders = getFilteredOrders();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />

      {/* Background Gradient */}
      <LinearGradient
        colors={['#1E3A8A', '#3B82F6', '#60A5FA']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
              style={styles.headerButtonGradient}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>My Orders</Text>
            <Text style={styles.headerSubtitle}>Track your medicine orders</Text>
          </View>

          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={refreshing}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
              style={styles.headerButtonGradient}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="refresh" size={24} color="white" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {orders.length > 0 && (
          <View style={styles.statsContainer}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.statsGradient}
            >
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{orders.length}</Text>
                <Text style={styles.statLabel}>Total Orders</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {orders.filter(o => o.status === 'pending').length}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {orders.filter(o => o.status === 'completed').length}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </LinearGradient>
          </View>
        )}
      </View>

      {/* Filter Tabs */}
      {orders.length > 0 && renderFilterTabs()}

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading your orders...</Text>
          </View>
        ) : filteredOrders.length > 0 ? (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item._id}
            renderItem={renderOrderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["white"]}
                tintColor="white"
              />
            }
          />
        ) : (
          renderEmptyState()
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  backButton: {
    width: 44,
    height: 44,
  },
  refreshButton: {
    width: 44,
    height: 44,
  },
  headerButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitleContainer: {
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    marginTop: 2,
  },
  statsContainer: {
    marginTop: 10,
  },
  statsGradient: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "white",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  filterContainer: {
    paddingVertical: 20,
  },
  filterTabs: {
    paddingHorizontal: 20,
  },
  filterTab: {
    marginRight: 12,
  },
  filterTabGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterTabIcon: {
    marginRight: 8,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366F1",
  },
  filterTabTextActive: {
    color: "white",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  listContainer: {
    padding: 20,
  },
  orderCard: {
    marginBottom: 20,
  },
  orderCardGradient: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  orderInfo: {
    flex: 1,
    marginRight: 16,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 6,
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  pharmacyAddress: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusBadgeIcon: {
    marginRight: 6,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  orderDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  detailText: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "600",
  },
  notesSection: {
    backgroundColor: "rgba(99, 102, 241, 0.05)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 6,
  },
  notesText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderDescription: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
    flex: 1,
    fontWeight: "500",
  },
  viewDetailsButton: {
    marginLeft: 12,
  },
  viewDetailsButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.2)',
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E3A8A",
    marginRight: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyStateIconContainer: {
    marginBottom: 24,
  },
  emptyStateIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  emptyStateIcon: {
    fontSize: 48,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    fontWeight: "500",
  },
  searchMedicineButton: {
    marginTop: 8,
  },
  searchMedicineButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  searchMedicineButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});