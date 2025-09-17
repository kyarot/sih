// app/pharmacy/inventory.tsx
import axios from "axios";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type Item = { 
  id: string; 
  name: string; 
  qty: number; 
  price?: number;
  category?: string;
  expiryDate?: string;
  brand?: string;
};

type SortOption = "name-asc" | "name-desc" | "stock-high" | "stock-low" | "price-asc" | "price-desc";

const API_BASE = "http://localhost:5000/api/drugs"; // <-- change to your machine IP if testing on a physical device

export default function InventoryPage() {
  const router = useRouter();

  // start empty; we will fetch from API on mount
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("name-asc");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<{ [key: string]: string }>({});
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    quantity: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [drugToDelete, setDrugToDelete] = useState<string | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    fetchDrugs();
    return () => {
      isMounted.current = false;
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  // Fetch all drugs
  const fetchDrugs = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(`${API_BASE}/raw`);
      const data = res.data.data || res.data;
      // map server objects to Item shape (server may use _id)
      const mapped: Item[] = (Array.isArray(data) ? data : []).map((d: any) => ({
        id: d._id ?? d.id ?? `${d.name}-${d.brand}`,
        name: d.name ?? d.title ?? "Unnamed",
        qty: typeof d.quantity === "number" ? d.quantity : Number(d.quantity) || 0,
        price: d.price,
        category: d.category,
        expiryDate: d.expiryDate,
        brand: d.brand,
      }));
      if (isMounted.current) {
        setItems(mapped);
        setAllItems(mapped);
      }
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || e.message || "Failed to fetch drugs");
    } finally {
      if (isMounted.current) setRefreshing(false);
    }
  };

  // Store all items for filtering
  const [allItems, setAllItems] = useState<Item[]>([]);

  // Sorting and filtering logic (client-side sorting)
  const filteredAndSortedItems = useMemo(() => {
    let filtered = allItems.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(searchLower) ||
        (item.brand && item.brand.toLowerCase().includes(searchLower)) ||
        (item.category && item.category.toLowerCase().includes(searchLower))
      );
    });

    switch (sortOption) {
      case "name-asc":
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return filtered.sort((a, b) => b.name.localeCompare(a.name));
      case "stock-high":
        return filtered.sort((a, b) => b.qty - a.qty);
      case "stock-low":
        return filtered.sort((a, b) => a.qty - b.qty);
      case "price-asc":
        return filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price-desc":
        return filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
      default:
        return filtered;
    }
  }, [allItems, searchQuery, sortOption]);

  // Update stock via API (explicit "Update" button)
  const updateStock = async (id: string, newQty: string) => {
    const quantity = parseInt(newQty, 10);
    if (isNaN(quantity) || quantity < 0) {
      Alert.alert("Invalid Quantity", "Please enter a valid positive number");
      return;
    }

    try {
      // optimistic UI update
      setItems(prev => prev.map(item => item.id === id ? { ...item, qty: quantity } : item));
      setAllItems(prev => prev.map(item => item.id === id ? { ...item, qty: quantity } : item));
      const res = await axios.put(`${API_BASE}/${id}`, { quantity });
      const updated = res.data.data || res.data;
      // map server returned item (if present)
      const mapped = {
        id: updated._id ?? updated.id ?? id,
        name: updated.name ?? undefined,
        qty: typeof updated.quantity === "number" ? updated.quantity : quantity,
        price: updated.price,
        category: updated.category,
        expiryDate: updated.expiryDate,
        brand: updated.brand,
      };
      setItems(prev => prev.map(item => item.id === id ? { ...item, ...mapped } : item));
      setAllItems(prev => prev.map(item => item.id === id ? { ...item, ...mapped } : item));
      setEditingStock(prev => ({ ...prev, [id]: "" }));
      setExpandedItem(null);
      Alert.alert("Success", "Stock updated successfully!");
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || e.message || "Failed to update stock");
      await fetchDrugs(); // fallback: re-sync
    }
  };

  // Quick adjust (optimistic) and sync to server
  const quickAdjustStock = async (id: string, delta: number) => {
    // save previous state for rollback
    const prevItems = items;
    const target = items.find(i => i.id === id);
    if (!target) return;
    const newQty = Math.max(0, target.qty + delta);

    // optimistic update
    setItems(prev => prev.map(item => item.id === id ? { ...item, qty: newQty } : item));
    setAllItems(prev => prev.map(item => item.id === id ? { ...item, qty: newQty } : item));

    try {
      const res = await axios.put(`${API_BASE}/${id}`, { quantity: newQty });
      const updated = res.data.data || res.data;
      const mapped = {
        id: updated._id ?? updated.id ?? id,
        name: updated.name ?? target.name,
        qty: typeof updated.quantity === "number" ? updated.quantity : newQty,
        price: updated.price ?? target.price,
        category: updated.category ?? target.category,
        expiryDate: updated.expiryDate ?? target.expiryDate,
        brand: updated.brand ?? target.brand,
      };
      setItems(prev => prev.map(item => item.id === id ? { ...item, ...mapped } : item));
      setAllItems(prev => prev.map(item => item.id === id ? { ...item, ...mapped } : item));
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || e.message || "Failed to update stock");
      // rollback
      setItems(prevItems);
      setAllItems(prevItems);
      // optionally re-fetch to ensure consistency
      fetchDrugs();
    }
  };

  // Delete a drug
  const confirmDelete = (id: string) => {
    console.log("confirmDelete called with id:", id); // Debug log
    
    // Use custom modal instead of Alert
    setDrugToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (drugToDelete) {
      console.log("Delete confirmed for:", drugToDelete);
      deleteDrug(drugToDelete);
    }
    setShowDeleteModal(false);
    setDrugToDelete(null);
  };

  const handleDeleteCancel = () => {
    console.log("Delete cancelled");
    setShowDeleteModal(false);
    setDrugToDelete(null);
  };

  const deleteDrug = async (id: string) => {
    try {
      const item = items.find(i => i.id === id);
      if (!item) {
        Alert.alert("Error", "Drug not found");
        return;
      }

      // Check if it's a real MongoDB ObjectId (24 hex characters)
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        // This is a real MongoDB ID, delete directly
        await axios.delete(`${API_BASE}/${id}`);
      } else {
        // This is a composite ID, delete by name and brand
        const encodedName = encodeURIComponent(item.name);
        const encodedBrand = item.brand ? encodeURIComponent(item.brand) : 'undefined';
        await axios.delete(`${API_BASE}/by-name/${encodedName}/${encodedBrand}`);
      }
      
      // remove locally
      setItems(prev => prev.filter(item => item.id !== id));
      setAllItems(prev => prev.filter(item => item.id !== id));
      setExpandedItem(null);
      Alert.alert("Deleted", "Drug deleted successfully");
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || e.message || "Failed to delete drug");
    }
  };

  // Add new medicine
  const addMedicine = async () => {
    if (!newMedicine.name || !newMedicine.price || !newMedicine.quantity) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/`, {
        name: newMedicine.name,
        brand: newMedicine.brand,
        category: newMedicine.category,
        price: parseFloat(newMedicine.price),
        quantity: parseInt(newMedicine.quantity),
      });
      
      const newDrug = res.data.data || res.data;
      const mapped: Item = {
        id: newDrug._id ?? newDrug.id,
        name: newDrug.name,
        qty: newDrug.quantity,
        price: newDrug.price,
        category: newDrug.category,
        brand: newDrug.brand,
        expiryDate: newDrug.expiryDate,
      };
      
      setItems(prev => [mapped, ...prev]);
      setAllItems(prev => [mapped, ...prev]);
      setNewMedicine({ name: "", brand: "", category: "", price: "", quantity: "" });
      setShowAddForm(false);
      Alert.alert("Success", "Medicine added successfully!");
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || e.message || "Failed to add medicine");
    }
  };

  const renderSortButtons = () => (
    <View style={styles.sortContainer}>
      <Text style={styles.sortLabel}>Sort by:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScrollView}>
        <TouchableOpacity 
          style={[styles.sortBtn, sortOption === "name-asc" && styles.activeSortBtn]}
          onPress={() => setSortOption("name-asc")}
        >
          <Text style={[styles.sortBtnText, sortOption === "name-asc" && styles.activeSortText]}>A-Z</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sortBtn, sortOption === "name-desc" && styles.activeSortBtn]}
          onPress={() => setSortOption("name-desc")}
        >
          <Text style={[styles.sortBtnText, sortOption === "name-desc" && styles.activeSortText]}>Z-A</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sortBtn, sortOption === "stock-high" && styles.activeSortBtn]}
          onPress={() => setSortOption("stock-high")}
        >
          <Text style={[styles.sortBtnText, sortOption === "stock-high" && styles.activeSortText]}>High Stock</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sortBtn, sortOption === "stock-low" && styles.activeSortBtn]}
          onPress={() => setSortOption("stock-low")}
        >
          <Text style={[styles.sortBtnText, sortOption === "stock-low" && styles.activeSortText]}>Low Stock</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sortBtn, sortOption === "price-asc" && styles.activeSortBtn]}
          onPress={() => setSortOption("price-asc")}
        >
          <Text style={[styles.sortBtnText, sortOption === "price-asc" && styles.activeSortText]}>Price ↑</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sortBtn, sortOption === "price-desc" && styles.activeSortBtn]}
          onPress={() => setSortOption("price-desc")}
        >
          <Text style={[styles.sortBtnText, sortOption === "price-desc" && styles.activeSortText]}>Price ↓</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const getStockStatus = (qty: number) => {
    if (qty <= 10) return { color: "#FF3B30", status: "Critical" };
    if (qty <= 20) return { color: "#FF9500", status: "Low" };
    if (qty <= 50) return { color: "#007AFF", status: "Medium" };
    return { color: "#34C759", status: "Good" };
  };

  const renderInventoryCard = ({ item }: { item: Item }) => {
    const stockStatus = getStockStatus(item.qty);
    const isExpanded = expandedItem === item.id;
    const currentEditValue = editingStock[item.id] ?? item.qty.toString();

    return (
      <View style={styles.inventoryCard}>
        <TouchableOpacity 
          style={styles.cardHeader}
          onPress={() => setExpandedItem(isExpanded ? null : item.id)}
        >
          <View style={styles.medicineInfo}>
            <Text style={styles.medicineName}>{item.name}</Text>
            {item.brand && (
              <Text style={styles.medicineBrand}>{item.brand}</Text>
            )}
            {item.category && (
              <Text style={styles.medicineCategory}>{item.category}</Text>
            )}
            <View style={styles.stockRow}>
              <View style={[styles.stockBadge, { backgroundColor: stockStatus.color }]}>
                <Text style={styles.stockBadgeText}>{stockStatus.status}</Text>
              </View>
              <Text style={styles.stockText}>Stock: {item.qty}</Text>
              {item.price && (
                <Text style={styles.priceText}>₹{item.price}</Text>
              )}
            </View>
          </View>
          
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickBtn}
              onPress={() => quickAdjustStock(item.id, -1)}
            >
              <Text style={styles.quickBtnText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickBtn}
              onPress={() => quickAdjustStock(item.id, 1)}
            >
              <Text style={styles.quickBtnText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.expandBtn}
              onPress={() => setExpandedItem(isExpanded ? null : item.id)}
            >
              <Text style={styles.expandBtnText}>{isExpanded ? "▲" : "▼"}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.expandedTitle}>Update Stock</Text>
            <View style={styles.stockUpdateRow}>
              <TextInput
                style={styles.stockInput}
                value={currentEditValue}
                onChangeText={(text) => setEditingStock(prev => ({ ...prev, [item.id]: text }))}
                keyboardType="numeric"
                placeholder="Enter new stock quantity"
              />
              <TouchableOpacity 
                style={styles.updateBtn}
                onPress={() => updateStock(item.id, currentEditValue)}
              >
                <Text style={styles.updateBtnText}>Update</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.presetActions}>
              <Text style={styles.presetLabel}>Quick Adjust:</Text>
              <View style={styles.presetBtns}>
                <TouchableOpacity 
                  style={styles.presetBtn}
                  onPress={() => quickAdjustStock(item.id, -10)}
                >
                  <Text style={styles.presetBtnText}>-10</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.presetBtn}
                  onPress={() => quickAdjustStock(item.id, -5)}
                >
                  <Text style={styles.presetBtnText}>-5</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.presetBtn}
                  onPress={() => quickAdjustStock(item.id, 5)}
                >
                  <Text style={styles.presetBtnText}>+5</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.presetBtn}
                  onPress={() => quickAdjustStock(item.id, 10)}
                >
                  <Text style={styles.presetBtnText}>+10</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Delete button (uses same style patterns) */}
            <View style={{ marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.presetBtn, { backgroundColor: "#FF3B30", alignSelf: "flex-start" }]}
                onPress={() => {
                  console.log("Delete button pressed for item:", item.id, item.name);
                  confirmDelete(item.id);
                }}
              >
                <Text style={[styles.presetBtnText, { color: "#FFFFFF" }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Inventory Management",
          headerShown: true,
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerTitleStyle: { fontSize: 20, fontWeight: "700", color: "#1C1C1E" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backBtn}>← Back</Text>
            </TouchableOpacity>
          )
        }} 
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search medicines or categories..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#8E8E93"
        />
        <TouchableOpacity style={styles.searchIcon}>
          <Text style={styles.searchIconText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Sort Options */}
      {renderSortButtons()}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredAndSortedItems.length} medicines found
        </Text>
      </View>

      {/* Inventory Grid - 2 items per row */}
      <View style={styles.medicineListContainer}>
        <FlatList
          data={filteredAndSortedItems}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={renderInventoryCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No medicines found</Text>
              <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={fetchDrugs}
        />
      </View>

      {/* Add Medicine Form */}
      <View style={styles.addMedicineContainer}>
        <TouchableOpacity 
          style={styles.addMedicineBtn}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Text style={styles.addMedicineBtnText}>
            {showAddForm ? "▼ Hide Add Medicine" : "▲ Add New Medicine"}
          </Text>
        </TouchableOpacity>

        {showAddForm && (
          <View style={styles.addMedicineForm}>
            <Text style={styles.formTitle}>Add New Medicine</Text>
            
            <TextInput
              style={styles.formInput}
              placeholder="Medicine Name *"
              value={newMedicine.name}
              onChangeText={(text) => setNewMedicine(prev => ({ ...prev, name: text }))}
            />
            
            <TextInput
              style={styles.formInput}
              placeholder="Brand"
              value={newMedicine.brand}
              onChangeText={(text) => setNewMedicine(prev => ({ ...prev, brand: text }))}
            />
            
            <TextInput
              style={styles.formInput}
              placeholder="Category"
              value={newMedicine.category}
              onChangeText={(text) => setNewMedicine(prev => ({ ...prev, category: text }))}
            />
            
            <View style={styles.formRow}>
              <TextInput
                style={[styles.formInput, styles.formInputHalf]}
                placeholder="Price *"
                value={newMedicine.price}
                onChangeText={(text) => setNewMedicine(prev => ({ ...prev, price: text }))}
                keyboardType="numeric"
              />
              
              <TextInput
                style={[styles.formInput, styles.formInputHalf]}
                placeholder="Quantity *"
                value={newMedicine.quantity}
                onChangeText={(text) => setNewMedicine(prev => ({ ...prev, quantity: text }))}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.formButtons}>
              <TouchableOpacity 
                style={styles.cancelBtn}
                onPress={() => {
                  setShowAddForm(false);
                  setNewMedicine({ name: "", brand: "", category: "", price: "", quantity: "" });
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.submitBtn}
                onPress={addMedicine}
              >
                <Text style={styles.submitBtnText}>Add Medicine</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Custom Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleDeleteCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Drug</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete this drug? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleDeleteCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteConfirm}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  backBtn: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1C1C1E",
  },
  searchIcon: {
    padding: 4,
  },
  searchIconText: {
    fontSize: 18,
  },
  sortContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 8,
  },
  sortScrollView: {
    flexGrow: 0,
  },
  sortBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  activeSortBtn: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  sortBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
  },
  activeSortText: {
    color: "#FFFFFF",
  },
  resultsHeader: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "500",
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
    marginHorizontal: 8,
  },
  inventoryCard: {
    flex: 0.48,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  cardHeader: {
    padding: 16,
  },
  medicineInfo: {
    marginBottom: 12,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 4,
    lineHeight: 20,
  },
  medicineBrand: {
    fontSize: 12,
    color: "#007AFF",
    marginBottom: 4,
    fontWeight: "600",
  },
  medicineCategory: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 8,
  },
  stockRow: {
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
  stockText: {
    fontSize: 12,
    color: "#1C1C1E",
    fontWeight: "600",
  },
  priceText: {
    fontSize: 12,
    color: "#34C759",
    fontWeight: "600",
  },
  quickActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quickBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  quickBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  expandBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  expandBtnText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
    padding: 16,
    backgroundColor: "#FAFAFA",
  },
  expandedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 12,
  },
  stockUpdateRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  stockInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#FFFFFF",
  },
  updateBtn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
  },
  updateBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  presetActions: {
    marginTop: 8,
  },
  presetLabel: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 8,
  },
  presetBtns: {
    flexDirection: "row",
    gap: 8,
  },
  presetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#E5E5EA",
    borderRadius: 6,
  },
  presetBtnText: {
    fontSize: 12,
    color: "#1C1C1E",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
  medicineListContainer: {
    flex: 1,
    maxHeight: 400,
  },
  addMedicineContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  addMedicineBtn: {
    padding: 16,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    alignItems: "center",
  },
  addMedicineBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  addMedicineForm: {
    padding: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 16,
    textAlign: "center",
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },
  formRow: {
    flexDirection: "row",
    gap: 8,
  },
  formInputHalf: {
    flex: 1,
    marginBottom: 12,
  },
  formButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#8E8E93",
    fontSize: 16,
    fontWeight: "600",
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#34C759",
    alignItems: "center",
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    margin: 20,
    minWidth: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#8E8E93",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F2F2F7",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
  cancelButtonText: {
    color: "#8E8E93",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
