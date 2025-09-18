import React from "react";
import { FlatList, ScrollView, Text, TouchableOpacity, View, StyleSheet, Dimensions } from "react-native";
import { Order } from "./types";

const { width } = Dimensions.get('window');

interface Props {
  orders: Order[];
  changeStatus: (id: string, status: Order["status"]) => void | Promise<void>;
  getStatusColor: (s: Order["status"]) => string;
}

export default function OrdersSection({ orders, changeStatus, getStatusColor }: Props) {
  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "confirmed": return "⏳";
      case "ready": return "✅";
      case "completed": return "🎉";
      default: return "📋";
    }
  };

  const getItemCount = (items: any[]) => {
    return items.reduce((total, item) => total + (item.quantity || item.qty || 1), 0);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={styles.headerIconContainer}>
            <Text style={styles.headerIcon}>📦</Text>
          </View>
          <Text style={styles.sectionHeader}>Active Orders</Text>
          <Text style={styles.sectionSubtitle}>Manage your pharmacy orders efficiently</Text>
        </View>

        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderCardHeader}>
                <View style={styles.orderInfo}>
                  <View style={styles.patientSection}>
                    <View style={styles.patientIcon}>
                      <Text style={styles.patientIconText}>👤</Text>
                    </View>
                    <View style={styles.patientDetails}>
                      <Text style={styles.patientName}>{item.patientName}</Text>
                      <Text style={styles.orderId}>Order #{item.id.slice(-6).toUpperCase()}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
                    <Text style={styles.statusText}>{String(item.status).toUpperCase()}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <View style={styles.deliverySection}>
                  <View style={styles.deliveryInfo}>
                    <Text style={styles.deliveryIcon}>
                      {item.pickup === "delivery" ? "🚚" : "🏪"}
                    </Text>
                    <Text style={styles.deliveryType}>
                      {item.pickup === "delivery" ? "Home Delivery" : "Store Pickup"}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemsSection}>
                  <View style={styles.itemsHeader}>
                    <Text style={styles.itemsLabel}>Items ({getItemCount(item.items)})</Text>
                  </View>
                  <View style={styles.itemsList}>
                    {item.items.slice(0, 3).map((it: any, index: number) => (
                      <View key={index} style={styles.itemRow}>
                        <Text style={styles.itemName}>{it.name}</Text>
                        <Text style={styles.itemQuantity}>×{it.quantity || it.qty}</Text>
                      </View>
                    ))}
                    {item.items.length > 3 && (
                      <Text style={styles.moreItems}>+{item.items.length - 3} more items</Text>
                    )}
                  </View>
                </View>
              </View>

              {item.status !== "completed" && (
                <View style={styles.orderActions}>
                  {item.status === "confirmed" && (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.readyButton]} 
                      onPress={() => changeStatus(item.id, "ready")}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.actionButtonIcon}>✅</Text>
                      <Text style={styles.actionButtonText}>Mark Ready</Text>
                    </TouchableOpacity>
                  )}
                  {item.status === "ready" && (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.completeButton]} 
                      onPress={() => changeStatus(item.id, "completed")}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.actionButtonIcon}>🎉</Text>
                      <Text style={styles.actionButtonText}>Complete Order</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No Active Orders</Text>
              <Text style={styles.emptySubtitle}>New orders will appear here</Text>
            </View>
          )}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 20,
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  headerIcon: {
    fontSize: 24,
    color: 'white',
  },
  sectionHeader: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  orderCardHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  patientSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  patientIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  patientIconText: {
    fontSize: 16,
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 12,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  orderDetails: {
    padding: 20,
  },
  deliverySection: {
    marginBottom: 20,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  deliveryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  deliveryType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E40AF',
  },
  itemsSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemsHeader: {
    marginBottom: 12,
  },
  itemsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
  },
  itemsList: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  itemName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    fontFamily: 'monospace',
  },
  moreItems: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
  },
  orderActions: {
    padding: 20,
    paddingTop: 0,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  readyButton: {
    backgroundColor: '#1E40AF',
  },
  completeButton: {
    backgroundColor: '#1E40AF',
  },
  actionButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  separator: {
    height: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});