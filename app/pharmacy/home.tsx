// app/pharmacy/home.tsx
import React, { useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, Switch } from "react-native";
import { useRouter, Stack } from "expo-router";

type Item = { id: string; name: string; qty: number; price?: number };
type Order = { id: string; patientName: string; items: { name: string; qty: number }[]; pickup: "delivery" | "self"; status: "pending" | "ready" | "completed" };
type Profile = { ownerName: string; shopName: string; phone: string; address: string; license: string; email: string };

export default function PharmacyHome() {
  const router = useRouter();

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
    email: "rajesh@medicare.com"
  });
  const [tempProfile, setTempProfile] = useState<Profile>(profile);

  // ===== Dashboard State =====
  const [pendingOrders, setPendingOrders] = useState(4);
  const [lowStockItems, setLowStockItems] = useState(3);
  const [totalInventory, setTotalInventory] = useState(120);
  const [todayRevenue, setTodayRevenue] = useState(15420);

  // ===== Inventory State =====
  const [items, setItems] = useState<Item[]>([
    { id: "i1", name: "Paracetamol 500mg", qty: 120, price: 30 },
    { id: "i2", name: "Amoxicillin 250mg", qty: 40, price: 120 },
    { id: "i3", name: "Crocin Advance", qty: 8, price: 25 },
    { id: "i4", name: "Azithromycin 500mg", qty: 65, price: 180 },
  ]);
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");

  const addItem = () => {
    if (!name || !qty) return alert("Enter medicine name and quantity");
    const newItem: Item = { id: Date.now().toString(), name, qty: parseInt(qty, 10), price: price ? parseFloat(price) : undefined };
    setItems((s) => [newItem, ...s]);
    setName(""); setQty(""); setPrice("");
  };

  const deleteItem = (id: string) => setItems((s) => s.filter(i => i.id !== id));
  const updateQty = (id: string, delta: number) => setItems(s => s.map(it => it.id === id ? { ...it, qty: Math.max(0, it.qty + delta) } : it));

  // ===== Orders State =====
  const [orders, setOrders] = useState<Order[]>([
    { id: "o1", patientName: "Ajay Kumar", items: [{ name: "Paracetamol", qty: 10 }], pickup: "delivery", status: "pending" },
    { id: "o2", patientName: "Sita Sharma", items: [{ name: "Amoxicillin", qty: 14 }], pickup: "self", status: "pending" },
    { id: "o3", patientName: "Rahul Gupta", items: [{ name: "Crocin", qty: 5 }], pickup: "delivery", status: "ready" },
  ]);

  const changeStatus = (id: string, newStatus: Order["status"]) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));

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
      case "pending": return "#FF9500";
      case "ready": return "#007AFF";
      case "completed": return "#34C759";
      default: return "#8E8E93";
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
            <Text style={[styles.statusText, { color: isOnline ? "#34C759" : "#FF3B30" }]}>
              {isOnline ? "Online" : "Offline"}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: "#FF3B30", true: "#34C759" }}
              thumbColor="#FFFFFF"
            />
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => setShowProfile(true)}>
            <Text style={styles.profileInitials}>
              {profile.ownerName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
        {/* ===== Dashboard Cards ===== */}
        <View style={styles.dashboardContainer}>
          <View style={styles.cardRow}>
            <View style={[styles.dashCard, styles.pendingCard]}>
              <View style={styles.cardIcon}>
                <Text style={styles.cardIconText}>📋</Text>
              </View>
              <Text style={styles.cardNumber}>{pendingOrders}</Text>
              <Text style={styles.cardLabel}>Pending Orders</Text>
            </View>
            <View style={[styles.dashCard, styles.stockCard]}>
              <View style={styles.cardIcon}>
                <Text style={styles.cardIconText}>⚠️</Text>
              </View>
              <Text style={styles.cardNumber}>{lowStockItems}</Text>
              <Text style={styles.cardLabel}>Low Stock</Text>
            </View>
          </View>
          
          <View style={styles.cardRow}>
            <View style={[styles.dashCard, styles.inventoryCard]}>
              <View style={styles.cardIcon}>
                <Text style={styles.cardIconText}>💊</Text>
              </View>
              <Text style={styles.cardNumber}>{totalInventory}</Text>
              <Text style={styles.cardLabel}>Total Items</Text>
            </View>
            <View style={[styles.dashCard, styles.revenueCard]}>
              <View style={styles.cardIcon}>
                <Text style={styles.cardIconText}>💰</Text>
              </View>
              <Text style={styles.cardNumber}>₹{todayRevenue}</Text>
              <Text style={styles.cardLabel}>Today's Revenue</Text>
            </View>
          </View>
        </View>

        {/* ===== Quick Actions ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={[styles.quickActionBtn, styles.primaryAction]}>
              <Text style={styles.quickActionIcon}>📦</Text>
              <Text style={styles.quickActionText}>New Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickActionBtn, styles.secondaryAction]}>
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionText}>Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickActionBtn, styles.secondaryAction]}>
              <Text style={styles.quickActionIcon}>🔔</Text>
              <Text style={styles.quickActionText}>Notifications</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ===== Inventory Management ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inventory Management</Text>
          
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
            <TextInput 
              style={styles.input} 
              placeholder="Price (₹)" 
              value={price} 
              onChangeText={setPrice} 
              keyboardType="numeric"
              placeholderTextColor="#8E8E93"
            />
            <TouchableOpacity style={styles.addBtn} onPress={addItem}>
              <Text style={styles.addBtnText}>+ Add Medicine</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={items}
            keyExtractor={i => i.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.inventoryItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.itemDetails}>
                    <Text style={[styles.itemQty, item.qty < 20 && styles.lowStock]}>
                      Stock: {item.qty}
                    </Text>
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
            )}
          />
        </View>

        {/* ===== Orders Management ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Orders</Text>
          <FlatList
            data={orders}
            keyExtractor={o => o.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.patientName}>{item.patientName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.deliveryType}>
                  {item.pickup === "delivery" ? "🚚 Delivery" : "🏪 Self Pickup"}
                </Text>
                <Text style={styles.orderItems}>
                  Items: {item.items.map(it => `${it.name} x${it.qty}`).join(", ")}
                </Text>
                {item.status !== "completed" && (
                  <View style={styles.orderActions}>
                    {item.status === "pending" && (
                      <TouchableOpacity 
                        style={[styles.orderActionBtn, styles.readyBtn]} 
                        onPress={() => changeStatus(item.id, "ready")}
                      >
                        <Text style={styles.orderActionText}>Mark Ready</Text>
                      </TouchableOpacity>
                    )}
                    {item.status === "ready" && (
                      <TouchableOpacity 
                        style={[styles.orderActionBtn, styles.completeBtn]} 
                        onPress={() => changeStatus(item.id, "completed")}
                      >
                        <Text style={styles.orderActionText}>Complete Order</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            )}
          />
        </View>
      </ScrollView>

      {/* ===== Profile Modal ===== */}
      <Modal visible={showProfile} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowProfile(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Pharmacy Profile</Text>
            <TouchableOpacity onPress={() => editingProfile ? saveProfile() : setEditingProfile(true)}>
              <Text style={styles.modalSave}>{editingProfile ? "Save" : "Edit"}</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.profileSection}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>
                  {profile.ownerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.profileForm}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Owner Name</Text>
                  <TextInput
                    style={[styles.formInput, !editingProfile && styles.formInputDisabled]}
                    value={editingProfile ? tempProfile.ownerName : profile.ownerName}
                    onChangeText={(text) => editingProfile && setTempProfile({...tempProfile, ownerName: text})}
                    editable={editingProfile}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Shop Name</Text>
                  <TextInput
                    style={[styles.formInput, !editingProfile && styles.formInputDisabled]}
                    value={editingProfile ? tempProfile.shopName : profile.shopName}
                    onChangeText={(text) => editingProfile && setTempProfile({...tempProfile, shopName: text})}
                    editable={editingProfile}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Phone Number</Text>
                  <TextInput
                    style={[styles.formInput, !editingProfile && styles.formInputDisabled]}
                    value={editingProfile ? tempProfile.phone : profile.phone}
                    onChangeText={(text) => editingProfile && setTempProfile({...tempProfile, phone: text})}
                    editable={editingProfile}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Email</Text>
                  <TextInput
                    style={[styles.formInput, !editingProfile && styles.formInputDisabled]}
                    value={editingProfile ? tempProfile.email : profile.email}
                    onChangeText={(text) => editingProfile && setTempProfile({...tempProfile, email: text})}
                    editable={editingProfile}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Address</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea, !editingProfile && styles.formInputDisabled]}
                    value={editingProfile ? tempProfile.address : profile.address}
                    onChangeText={(text) => editingProfile && setTempProfile({...tempProfile, address: text})}
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
                    onChangeText={(text) => editingProfile && setTempProfile({...tempProfile, license: text})}
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
    shadowRadius: 4,
    elevation: 3,
  },
  profileInitials: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  scrollContent: {
    flex: 1,
  },
  dashboardContainer: {
    padding: 20,
  },
  cardRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  dashCard: {
    flex: 1,
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
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF9500",
  },
  stockCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF3B30",
  },
  inventoryCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  revenueCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#34C759",
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  primaryAction: {
    backgroundColor: "#007AFF",
  },
  secondaryAction: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  quickActionIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
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
  itemDetails: {
    flexDirection: "row",
    gap: 16,
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