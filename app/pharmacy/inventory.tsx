// app/pharmacy/inventory.tsx
import axios from "axios";
import { Stack, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import React from "react";

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

const API_BASE = "https://7300c4c894de.ngrok-free.app/api/drugs";

export default function InventoryPage() {
  const router = useRouter();

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

  const fetchDrugs = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(`${API_BASE}/raw`);
      const data = res.data.data || res.data;
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

  const [allItems, setAllItems] = useState<Item[]>([]);

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

  const updateStock = async (id: string, newQty: string) => {
    const quantity = parseInt(newQty, 10);
    if (isNaN(quantity) || quantity < 0) {
      Alert.alert("Invalid Quantity", "Please enter a valid positive number");
      return;
    }

    try {
      setItems(prev => prev.map(item => item.id === id ? { ...item, qty: quantity } : item));
      setAllItems(prev => prev.map(item => item.id === id ? { ...item, qty: quantity } : item));
      const res = await axios.put(`${API_BASE}/${id}`, { quantity });
      const updated = res.data.data || res.data;
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
      await fetchDrugs();
    }
  };

  const quickAdjustStock = async (id: string, delta: number) => {
    const prevItems = items;
    const target = items.find(i => i.id === id);
    if (!target) return;
    const newQty = Math.max(0, target.qty + delta);

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
      setItems(prevItems);
      setAllItems(prevItems);
      fetchDrugs();
    }
  };

  const confirmDelete = (id: string) => {
    setDrugToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (drugToDelete) {
      deleteDrug(drugToDelete);
    }
    setShowDeleteModal(false);
    setDrugToDelete(null);
  };

  const handleDeleteCancel = () => {
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

      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        await axios.delete(`${API_BASE}/${id}`);
      } else {
        const encodedName = encodeURIComponent(item.name);
        const encodedBrand = item.brand ? encodeURIComponent(item.brand) : 'undefined';
        await axios.delete(`${API_BASE}/by-name/${encodedName}/${encodedBrand}`);
      }
      
      setItems(prev => prev.filter(item => item.id !== id));
      setAllItems(prev => prev.filter(item => item.id !== id));
      setExpandedItem(null);
      Alert.alert("Deleted", "Drug deleted successfully");
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || e.message || "Failed to delete drug");
    }
  };

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
      <Text style={styles.sortLabel}>Sort by</Text>
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
    if (qty <= 10) return { color: "#DC2626", status: "Critical", opacity: 1 };
    if (qty <= 20) return { color: "#EA580C", status: "Low", opacity: 1 };
    if (qty <= 50) return { color: "#1E40AF", status: "Medium", opacity: 1 };
    return { color: "#059669", status: "Good", opacity: 1 };
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
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.medicineInfo}>
              <Text style={styles.medicineName} numberOfLines={2}>{item.name}</Text>
              {item.brand && (
                <Text style={styles.medicineBrand} numberOfLines={1}>{item.brand}</Text>
              )}
              {item.category && (
                <Text style={styles.medicineCategory} numberOfLines={1}>{item.category}</Text>
              )}
              
              <View style={styles.infoRow}>
                <View style={[styles.stockBadge, { backgroundColor: stockStatus.color }]}>
                  <Text style={styles.stockBadgeText}>{stockStatus.status}</Text>
                </View>
                <Text style={styles.stockText}>Stock: {item.qty}</Text>
              </View>
              
              {item.price && (
                <Text style={styles.priceText}>₹{item.price.toFixed(2)}</Text>
              )}
            </View>
            
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickBtn}
                onPress={() => quickAdjustStock(item.id, -1)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickBtnText}>−</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickBtn}
                onPress={() => quickAdjustStock(item.id, 1)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickBtnText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.expandBtn}
                onPress={() => setExpandedItem(isExpanded ? null : item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.expandBtnText}>{isExpanded ? "▲" : "▼"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />
            
            <Text style={styles.expandedTitle}>Update Stock</Text>
            <View style={styles.stockUpdateRow}>
              <TextInput
              style={[styles.stockInput, styles.mr8]}
                value={currentEditValue}
                onChangeText={(text) => setEditingStock(prev => ({ ...prev, [item.id]: text }))}
                keyboardType="numeric"
                placeholder="Enter quantity"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity 
                style={styles.updateBtn}
                onPress={() => updateStock(item.id, currentEditValue)}
                activeOpacity={0.8}
              >
                <Text style={styles.updateBtnText}>Update</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.presetActions}>
              <Text style={styles.presetLabel}>Quick Adjust</Text>
              <View style={styles.presetBtns}>
                <TouchableOpacity 
                style={[styles.presetBtn, styles.mr8]}
                  onPress={() => quickAdjustStock(item.id, -10)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetBtnText}>-10</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                style={[styles.presetBtn, styles.mr8]}
                  onPress={() => quickAdjustStock(item.id, -5)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetBtnText}>-5</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                style={[styles.presetBtn, styles.mr8]}
                  onPress={() => quickAdjustStock(item.id, 5)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetBtnText}>+5</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.presetBtn}
                  onPress={() => quickAdjustStock(item.id, 10)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetBtnText}>+10</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => confirmDelete(item.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteBtnText}>Delete Item</Text>
            </TouchableOpacity>
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
          headerStyle: { backgroundColor: "#1E40AF" },
          headerTitleStyle: { fontSize: 18, fontWeight: "600", color: "#FFFFFF" },
          headerTintColor: "#FFFFFF",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backBtn}>← Back</Text>
            </TouchableOpacity>
          )
        }} 
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicines, brands, categories..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {renderSortButtons()}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredAndSortedItems.length} medicine{filteredAndSortedItems.length !== 1 ? 's' : ''} found
        </Text>
      </View>

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
              <Ionicons name="cube-outline" size={48} color="#9CA3AF" style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No medicines found</Text>
              <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={fetchDrugs}
        />
      </View>

      <View style={styles.addMedicineContainer}>
        <TouchableOpacity 
          style={styles.addMedicineBtn}
          onPress={() => setShowAddForm(!showAddForm)}
          activeOpacity={0.8}
        >
          <Text style={styles.addMedicineBtnText}>
            {showAddForm ? "Cancel" : "Add New Medicine"}
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
              placeholderTextColor="#9CA3AF"
            />
            
            <TextInput
              style={styles.formInput}
              placeholder="Brand"
              value={newMedicine.brand}
              onChangeText={(text) => setNewMedicine(prev => ({ ...prev, brand: text }))}
              placeholderTextColor="#9CA3AF"
            />
            
            <TextInput
              style={styles.formInput}
              placeholder="Category"
              value={newMedicine.category}
              onChangeText={(text) => setNewMedicine(prev => ({ ...prev, category: text }))}
              placeholderTextColor="#9CA3AF"
            />
            
            <View style={styles.formRow}>
              <TextInput
                style={[styles.formInput, styles.formInputHalf]}
                placeholder="Price *"
                value={newMedicine.price}
                onChangeText={(text) => setNewMedicine(prev => ({ ...prev, price: text }))}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
              
              <TextInput
                style={[styles.formInput, styles.formInputHalf]}
                placeholder="Quantity *"
                value={newMedicine.quantity}
                onChangeText={(text) => setNewMedicine(prev => ({ ...prev, quantity: text }))}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.submitBtn}
              onPress={addMedicine}
              activeOpacity={0.8}
            >
              <Text style={styles.submitBtnText}>Add Medicine</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleDeleteCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Medicine</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete this medicine? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleDeleteCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDeleteConfirm}
                activeOpacity={0.8}
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
    backgroundColor: "#F9FAFB",
  },
  backBtn: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#374151",
  },
  sortContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
  },
  sortScrollView: {
    flexGrow: 0,
  },
  sortBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  activeSortBtn: {
    backgroundColor: "#1E40AF",
    borderColor: "#1E40AF",
  },
  sortBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeSortText: {
    color: "#FFFFFF",
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  resultsText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingVertical: 16,
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
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    padding: 16,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  medicineInfo: {
    flex: 1,
    marginRight: 12,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    lineHeight: 22,
  },
  medicineBrand: {
    fontSize: 12,
    color: "#1E40AF",
    marginBottom: 4,
    fontWeight: "500",
  },
  medicineCategory: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  stockText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  priceText: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "600",
    marginTop: 4,
  },
  quickActions: {
    alignItems: "center",
    // gap not fully supported; space with margin
  },
  quickBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quickBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
  },
  expandBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#1E40AF",
    justifyContent: "center",
    alignItems: "center",
  },
  expandBtnText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },
  expandedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  stockUpdateRow: {
    flexDirection: "row",
    // use margin on input and button instead of gap
    marginBottom: 16,
  },
  stockInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#FFFFFF",
    color: "#374151",
  },
  updateBtn: {
    backgroundColor: "#1E40AF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: "center",
  },
  updateBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  presetActions: {
    marginBottom: 16,
  },
  presetLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  presetBtns: {
    flexDirection: "row",
    // space preset buttons with marginRight
  },
  presetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  presetBtnText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  mr8: {
    marginRight: 8,
  },
  deleteBtn: {
    backgroundColor: "#DC2626",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  medicineListContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  addMedicineContainer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  addMedicineBtn: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#1E40AF",
    alignItems: "center",
  },
  addMedicineBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  addMedicineForm: {
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    color: "#374151",
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  formInputHalf: {
    flex: 1,
  },
  submitBtn: {
    backgroundColor: "#059669",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
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
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#DC2626",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});