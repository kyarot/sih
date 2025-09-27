// app/pharmacy/inventory.tsx
import axios from "axios";
import { Stack, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScrollView}>
        {[
          { key: "name-asc", label: "A-Z" },
          { key: "name-desc", label: "Z-A" },
          { key: "stock-high", label: "High Stock" },
          { key: "stock-low", label: "Low Stock" },
          { key: "price-asc", label: "Price ↑" },
          { key: "price-desc", label: "Price ↓" }
        ].map((sort) => (
          <TouchableOpacity 
            key={sort.key}
            style={[styles.sortBtn, sortOption === sort.key && styles.activeSortBtn]}
            onPress={() => setSortOption(sort.key as SortOption)}
          >
            <Text style={[styles.sortBtnText, sortOption === sort.key && styles.activeSortText]}>
              {sort.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const getStockStatus = (qty: number) => {
    if (qty <= 10) return { color: "#DC2626", status: "Critical" };
    if (qty <= 20) return { color: "#EA580C", status: "Low" };
    if (qty <= 50) return { color: "#1E3A8A", status: "Medium" };
    return { color: "#059669", status: "Good" };
  };

  const renderInventoryCard = ({ item }: { item: Item }) => {
    const stockStatus = getStockStatus(item.qty);
    const isExpanded = expandedItem === item.id;
    const currentEditValue = editingStock[item.id] ?? item.qty.toString();

    return (
      <View style={styles.inventoryCard}>
        <View style={styles.cardContent}>
          <TouchableOpacity onPress={() => setExpandedItem(isExpanded ? null : item.id)} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
              <View style={styles.medicineInfo}>
                <Text style={styles.medicineName} numberOfLines={2}>{item.name}</Text>
                {item.brand && <Text style={styles.medicineBrand}>{item.brand}</Text>}
                {item.category && <Text style={styles.medicineCategory}>{item.category}</Text>}
                
                <View style={styles.infoRow}>
                  <View style={[styles.stockBadge, { backgroundColor: stockStatus.color }]}>
                    <Text style={styles.stockBadgeText}>{stockStatus.status}</Text>
                  </View>
                  <Text style={styles.stockText}>Stock: {item.qty}</Text>
                </View>
                
                {item.price && <Text style={styles.priceText}>₹{item.price.toFixed(2)}</Text>}
              </View>
              
              <View style={styles.quickActions}>
                <TouchableOpacity style={styles.quickBtn} onPress={() => quickAdjustStock(item.id, -1)}>
                  <Ionicons name="remove" size={16} color="#1E3A8A" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickBtn} onPress={() => quickAdjustStock(item.id, 1)}>
                  <Ionicons name="add" size={16} color="#1E3A8A" />
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
                  style={styles.stockInput}
                  value={currentEditValue}
                  onChangeText={(text) => setEditingStock(prev => ({ ...prev, [item.id]: text }))}
                  keyboardType="numeric"
                  placeholder="Enter quantity"
                  placeholderTextColor="rgba(30, 58, 138, 0.4)"
                />
                <TouchableOpacity style={styles.updateBtn} onPress={() => updateStock(item.id, currentEditValue)}>
                  <Text style={styles.updateBtnText}>Update</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.presetActions}>
                <Text style={styles.presetLabel}>Quick Adjust</Text>
                <View style={styles.presetBtns}>
                  {[-10, -5, 5, 10].map((delta) => (
                    <TouchableOpacity 
                      key={delta}
                      style={styles.presetBtn}
                      onPress={() => quickAdjustStock(item.id, delta)}
                    >
                      <Text style={styles.presetBtnText}>{delta > 0 ? `+${delta}` : delta}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(item.id)}>
                <Ionicons name="trash-outline" size={16} color="white" />
                <Text style={styles.deleteBtnText}>Delete Item</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#1E3A8A', '#3B82F6', '#60A5FA']} style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Inventory Management",
          headerShown: true,
          headerStyle: { backgroundColor: "transparent" },
          headerTitleStyle: { fontSize: 18, fontWeight: "600", color: "#FFFFFF" },
          headerTintColor: "#FFFFFF",
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          )
        }} 
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="medical-outline" size={28} color="white" />
          </View>
          <Text style={styles.headerTitle}>Inventory Management</Text>
          <Text style={styles.headerSubtitle}>Manage your pharmacy stock efficiently</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color="rgba(30, 58, 138, 0.6)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search medicines, brands, categories..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="rgba(30, 58, 138, 0.4)"
            />
          </View>
        </View>

        {renderSortButtons()}

        <Text style={styles.resultsText}>
          {filteredAndSortedItems.length} medicine{filteredAndSortedItems.length !== 1 ? 's' : ''} found
        </Text>

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
              <View style={styles.emptyIconContainer}>
                <Ionicons name="cube-outline" size={48} color="rgba(255,255,255,0.6)" />
              </View>
              <Text style={styles.emptyTitle}>No medicines found</Text>
              <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={fetchDrugs}
        />
      </View>

      <TouchableOpacity style={styles.floatingBtn} onPress={() => setShowAddForm(true)} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color="#1E3A8A" />
      </TouchableOpacity>

      <Modal visible={showAddForm} transparent animationType="slide" onRequestClose={() => setShowAddForm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.addFormModal}>
            <View style={styles.addFormHeader}>
              <Text style={styles.addFormTitle}>Add New Medicine</Text>
              <TouchableOpacity onPress={() => setShowAddForm(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.addFormContent}>
              <TextInput
                style={styles.formInput}
                placeholder="Medicine Name *"
                value={newMedicine.name}
                onChangeText={(text) => setNewMedicine(prev => ({ ...prev, name: text }))}
                placeholderTextColor="rgba(30, 58, 138, 0.4)"
              />
              
              <TextInput
                style={styles.formInput}
                placeholder="Brand"
                value={newMedicine.brand}
                onChangeText={(text) => setNewMedicine(prev => ({ ...prev, brand: text }))}
                placeholderTextColor="rgba(30, 58, 138, 0.4)"
              />
              
              <TextInput
                style={styles.formInput}
                placeholder="Category"
                value={newMedicine.category}
                onChangeText={(text) => setNewMedicine(prev => ({ ...prev, category: text }))}
                placeholderTextColor="rgba(30, 58, 138, 0.4)"
              />
              
              <View style={styles.formRow}>
                <TextInput
                  style={[styles.formInput, styles.formInputHalf]}
                  placeholder="Price *"
                  value={newMedicine.price}
                  onChangeText={(text) => setNewMedicine(prev => ({ ...prev, price: text }))}
                  keyboardType="numeric"
                  placeholderTextColor="rgba(30, 58, 138, 0.4)"
                />
                
                <TextInput
                  style={[styles.formInput, styles.formInputHalf]}
                  placeholder="Quantity *"
                  value={newMedicine.quantity}
                  onChangeText={(text) => setNewMedicine(prev => ({ ...prev, quantity: text }))}
                  keyboardType="numeric"
                  placeholderTextColor="rgba(30, 58, 138, 0.4)"
                />
              </View>
              
              <TouchableOpacity style={styles.submitBtn} onPress={addMedicine}>
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.submitBtnText}>Add Medicine</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={handleDeleteCancel}>
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <Ionicons name="warning-outline" size={48} color="#DC2626" />
            <Text style={styles.deleteModalTitle}>Delete Medicine</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete this medicine? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleDeleteCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmDeleteButton} onPress={handleDeleteConfirm}>
                <Text style={styles.confirmDeleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingTop: 100 },
  header: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 20 },
  headerIconContainer: {
    width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: 'rgba(0, 0, 0, 0.3)', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 6, textAlign: 'center' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center' },
  searchContainer: { paddingHorizontal: 20, marginBottom: 16 },
  searchInputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0, 0, 0, 0.1)', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#1E3A8A', marginLeft: 10 },
  sortContainer: { paddingHorizontal: 20, marginBottom: 16 },
  sortScrollView: { paddingRight: 20 },
  sortBtn: {
    paddingHorizontal: 16, paddingVertical: 8, marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  activeSortBtn: { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
  sortBtnText: { fontSize: 14, fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)' },
  activeSortText: { color: '#1E3A8A' },
  resultsText: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500', paddingHorizontal: 20, marginBottom: 12 },
  listContainer: { paddingHorizontal: 12, paddingVertical: 8, paddingBottom: 80 },
  row: { justifyContent: 'space-between', marginHorizontal: 8 },
  inventoryCard: {
    flex: 0.48, marginBottom: 16, borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: 'rgba(0, 0, 0, 0.3)', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6
  },
  cardContent: { backgroundColor: 'rgba(255, 255, 255, 0.95)', margin: 1, borderRadius: 17 },
  cardHeader: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  medicineInfo: { flex: 1, marginRight: 12 },
  medicineName: { fontSize: 16, fontWeight: '600', color: '#1E3A8A', marginBottom: 4, lineHeight: 22 },
  medicineBrand: { fontSize: 12, color: 'rgba(30, 58, 138, 0.7)', marginBottom: 4, fontWeight: '500' },
  medicineCategory: { fontSize: 12, color: 'rgba(30, 58, 138, 0.5)', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' },
  stockBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginRight: 8 },
  stockBadgeText: { fontSize: 10, fontWeight: '600', color: '#FFFFFF' },
  stockText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  priceText: { fontSize: 14, color: '#059669', fontWeight: '600', marginTop: 4 },
  quickActions: { alignItems: 'center', gap: 6 },
  quickBtn: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(30, 58, 138, 0.1)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(30, 58, 138, 0.2)'
  },
  expandedContent: { paddingHorizontal: 16, paddingBottom: 16 },
  divider: { height: 1, backgroundColor: 'rgba(30, 58, 138, 0.1)', marginBottom: 16 },
  expandedTitle: { fontSize: 14, fontWeight: '600', color: '#1E3A8A', marginBottom: 12 },
  stockUpdateRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  stockInput: {
    flex: 1, borderWidth: 1, borderColor: 'rgba(30, 58, 138, 0.2)', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: 'white', color: '#1E3A8A'
  },
  updateBtn: {
    backgroundColor: '#1E3A8A', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 8, justifyContent: 'center'
  },
  updateBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  presetActions: { marginBottom: 16 },
  presetLabel: { fontSize: 12, color: 'rgba(30, 58, 138, 0.6)', marginBottom: 8, fontWeight: '500' },
  presetBtns: { flexDirection: 'row', gap: 8 },
  presetBtn: {
    paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(30, 58, 138, 0.05)',
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(30, 58, 138, 0.2)'
  },
  presetBtnText: { fontSize: 12, color: '#1E3A8A', fontWeight: '500' },
  deleteBtn: {
    backgroundColor: '#DC2626', paddingVertical: 10, borderRadius: 8, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 6
  },
  deleteBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyIconContainer: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: 'white', marginBottom: 8, textAlign: 'center' },
  emptyText: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center' },
  floatingBtn: {
    position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'white', justifyContent: 'center', alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.3)', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
    borderWidth: 2, borderColor: 'rgba(30, 58, 138, 0.1)'
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center', alignItems: 'center'
  },
  addFormModal: {
    backgroundColor: 'white', borderRadius: 20, margin: 20, overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.3)', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10, maxHeight: '80%'
  },
  addFormHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, backgroundColor: '#1E3A8A'
  },
  addFormTitle: { fontSize: 18, fontWeight: '600', color: 'white' },
  addFormContent: { padding: 20, maxHeight: 400 },
  formInput: {
    borderWidth: 1, borderColor: 'rgba(30, 58, 138, 0.2)', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, backgroundColor: 'white',
    marginBottom: 16, color: '#1E3A8A'
  },
  formRow: { flexDirection: 'row', gap: 12 },
  formInputHalf: { flex: 1 },
  submitBtn: {
    backgroundColor: '#059669', paddingVertical: 16, borderRadius: 12, alignItems: 'center',
    marginTop: 8, flexDirection: 'row', justifyContent: 'center', gap: 8,
    shadowColor: 'rgba(5, 150, 105, 0.3)', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  deleteModalContent: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, margin: 20,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 10
  },
  deleteModalTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginVertical: 16, textAlign: 'center' },
  deleteModalMessage: {
    fontSize: 14, color: '#6B7280', marginBottom: 24, textAlign: 'center', lineHeight: 20
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelButton: {
    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
    backgroundColor: 'rgba(30, 58, 138, 0.1)', borderWidth: 1, borderColor: 'rgba(30, 58, 138, 0.2)'
  },
  confirmDeleteButton: {
    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: '#DC2626'
  },
  cancelButtonText: { color: '#1E3A8A', fontSize: 16, fontWeight: '600' },
  confirmDeleteButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' }
});