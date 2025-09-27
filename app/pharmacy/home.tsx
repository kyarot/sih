// app/pharmacy/home.tsx
import { Stack, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from '@expo/vector-icons';
import { fetchConfirmedOrders, fetchPendingOrders, updateOrderStatus } from "./apihelper";
import DashboardSection from "./DashboardSection";
import InventorySection from "./InventorySection";
import NotificationsSection from "./NotificationsSection";
import OrdersSection from "./OrdersSection";
import PharmacyHeader from "./PharmacyHeader";
import ProfileModal from "./ProfileModal";
import SidebarNav from "./SidebarNav";

import { ActiveSection, Item, Notification, Order, Profile } from "./types";
import React from "react";

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

  // ===== Enhanced Floating Navigation Items =====
  const floatingNavItems: { 
    id: string; 
    icon: keyof typeof MaterialIcons.glyphMap; 
    count: number | null;
    isCenter?: boolean;
  }[] = [
    { id: "notifications", icon: "notifications-active", count: notifications.length },
    { id: "dashboard", icon: "home", count: null, isCenter: true },
    { id: "inventory", icon: "local-pharmacy", count: null },
    {
      id: "orders",
      icon: "shopping-cart",
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

      {/* Compact Header */}
      <View style={styles.headerContainer}>
        <PharmacyHeader 
          profile={profile} 
          isOnline={isOnline} 
          setIsOnline={setIsOnline} 
          onOpenProfile={() => setShowProfile(true)} 
        />
      </View>

      {/* Main Content - Full Screen Layout */}
      <View style={styles.mainContent}>
        {/* Desktop Sidebar - Keep for desktop */}
        {!isMobile && (
          <View style={styles.sidebarContainer}>
            <SidebarNav 
              activeSection={activeSection} 
              setActiveSection={setActiveSection} 
              navItems={[
                { id: "dashboard", label: "Dashboard", icon: "dashboard", count: null },
                { id: "notifications", label: "Notifications", icon: "notifications", count: notifications.length },
                { id: "inventory", label: "Inventory", icon: "inventory", count: dashboardMetrics.totalInventory },
                {
                  id: "orders",
                  label: "Orders",
                  icon: "receipt-long",
                  count: orders.filter((o: Order) => o.status === "pending" || o.status === "ready").length,
                },
              ]} 
            />
          </View>
        )}

        {/* Content Area */}
        <View style={[styles.contentContainer, isMobile && styles.mobileContentContainer]}>
          <View style={[styles.contentWrapper, isMobile && styles.mobileContentWrapper]}>
            {renderContent()}
          </View>
        </View>
      </View>

      {/* Floating Navigation Bar - Mobile Only */}
      {isMobile && (
        <View style={[styles.floatingNavContainer, { bottom: Math.max(25, 25 + insets.bottom) }]}>
          <View style={styles.floatingNavBar}>
            {floatingNavItems.map((item, index) => (
              <View 
                key={item.id} 
                style={[
                  styles.floatingNavButton,
                  item.isCenter && styles.centerNavButton,
                  activeSection === item.id && !item.isCenter && styles.activeNavButton
                ]}
                onTouchEnd={() => setActiveSection(item.id as ActiveSection)}
              >
                <MaterialIcons
                  name={item.icon}
                  size={item.isCenter ? 28 : 24}
                  color={
                    item.isCenter ? '#FFFFFF' :
                    activeSection === item.id ? '#1E40AF' : '#64748B'
                  }
                />
                {item.count !== null && item.count > 0 && (
                  <View style={styles.floatingBadge}>
                    <Text style={styles.floatingBadgeText}>
                      {item.count > 99 ? '99+' : item.count}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
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
    backgroundColor: 'white',
  },
  
  // Compact Header Styles
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  
  // Main Content Layout
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
  },
  
  // Desktop Sidebar
  sidebarContainer: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 0 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
    zIndex: 50,
  },
  
  // Content Container
  contentContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 0,
  },
  mobileContentContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingBottom: 100, // Space for floating nav
  },
  
  contentWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    overflow: 'hidden',
  },
  mobileContentWrapper: {
    borderRadius: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  // Floating Navigation Styles
  floatingNavContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: 20,
  },
  
  floatingNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(25px)',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    width: 320,
    height: 72,
  },
  
  floatingNavButton: {
    position: 'relative',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: 'transparent',
  },
  
  centerNavButton: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.05 }],
  },
  
  activeNavButton: {
    backgroundColor: 'rgba(30, 64, 175, 0.1)',
    borderWidth: 2,
    borderColor: '#1E40AF',
    transform: [{ scale: 1.0 }],
  },
  
  floatingBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  floatingBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
});