import React from "react";
import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';
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
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Inventory</Text>
          <Text style={styles.subtitle}>Manage medicines</Text>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={onNavigateInventory}>
          <Text style={styles.headerButtonText}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={16} color="#6B7280" style={styles.searchIcon} />
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
          <Text style={styles.cardTitle}>Add Medicine</Text>
          <View style={styles.cardIcon}>
            <Ionicons name="add" size={16} color="#FFFFFF" />
          </View>
        </View>
        
        <View style={styles.formGrid}>
          <View style={styles.formRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Medicine name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Qty</Text>
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
                placeholder="Category"
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
          <Ionicons name="add" size={16} color="#FFFFFF" style={styles.addButtonIcon} />
          <Text style={styles.addButtonText}>Add Medicine</Text>
        </TouchableOpacity>
      </View>

      {/* Inventory List */}
      <View style={styles.inventorySection}>
        <Text style={styles.sectionTitle}>Current Stock ({filteredItems.length})</Text>
        
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
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <View style={[
                      styles.statusBadge, 
                      { backgroundColor: stockStatus.color === '#FF3B30' ? '#FEF2F2' : 
                          stockStatus.color === '#FF9500' ? '#FFF7ED' : '#F0FDF4' }
                    ]}>
                      <Text style={[
                        styles.statusText, 
                        { color: stockStatus.color === '#FF3B30' ? '#DC2626' : 
                            stockStatus.color === '#FF9500' ? '#EA580C' : '#16A34A' }
                      ]}>
                        {stockStatus.status}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.itemCategory} numberOfLines={1}>{item.category}</Text>
                  
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
                    <Ionicons name="add" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => updateQty(item.id, -1)}
                  >
                    <Ionicons name="remove" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]} 
                    onPress={() => deleteItem(item.id)}
                  >
                    <Ionicons name="trash-outline" size={12} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />

        {filteredItems.length > 8 && (
          <TouchableOpacity style={styles.viewMoreButton} onPress={onNavigateInventory}>
            <Text style={styles.viewMoreText}>View All {filteredItems.length} Items</Text>
            <Ionicons name="arrow-forward" size={16} color="#1E40AF" />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 2,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E40AF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 70,
    justifyContent: 'center',
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  
  // Search Styles
  searchSection: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    paddingVertical: 10,
  },
  
  // Add Card Styles
  addCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  cardIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#1E40AF',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGrid: {
    gap: 12,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1E293B',
  },
  addButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    flexDirection: 'row',
  },
  addButtonIcon: {
    marginRight: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Inventory Section Styles
  inventorySection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  inventoryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  itemContent: {
    flex: 1,
    marginRight: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 50,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  itemCategory: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  lowStockText: {
    color: '#DC2626',
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
  },
  
  // Action Button Styles
  actionButtons: {
    flexDirection: 'column',
    gap: 4,
    justifyContent: 'center',
  },
  actionButton: {
    width: 28,
    height: 28,
    backgroundColor: '#1E40AF',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  
  // View More Button
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#1E40AF',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 8,
    gap: 6,
  },
  viewMoreText: {
    color: '#1E40AF',
    fontSize: 14,
    fontWeight: '600',
  },
});