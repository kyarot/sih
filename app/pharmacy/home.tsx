// app/pharmacy/home.tsx
import { Stack, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchConfirmedOrders, fetchPendingOrders, updateOrderStatus } from "./apihelper";
import DashboardSection from "./DashboardSection";
import InventorySection from "./InventorySection";
import NotificationsSection from "./NotificationsSection";
import OrdersSection from "./OrdersSection";
import PharmacyHeader from "./PharmacyHeader";
import ProfileModal from "./ProfileModal";
import SidebarNav from "./SidebarNav";

import { ActiveSection, Item, Notification, Order, Profile } from "./types";

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export default function PharmacyHome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ===== Navigation State =====
  const [activeSection, setActiveSection] = useState<ActiveSection>("dashboard");

  // ===== Status & Profile State =====
  const [isOnline, setIsOnline] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    ownerName: "Dr. Rajesh Kumar",
    shopName: "MediConnect Pharmacy",
    phone: "+91 98765 43210",
    address: "123 Medical Street, Health Colony, Bangalore 560001",
    license: "KA-PHM-2024-001234",
    email: "rajesh@medicare.com",
  });
  const [tempProfile, setTempProfile] = useState<Profile>(profile);

  // ===== Synchronized Inventory State (matching inventory.tsx) =====
  const [items, setItems] = useState<Item[]>([
    { id: "i1", name: "Paracetamol 500mg", qty: 120, price: 30, category: "Pain Relief" },
    { id: "i2", name: "Amoxicillin 250mg", qty: 40, price: 120, category: "Antibiotic" },
    { id: "i3", name: "Crocin Advance", qty: 8, price: 25, category: "Pain Relief" },
    { id: "i4", name: "Azithromycin 500mg", qty: 65, price: 180, category: "Antibiotic" },
    { id: "i5", name: "Dolo 650mg", qty: 85, price: 35, category: "Pain Relief" },
    { id: "i6", name: "Cetirizine 10mg", qty: 45, price: 15, category: "Allergy" },
    { id: "i7", name: "Omeprazole 20mg", qty: 12, price: 95, category: "Gastric" },
    { id: "i8", name: "Metformin 500mg", qty: 75, price: 80, category: "Diabetes" },
    { id: "i9", name: "Aspirin 75mg", qty: 5, price: 20, category: "Cardio" },
    { id: "i10", name: "Vitamin D3", qty: 95, price: 150, category: "Vitamin" },
  ]);

  // ===== Inventory Management (consistent with inventory.tsx) =====
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const addItem = () => {
    if (!name || !qty) return alert("Enter medicine name and quantity");
    const newItem: Item = {
      id: Date.now().toString(),
      name,
      qty: parseInt(qty, 10),
      price: price ? parseFloat(price) : undefined,
      category: category || "General",
    };
    setItems((s: Item[]) => [newItem, ...s]);
    setName("");
    setQty("");
    setPrice("");
    setCategory("");
  };

  const deleteItem = (id: string) => {
    setItems((s: Item[]) => s.filter((i: Item) => i.id !== id));
  };

  const updateQty = (id: string, delta: number) => {
    setItems((s: Item[]) => s.map((it: Item) => (it.id === id ? { ...it, qty: Math.max(0, it.qty + delta) } : it)));
  };

  // ===== Dashboard Metrics (calculated from real data) =====
  const dashboardMetrics = useMemo(() => {
    const lowStockCount = items.filter((item: Item) => item.qty <= 20).length;
    const totalItems = items.length;
    const totalValue = items.reduce((sum: number, item: Item) => sum + item.qty * (item.price || 0), 0);

    return {
      lowStockItems: lowStockCount,
      totalInventory: totalItems,
      inventoryValue: totalValue,
    };
  }, [items]);

  // ===== Orders & Notifications State (fetched from backend) =====
  const PHARMACY_ID = "68c7e45c7e560baf62e8d973";
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(15420);

  // ===== Data loading =====
  const reloadData = async (): Promise<void> => {
    try {
      const pending: any = await fetchPendingOrders(PHARMACY_ID);
      setNotifications(
        Array.isArray(pending['orders'])
          ? pending['orders'].map((p: any) => ({
              id: p._id,
              patientName: p.patientId.name ?? p.patientName ?? p.patient_name ?? "Unknown",
              patientPhone: p.patientId.phone ?? p.patientPhone ?? p.patient_phone ?? "",
              items: p.medicines ?? [],
              pickup: p.pickup ?? "delivery",
              address: p.patientId.address ?? p.address ?? "",
              timestamp: p.updatedAt ? new Date(p.updatedAt) : (p.timestamp ? new Date(p.timestamp) : new Date()),
            }))
          : []
      );

      const confirmed: any = await fetchConfirmedOrders(PHARMACY_ID);
      setOrders(
        Array.isArray(confirmed['orders'])
          ? confirmed['orders'].map((o: any) => ({
              id: o._id,
              patientName: o.patientId.name ?? o.patient_name ?? "Unknown",
              items: o.medicines ?? [],
              pickup: o.pickup ?? "delivery",
              status: o.status ?? "pending",
            }))
          : []
      );

      setPendingOrdersCount(Array.isArray(pending['orders']) ? pending['orders'].length : 0);
    } catch (err) {
      console.warn("Failed loading orders:", err);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  // ===== Stock Status Helper =====
  const getStockStatus = (qty: number) => {
    if (qty <= 10) return { color: "#FF3B30", status: "Critical" };
    if (qty <= 20) return { color: "#FF9500", status: "Low" };
    if (qty <= 50) return { color: "#007AFF", status: "Medium" };
    return { color: "#34C759", status: "Good" };
  };

  // ===== Notification Actions (use API) =====
  const acceptOrder = async (notificationId: string): Promise<void> => {
    const notification = notifications.find((n: Notification) => n.id === notificationId);
    if (!notification) return;

    try {
      await updateOrderStatus(notificationId, "confirmed");

      setItems((prevItems: Item[]) =>
        prevItems.map((item: Item) => {
          const orderItem = notification.items.find(
            (oi: any) =>
              item.name.trim().toLowerCase() ===
              oi.name.trim().toLowerCase()
          );
          return orderItem
            ? { ...item, qty: Math.max(0, item.qty - (orderItem.qty ?? orderItem.quantity ?? 0)) }
            : item;
        })
      );

      alert(`Order from ${notification.patientName} accepted.`);
      await reloadData();
      setActiveSection("orders");
    } catch (err) {
      console.warn("Accept order failed", err);
      alert("Failed to accept order. Try again.");
    }
  };

  const rejectOrder = async (notificationId: string): Promise<void> => {
    const notification = notifications.find((n: Notification) => n.id === notificationId);
    if (!notification) return;

    try {
      await updateOrderStatus(notificationId, "rejected");
      alert(`Order from ${notification.patientName} rejected.`);
      await reloadData();
    } catch (err) {
      console.warn("Reject order failed", err);
      alert("Failed to reject order. Try again.");
    }
  };

  // ===== Orders actions (mark ready / complete) =====
  const changeStatus = async (id: string, newStatus: Order["status"]): Promise<void> => {
    try {
      let backendStatus = newStatus;
      await updateOrderStatus(id, backendStatus);
      setOrders((prev: Order[]) => prev.map((o: Order) => (o.id === id ? { ...o, status: newStatus } : o)));
      if (newStatus === "completed") {
        setPendingOrdersCount((prev: number) => Math.max(0, prev - 1));
      }
      alert("Order updated.");
    } catch (err) {
      console.warn("Change order status failed", err);
      alert("Failed to update order. Try again.");
    }
  };

  // ===== Notifications helper =====
  const getTimeAgo = (timestamp?: Date) => {
    if (!timestamp) return "";
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes === 1) return "1 minute ago";
    if (minutes < 60) return `${minutes} minutes ago`;

    const hours = Math.floor(minutes / 60);
    if (hours === 1) return "1 hour ago";
    return `${hours} hours ago`;
  };

  const saveProfile = () => {
    setProfile(tempProfile);
    setEditingProfile(false);
    alert("Profile updated successfully!");
  };

  const cancelEdit = () => {
    setTempProfile(profile);
    setEditingProfile(false);
  };

  const logout = () => router.replace("/");

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "#FF9500";
      case "ready":
        return "#007AFF";
      case "completed":
        return "#34C759";
      default:
        return "#8E8E93";
    }
  };

  // ===== Navigation Functions =====
  const navigateToFullInventory = () => {
    router.push("/pharmacy/inventory");
  };

  // ===== Sidebar Navigation Items =====
  const navItems: { id: string; label: string; icon: string; count: number | null }[] = [
    { id: "dashboard", label: "Dashboard", icon: "📊", count: null },
    { id: "notifications", label: "Notifications", icon: "🔔", count: notifications.length },
    { id: "inventory", label: "Inventory", icon: "💊", count: dashboardMetrics.totalInventory },
    {
      id: "orders",
      label: "Orders",
      icon: "📋",
      count: orders.filter((o: Order) => o.status === "pending" || o.status === "ready").length,
    },
  ];

  // ===== Filtered Items for Search =====
  const filteredItems = useMemo<Item[]>(() => {
    return items.filter((item: Item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [items, searchQuery]);

  // ===== Render Functions =====
  const renderDashboard = () => (
    <DashboardSection
      notificationsCount={notifications.length}
      pendingOrdersCount={pendingOrdersCount}
      todayRevenue={todayRevenue}
      dashboardMetrics={dashboardMetrics as any}
      onNavigateInventory={navigateToFullInventory}
      setActiveSection={setActiveSection}
    />
  );

  const renderNotifications = () => (
    <NotificationsSection
      notifications={notifications}
      items={items}
      getTimeAgo={getTimeAgo}
      acceptOrder={acceptOrder}
      rejectOrder={rejectOrder}
    />
  );

  const renderInventory = () => (
    <InventorySection
      name={name}
      qty={qty}
      price={price}
      category={category}
      setName={setName}
      setQty={setQty}
      setPrice={setPrice}
      setCategory={setCategory}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      filteredItems={filteredItems}
      addItem={addItem}
      updateQty={updateQty}
      deleteItem={deleteItem}
      getStockStatus={getStockStatus}
      onNavigateInventory={navigateToFullInventory}
    />
  );

  const renderOrders = () => (
    <OrdersSection orders={orders} changeStatus={changeStatus} getStatusColor={getStatusColor} />
  );

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboard();
      case "notifications":
        return renderNotifications();
      case "inventory":
        return renderInventory();
      case "orders":
        return renderOrders();
      default:
        return renderDashboard();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Enhanced Header */}
      <View style={styles.headerContainer}>
        <PharmacyHeader 
          profile={profile} 
          isOnline={isOnline} 
          setIsOnline={setIsOnline} 
          onOpenProfile={() => setShowProfile(true)} 
        />
      </View>

      {/* Main Content with Responsive Layout */}
      <View style={[styles.mainContent, isMobile && styles.mobileMainContent]}>
        {/* Enhanced Sidebar */}
        {!isMobile && (
          <View style={styles.sidebarContainer}>
            <SidebarNav 
              activeSection={activeSection} 
              setActiveSection={setActiveSection} 
              navItems={navItems} 
            />
          </View>
        )}

        {/* Enhanced Content Area */}
        <View style={[styles.contentContainer, isMobile && styles.mobileContentContainer]}>
          <View style={[styles.contentWrapper, isMobile && styles.mobileContentWrapper]}>
            {renderContent()}
          </View>
        </View>
      </View>

      {/* Mobile Navigation Bar */}
      {isMobile && (
        <View style={[styles.mobileNavBar, { paddingBottom: Math.max(12, 12 + insets.bottom - 6) }]}>
          {navItems.map((item) => (
            <View key={item.id} style={styles.mobileNavItem}>
              <View 
                style={[
                  styles.mobileNavButton, 
                  activeSection === item.id && styles.activeMobileNavButton
                ]}
                onTouchEnd={() => setActiveSection(item.id as ActiveSection)}
              >
                <Text style={[
                  styles.mobileNavIcon,
                  activeSection === item.id && styles.activeMobileNavIcon
                ]}>
                  {item.icon}
                </Text>
                {item.count !== null && item.count > 0 && (
                  <View style={styles.mobileBadge}>
                    <Text style={styles.mobileBadgeText}>{item.count}</Text>
                  </View>
                )}
              </View>
              <Text style={[
                styles.mobileNavLabel,
                activeSection === item.id && styles.activeMobileNavLabel
              ]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      )}

      <ProfileModal
        visible={showProfile}
        onClose={() => setShowProfile(false)}
        editingProfile={editingProfile}
        setEditingProfile={setEditingProfile}
        profile={profile}
        tempProfile={tempProfile}
        setTempProfile={setTempProfile}
        saveProfile={saveProfile}
        cancelEdit={cancelEdit}
        logout={logout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Header Styles
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 100,
  },
  
  // Main Content Layout
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
  },
  mobileMainContent: {
    flexDirection: 'column',
  },
  
  // Enhanced Sidebar
  sidebarContainer: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 1, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 50,
  },
  
  // Enhanced Content Container
  contentContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  mobileContentContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 80, // Space for mobile nav, extra safe area added at runtime
  },
  
  contentWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  mobileContentWrapper: {
    borderRadius: 12,
    shadowRadius: 8,
    elevation: 3,
  },
  
  // Mobile Navigation Bar
  mobileNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 12,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  
  mobileNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  mobileNavButton: {
    position: 'relative',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginBottom: 4,
  },
  
  activeMobileNavButton: {
    backgroundColor: '#1E40AF',
  },
  
  mobileNavIcon: {
    fontSize: 20,
  },
  
  activeMobileNavIcon: {
    transform: [{ scale: 1.1 }],
  },
  
  mobileNavLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  
  activeMobileNavLabel: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  
  mobileBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  
  mobileBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});