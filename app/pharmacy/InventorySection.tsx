import React from "react";
import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import { Item } from "./types";

interface Props {
  name: string;
  qty: string;
  price: string;
  category: string;
  setName: (v: string) => void;
  setQty: (v: string) => void;
  setPrice: (v: string) => void;
  setCategory: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filteredItems: Item[];
  addItem: () => void;
  updateQty: (id: string, delta: number) => void;
  deleteItem: (id: string) => void;
  getStockStatus: (qty: number) => { color: string; status: string };
  onNavigateInventory: () => void;
}

export default function InventorySection({
  name,
  qty,
  price,
  category,
  setName,
  setQty,
  setPrice,
  setCategory,
  searchQuery,
  setSearchQuery,
  filteredItems,
  addItem,
  updateQty,
  deleteItem,
  getStockStatus,
  onNavigateInventory,
}: Props) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Inventory Management</Text>
          <Text style={styles.subtitle}>Manage your medicine inventory</Text>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={onNavigateInventory}>
          <Text style={styles.headerButtonText}>View All</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicines..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      {/* Add New Medicine Card */}
      <View style={styles.addCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Add New Medicine</Text>
          <View style={styles.cardIcon}>
            <Text style={styles.plusIcon}>+</Text>
          </View>
        </View>
        
        <View style={styles.formGrid}>
          <View style={styles.formRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Medicine Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Quantity</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={qty}
                onChangeText={setQty}
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
          
          <View style={styles.formRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Category</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter category"
                value={category}
                onChangeText={setCategory}
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Price (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <Text style={styles.addButtonText}>Add Medicine</Text>
        </TouchableOpacity>
      </View>

      {/* Inventory List */}
      <View style={styles.inventorySection}>
        <Text style={styles.sectionTitle}>Current Inventory</Text>
        
        <FlatList
          data={filteredItems.slice(0, 8)}
          keyExtractor={(i) => i.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const stockStatus = getStockStatus(item.qty);
            return (
              <View style={styles.inventoryCard}>
                <View style={styles.itemContent}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: stockStatus.color === '#FF3B30' ? '#FEF2F2' : stockStatus.color === '#FF9500' ? '#FFF7ED' : '#F0FDF4' }]}>
                      <Text style={[styles.statusText, { color: stockStatus.color === '#FF3B30' ? '#DC2626' : stockStatus.color === '#FF9500' ? '#EA580C' : '#16A34A' }]}>
                        {stockStatus.status}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.itemCategory}>{item.category}</Text>
                  
                  <View style={styles.itemFooter}>
                    <Text style={[styles.stockText, item.qty < 20 && styles.lowStockText]}>
                      Stock: {item.qty}
                    </Text>
                    {item.price && (
                      <Text style={styles.priceText}>₹{item.price}</Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => updateQty(item.id, 1)}
                  >
                    <Text style={styles.actionButtonText}>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => updateQty(item.id, -1)}
                  >
                    <Text style={styles.actionButtonText}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]} 
                    onPress={() => deleteItem(item.id)}
                  >
                    <Text style={styles.deleteButtonText}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />

        {filteredItems.length > 8 && (
          <TouchableOpacity style={styles.viewMoreButton} onPress={onNavigateInventory}>
            <Text style={styles.viewMoreText}>View All {filteredItems.length} Items</Text>
            <Text style={styles.viewMoreArrow}>→</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E40AF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 4,
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  
  // Search Styles
  searchSection: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 12,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    paddingVertical: 12,
  },
  
  // Add Card Styles
  addCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  cardIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  formGrid: {
    gap: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  addButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Inventory Section Styles
  inventorySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  inventoryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  itemContent: {
    flex: 1,
    marginRight: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemCategory: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  lowStockText: {
    color: '#DC2626',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
  },
  
  // Action Button Styles
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  deleteButtonText: {
    fontSize: 16,
  },
  
  // View More Button
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#1E40AF',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 8,
  },
  viewMoreText: {
    color: '#1E40AF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  viewMoreArrow: {
    color: '#1E40AF',
    fontSize: 16,
  },
});