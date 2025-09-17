// app/pharmacy/home.tsx
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { fetchConfirmedOrders, fetchPendingOrders, updateOrderStatus } from "./apihelper";
import PharmacyLocation from "./loc";

type ActiveSection = "dashboard" | "notifications" | "inventory" | "orders";

interface Profile {
  ownerName: string;
  shopName: string;
  phone: string;
  address: string;
  license: string;
  email: string;
}

interface Item {
  id: string;
  name: string;
  qty: number;
  price?: number;
  category?: string;
}

interface OrderItem {
  name: string;
  qty: number;
}

interface Notification {
  id: string;
  patientName: string;
  patientPhone?: string;
  items: OrderItem[];
  pickup?: "delivery" | "pickup" | string;
  address?: string;
  timestamp?: Date;
}

interface Order {
  id: string;
  patientName: string;
  items: OrderItem[];
  pickup?: "delivery" | "pickup" | string;
  status: "pending" | "ready" | "completed" | string;
}
export default function PharmacyHome() {
  const router = useRouter();

  // ===== Navigation State =====
  const [activeSection, setActiveSection] = useState<ActiveSection>("dashboard");

  // ===== Status & Profile State =====
  const [isOnline, setIsOnline] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    ownerName: "Dr. Rajesh Kumar",
    shopName: "MediCare Pharmacy",
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
    setItems((s) => [newItem, ...s]);
    setName("");
    setQty("");
    setPrice("");
    setCategory("");
    // removed setTotalInventory usage — dashboardMetrics computes total from items
  };

  const deleteItem = (id: string) => {
    setItems((s) => s.filter((i) => i.id !== id));
    // removed setTotalInventory usage
  };

  const updateQty = (id: string, delta: number) => {
    setItems((s) => s.map((it) => (it.id === id ? { ...it, qty: Math.max(0, it.qty + delta) } : it)));
  };

  // ===== Dashboard Metrics (calculated from real data) =====
  const dashboardMetrics = useMemo(() => {
    const lowStockCount = items.filter((item) => item.qty <= 20).length;
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + item.qty * (item.price || 0), 0);

    return {
      lowStockItems: lowStockCount,
      totalInventory: totalItems,
      inventoryValue: totalValue,
    };
  }, [items]);

  // ===== Orders & Notifications State (fetched from backend) =====
  // NOTE: replace PHARMACY_ID with real id from auth/profile when available
  const PHARMACY_ID = "68c7e45c7e560baf62e8d973";
  const [notifications, setNotifications] = useState<Notification[]>([]); // pending orders from API
  const [orders, setOrders] = useState<Order[]>([]); // confirmed/active orders from API
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(15420);

  // ===== Data loading =====
  const reloadData = async () => {
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
              timestamp:p.updatedAt ? new Date(p.timestamp) : new Date(),
            }))
          : []
      );
      console.log("pending", pending['orders'][0].patientId.name);
      console.log("pending", pending['orders']);

      const confirmed: any = await fetchConfirmedOrders(PHARMACY_ID);
      
      console.log("confirmed", confirmed);
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
    // optional polling:
    // const t = setInterval(reloadData, 30000);
    // return () => clearInterval(t);
  }, []);

  // ===== Stock Status Helper =====
  const getStockStatus = (qty: number) => {
    if (qty <= 10) return { color: "#FF3B30", status: "Critical" };
    if (qty <= 20) return { color: "#FF9500", status: "Low" };
    if (qty <= 50) return { color: "#007AFF", status: "Medium" };
    return { color: "#34C759", status: "Good" };
  };

  // ===== Notification Actions (use API) =====
  const acceptOrder = async (notificationId: string) => {
    const notification = notifications.find((n) => n.id === notificationId);
    if (!notification) return;

    // // check stock availability (local check)
    // const unavailableItems = notification.items.filter((orderItem) => {
    //   const inventoryItem = items.find(
    //     (item) =>
    //       item.name.trim().toLowerCase() === orderItem.name.trim().toLowerCase()
    //   );
    //   return !inventoryItem || inventoryItem.qty < orderItem.qty;
    // });

    // if (unavailableItems.length > 0) {
    //   alert(
    //     `Insufficient stock for: ${unavailableItems
    //       .map((i) => i.name)
    //       .join(", ")}`
    //   );
    //   return;
    // }

    try {
      await updateOrderStatus(notificationId, "confirmed");

      // deduct local stock (optimistic)
      setItems((prevItems) =>
        prevItems.map((item) => {
          const orderItem = notification.items.find(
            (oi) =>
              item.name.trim().toLowerCase() ===
              oi.name.trim().toLowerCase()
          );
          return orderItem
            ? { ...item, qty: Math.max(0, item.qty - orderItem.qty) }
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

  const rejectOrder = async (notificationId: string) => {
    console.log("Rejecting order", notificationId);
    const notification = notifications.find((n) => n.id === notificationId);
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
  const changeStatus = async (id: string, newStatus: Order["status"]) => {
    try {
      let backendStatus = newStatus; // adapt mapping if backend uses different strings
      await updateOrderStatus(id, backendStatus);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
      if (newStatus === "completed") {
        setPendingOrdersCount((prev) => Math.max(0, prev - 1));
      }
      alert("Order updated.");
      // await reloadData();
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
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊", count: null },
    { id: "notifications", label: "Notifications", icon: "🔔", count: notifications.length },
    { id: "inventory", label: "Inventory", icon: "💊", count: dashboardMetrics.totalInventory },
    {
      id: "orders",
      label: "Orders",
      icon: "📋",
      count: orders.filter((o) => o.status === "pending" || o.status === "ready").length,
    },
  ];

  // ===== Filtered Items for Search =====
  const filteredItems = useMemo(() => {
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [items, searchQuery]);

  // ===== Render Functions =====
  const renderDashboard = () => (
    <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionHeader}>Dashboard Overview</Text>

      <View style={styles.dashboardGrid}>
        <View style={[styles.dashCard, styles.notificationCardBorder]}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>🔔</Text>
          </View>
          <Text style={styles.cardNumber}>{notifications.length}</Text>
          <Text style={styles.cardLabel}>New Requests</Text>
        </View>

        <View style={[styles.dashCard, styles.pendingCardBorder]}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>📋</Text>
          </View>
          <Text style={styles.cardNumber}>{pendingOrdersCount}</Text>
          <Text style={styles.cardLabel}>Active Orders</Text>
        </View>
<PharmacyLocation />
        <View style={[styles.dashCard, styles.stockCardBorder]}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>⚠️</Text>
          </View>
          <Text style={styles.cardNumber}>{dashboardMetrics.lowStockItems}</Text>
          <Text style={styles.cardLabel}>Low Stock</Text>
        </View>

        <View style={[styles.dashCard, styles.inventoryCardBorder]}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>💊</Text>
          </View>
          <Text style={styles.cardNumber}>{dashboardMetrics.totalInventory}</Text>
          <Text style={styles.cardLabel}>Total Items</Text>
        </View>

        <View style={[styles.dashCard, styles.revenueCardBorder]}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>💰</Text>
          </View>
          <Text style={styles.cardNumber}>₹{todayRevenue}</Text>
          <Text style={styles.cardLabel}>Today's Revenue</Text>
        </View>

        <View style={[styles.dashCard, styles.valueCardBorder]}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>📦</Text>
          </View>
          <Text style={styles.cardNumber}>₹{dashboardMetrics.inventoryValue}</Text>
          <Text style={styles.cardLabel}>Inventory Value</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionCard} onPress={navigateToFullInventory}>
            <Text style={styles.quickActionIcon}>📊</Text>
            <Text style={styles.quickActionText}>Full Inventory</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard} onPress={() => setActiveSection("notifications")}>
            <Text style={styles.quickActionIcon}>🔔</Text>
            <Text style={styles.quickActionText}>New Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard} onPress={() => setActiveSection("orders")}>
            <Text style={styles.quickActionIcon}>📋</Text>
            <Text style={styles.quickActionText}>Manage Orders</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Low Stock Alert */}
      {dashboardMetrics.lowStockItems > 0 && (
        <View style={styles.alertSection}>
          <View style={styles.alertCard}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Low Stock Alert</Text>
    
              <Text style={styles.alertText}>{dashboardMetrics.lowStockItems} items are running low on stock</Text>
              <TouchableOpacity style={styles.alertButton} onPress={() => setActiveSection("inventory")}>
                <Text style={styles.alertButtonText}>View Items</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderNotifications = () => (
    <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionHeader}>Order Notifications</Text>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🔔</Text>
          <Text style={styles.emptyStateTitle}>No New Requests</Text>
          <Text style={styles.emptyStateText}>New order requests from patients will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(n) => n.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.notificationCard}>
              <View style={styles.notificationHeader}>
                <View style={styles.patientInfo}>
                  <Text style={styles.notificationPatientName}>{item.patientName}</Text>
                  <Text style={styles.notificationPhone}>{item.patientPhone}</Text>
                  <Text style={styles.notificationTime}>{getTimeAgo(item.timestamp)}</Text>
                </View>
                <View style={styles.urgentBadge}>
                  <Text style={styles.urgentText}>NEW</Text>
                </View>
              </View>

              <View style={styles.notificationDetails}>
                <Text style={styles.notificationDelivery}>
                  {item.pickup === "delivery" ? "🚚 Home Delivery" : "🏪 Self Pickup"}
                </Text>

                {item.address && <Text style={styles.notificationAddress}>📍 {item.address}</Text>}

                <Text style={styles.notificationItemsTitle}>Requested Items:</Text>
                {item.items.map((orderItem, index) => {
                  const inventoryItem = items.find((invItem) =>
                    invItem.name.toLowerCase().includes(orderItem.name.toLowerCase())
                  );
                  const hasStock = inventoryItem && inventoryItem.qty >= orderItem.qty;

                  return (
                    <Text key={index} style={[styles.notificationItem, !hasStock && styles.notificationItemOutOfStock]}>
                      • {orderItem.name} × {orderItem.quantity}
                      {/* {!hasStock && " ⚠️ (Insufficient stock)"} */}
                    </Text>
                  );
                })}
              </View>

              <View style={styles.notificationActions}>
                <TouchableOpacity style={[styles.notificationBtn, styles.rejectBtn]} onPress={() => rejectOrder(item.id)}>
                  <Text style={styles.rejectBtnText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.notificationBtn, styles.acceptBtn]} onPress={() => acceptOrder(item.id)}>
                  <Text style={styles.acceptBtnText}>Accept Order</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </ScrollView>
  );

  const renderInventory = () => (
    <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
      <View style={styles.inventoryHeader}>
        <Text style={styles.sectionHeader}>Inventory Management</Text>
        <TouchableOpacity style={styles.fullInventoryBtn} onPress={navigateToFullInventory}>
          <Text style={styles.fullInventoryBtnText}>View Full Inventory</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search medicines..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#8E8E93"
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      <View style={styles.addItemCard}>
        <Text style={styles.cardTitle}>Add New Medicine</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.nameInput]}
            placeholder="Medicine name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#8E8E93"
          />
          <TextInput
            style={[styles.input, styles.qtyInput]}
            placeholder="Qty"
            value={qty}
            onChangeText={setQty}
            keyboardType="numeric"
            placeholderTextColor="#8E8E93"
          />
        </View>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.nameInput]}
            placeholder="Category"
            value={category}
            onChangeText={setCategory}
            placeholderTextColor="#8E8E93"
          />
          <TextInput
            style={[styles.input, styles.qtyInput]}
            placeholder="Price (₹)"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholderTextColor="#8E8E93"
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={addItem}>
          <Text style={styles.addBtnText}>+ Add Medicine</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredItems.slice(0, 8)} // Show only first 8 items
        keyExtractor={(i) => i.id}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const stockStatus = getStockStatus(item.qty);
          return (
            <View style={styles.inventoryItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <View style={styles.itemDetails}>
                  <View style={[styles.stockBadge, { backgroundColor: stockStatus.color }]}>
                    <Text style={styles.stockBadgeText}>{stockStatus.status}</Text>
                  </View>
                  <Text style={[styles.itemQty, item.qty < 20 && styles.lowStock]}>Stock: {item.qty}</Text>
                  {item.price && <Text style={styles.itemPrice}>₹{item.price}</Text>}
                </View>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => updateQty(item.id, 1)}>
                  <Text style={styles.actionBtnText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => updateQty(item.id, -1)}>
                  <Text style={styles.actionBtnText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => deleteItem(item.id)}>
                  <Text style={styles.deleteBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {filteredItems.length > 8 && (
        <TouchableOpacity style={styles.viewMoreBtn} onPress={navigateToFullInventory}>
          <Text style={styles.viewMoreText}>View All {filteredItems.length} Items</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  const renderOrders = () => (
    <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionHeader}>Active Orders</Text>

      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.patientName}>{item.patientName}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.deliveryType}>{item.pickup === "delivery" ? "🚚 Delivery" : "🏪 Self Pickup"}</Text>
            <Text style={styles.orderItems}>Items: {item.items.map((it) => `${it.name} x ${it.quantity}`).join(", ")}</Text>
            {item.status !== "completed" && (
              <View style={styles.orderActions}>
                {item.status === "confirmed" && (
                  <TouchableOpacity style={[styles.orderActionBtn, styles.readyBtn]} onPress={() => changeStatus(item.id, "ready")}>
                    <Text style={styles.orderActionText}>Mark Ready</Text>
                  </TouchableOpacity>
                )}
                {item.status === "ready" && (
                  <TouchableOpacity style={[styles.orderActionBtn, styles.completeBtn]} onPress={() => changeStatus(item.id, "completed")}>
                    <Text style={styles.orderActionText}>Complete Order</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
      />
    </ScrollView>
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
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ===== Header ===== */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.shopName}>{profile.shopName}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, { color: isOnline ? "#34C759" : "#FF3B30" }]}>{isOnline ? "Online" : "Offline"}</Text>
            <Switch value={isOnline} onValueChange={setIsOnline} trackColor={{ false: "#FF3B30", true: "#34C759" }} thumbColor="#FFFFFF" />
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => setShowProfile(true)}>
            <Text style={styles.profileInitials}>{profile.ownerName.split(" ").map((n) => n[0]).join("").toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* ===== Left Sidebar ===== */}
        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>Navigation</Text>
          {navItems.map((item) => (
            <TouchableOpacity key={item.id} style={[styles.navItem, activeSection === item.id && styles.activeNavItem]} onPress={() => setActiveSection(item.id as ActiveSection)}>
              <View style={styles.navItemContent}>
                <Text style={styles.navIcon}>{item.icon}</Text>
                <View style={styles.navTextContainer}>
                  <Text style={[styles.navLabel, activeSection === item.id && styles.activeNavLabel]}>{item.label}</Text>
                  {item.count !== null && item.count > 0 && (
                    <Text style={[styles.navCount, item.id === "notifications" && item.count > 0 && styles.notificationCount]}>{item.count}</Text>
                  )}
                </View>
              </View>
              {activeSection === item.id && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* ===== Main Content Area ===== */}
        {renderContent()}
      </View>

      {/* ===== Profile Modal ===== */}
      <Modal visible={showProfile} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowProfile(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Pharmacy Profile</Text>
            <TouchableOpacity onPress={() => (editingProfile ? saveProfile() : setEditingProfile(true))}>
              <Text style={styles.modalSave}>{editingProfile ? "Save" : "Edit"}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.profileSection}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>{profile.ownerName.split(" ").map((n) => n[0]).join("").toUpperCase()}</Text>
              </View>

              <View style={styles.profileForm}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Owner Name</Text>
                  <TextInput
                    style={[styles.formInput, !editingProfile && styles.formInputDisabled]}
                    value={editingProfile ? tempProfile.ownerName : profile.ownerName}
                    onChangeText={(text) => editingProfile && setTempProfile({ ...tempProfile, ownerName: text })}
                    editable={editingProfile}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Shop Name</Text>
                  <TextInput
                    style={[styles.formInput, !editingProfile && styles.formInputDisabled]}
                    value={editingProfile ? tempProfile.shopName : profile.shopName}
                    onChangeText={(text) => editingProfile && setTempProfile({ ...tempProfile, shopName: text })}
                    editable={editingProfile}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Phone Number</Text>
                  <TextInput
                    style={[styles.formInput, !editingProfile && styles.formInputDisabled]}
                    value={editingProfile ? tempProfile.phone : profile.phone}
                    onChangeText={(text) => editingProfile && setTempProfile({ ...tempProfile, phone: text })}
                    editable={editingProfile}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Email</Text>
                  <TextInput
                    style={[styles.formInput, !editingProfile && styles.formInputDisabled]}
                    value={editingProfile ? tempProfile.email : profile.email}
                    onChangeText={(text) => editingProfile && setTempProfile({ ...tempProfile, email: text })}
                    editable={editingProfile}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Address</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea, !editingProfile && styles.formInputDisabled]}
                    value={editingProfile ? tempProfile.address : profile.address}
                    onChangeText={(text) => editingProfile && setTempProfile({ ...tempProfile, address: text })}
                    multiline
                    numberOfLines={3}
                    editable={editingProfile}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>License Number</Text>
                  <TextInput
                    style={[styles.formInput, !editingProfile && styles.formInputDisabled]}
                    value={editingProfile ? tempProfile.license : profile.license}
                    onChangeText={(text) => editingProfile && setTempProfile({ ...tempProfile, license: text })}
                    editable={editingProfile}
                  />
                </View>
              </View>
            </View>

            {editingProfile && (
              <TouchableOpacity style={styles.cancelEditBtn} onPress={cancelEdit}>
                <Text style={styles.cancelEditText}>Cancel Changes</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: "#8E8E93",
    marginBottom: 2,
  },
  shopName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  profileInitials: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  mainContent: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 240,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "#E5E5EA",
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  navItem: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  activeNavItem: {
    backgroundColor: "#F0F7FF",
  },
  navItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  navIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  navTextContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  activeNavLabel: {
    color: "#007AFF",
  },
  navCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    textAlign: "center",
  },
  notificationCount: {
    backgroundColor: "#FF3B30",
    color: "#FFFFFF",
  },
  activeIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: "#007AFF",
  },
  contentArea: {
    flex: 1,
    padding: 24,
  },
  sectionHeader: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1C1C1E",
    marginBottom: 24,
  },
  dashboardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 32,
  },
  dashCard: {
    width: "31%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationCardBorder: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF9500",
  },
  pendingCardBorder: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF9500",
  },
  stockCardBorder: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF3B30",
  },
  inventoryCardBorder: {
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  revenueCardBorder: {
    borderLeftWidth: 4,
    borderLeftColor: "#34C759",
  },
  valueCardBorder: {
    borderLeftWidth: 4,
    borderLeftColor: "#8E44AD",
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardIconText: {
    fontSize: 24,
  },
  cardNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
  },
  // Quick Actions Section
  quickActionsSection: {
    marginBottom: 32,
  },
  quickActionsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1C1E",
    textAlign: "center",
  },
  // Alert Section
  alertSection: {
    marginBottom: 24,
  },
  alertCard: {
    backgroundColor: "#FFF3CD",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#FF9500",
  },
  alertIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 8,
  },
  alertButton: {
    backgroundColor: "#FF9500",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  alertButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  // ===== Notifications Styles =====
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
  },
  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9500",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  patientInfo: {
    flex: 1,
  },
  notificationPatientName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  notificationPhone: {
    fontSize: 14,
    color: "#007AFF",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#8E8E93",
  },
  urgentBadge: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  urgentText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  notificationDetails: {
    marginBottom: 16,
  },
  notificationDelivery: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 8,
  },
  notificationAddress: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 12,
    lineHeight: 18,
  },
  notificationItemsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  notificationItem: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 2,
    paddingLeft: 8,
  },
  notificationItemOutOfStock: {
    color: "#FF3B30",
    fontWeight: "600",
  },
  notificationActions: {
    flexDirection: "row",
    gap: 12,
  },
  notificationBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  acceptBtn: {
    backgroundColor: "#34C759",
  },
  rejectBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  acceptBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  rejectBtnText: {
    color: "#FF3B30",
    fontSize: 14,
    fontWeight: "600",
  },
  // ===== Inventory Styles =====
  inventoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  fullInventoryBtn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  fullInventoryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1C1C1E",
  },
  searchIcon: {
    fontSize: 18,
    color: "#8E8E93",
  },
  addItemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },
  nameInput: {
    flex: 2,
  },
  qtyInput: {
    flex: 1,
  },
  addBtn: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  addBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  inventoryItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  itemQty: {
    fontSize: 14,
    color: "#8E8E93",
  },
  lowStock: {
    color: "#FF3B30",
    fontWeight: "600",
  },
  itemPrice: {
    fontSize: 14,
    color: "#34C759",
    fontWeight: "600",
  },
  itemActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtnText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
  },
  deleteBtn: {
    backgroundColor: "#FF3B30",
  },
  deleteBtnText: {
    fontSize: 16,
  },
  viewMoreBtn: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  viewMoreText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  // ===== Orders Styles =====
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  patientName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
 
  deliveryType: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 16,
  },
  orderActions: {
    flexDirection: "row",
    gap: 12,
  },
  orderActionBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  readyBtn: {
    backgroundColor: "#007AFF",
  },
  completeBtn: {
    backgroundColor: "#34C759",
  },
  orderActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  // ===== Modal Styles =====
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  modalCancel: {
    fontSize: 16,
    color: "#8E8E93",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  modalSave: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  profileAvatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
  },
  profileForm: {
    width: "100%",
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  formInputDisabled: {
    backgroundColor: "#F2F2F7",
    color: "#8E8E93",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  cancelEditBtn: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    marginBottom: 16,
  },
  cancelEditText: {
    fontSize: 16,
    color: "#8E8E93",
    fontWeight: "600",
  },
  logoutBtn: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    marginBottom: 40,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

function setTotalInventory(arg0: (prev: any) => any) {
  throw new Error("Function not implemented.");
}
