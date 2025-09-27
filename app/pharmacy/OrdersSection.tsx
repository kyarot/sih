import React from "react";
import { FlatList, ScrollView, Text, TouchableOpacity, View, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
      case "confirmed": return "time-outline";
      case "ready": return "checkmark-circle-outline";
      case "completed": return "checkmark-done-outline";
      default: return "list-outline";
    }
  };

  const getItemCount = (items: any[]) => {
    return items.reduce((total, item) => total + (item.quantity || item.qty || 1), 0);
  };

  return (
    <LinearGradient
      colors={['#1E3A8A', '#3B82F6', '#60A5FA']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={styles.headerIconContainer}>
            <View style={styles.iconGlow}>
              <Ionicons name="cube-outline" size={28} color="white" />
            </View>
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
              <View style={styles.orderCardContent}>
                <View style={styles.orderCardHeader}>
                  <View style={styles.orderInfo}>
                    <View style={styles.patientSection}>
                      <View style={styles.patientIcon}>
                        <Ionicons name="person-outline" size={22} color="white" />
                      </View>
                      <View style={styles.patientDetails}>
                        <Text style={styles.patientName}>{item.patientName}</Text>
                        <Text style={styles.orderId}>Order #{item.id.slice(-6).toUpperCase()}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                      <Ionicons name={getStatusIcon(item.status) as any} size={16} color="white" />
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
                        <Ionicons name="checkmark-circle-outline" size={20} color="#1E3A8A" />
                        <Text style={styles.actionButtonText}>Mark Ready</Text>
                      </TouchableOpacity>
                    )}
                    {item.status === "ready" && (
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.completeButton]} 
                        onPress={() => changeStatus(item.id, "completed")}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="checkmark-done-outline" size={20} color="#4F46E5" />
                        <Text style={styles.actionButtonText}>Complete Order</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="cube-outline" size={48} color="rgba(255,255,255,0.6)" />
              </View>
              <Text style={styles.emptyTitle}>No Active Orders</Text>
              <Text style={styles.emptySubtitle}>New orders will appear here</Text>
            </View>
          )}
        />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingBottom: 30,
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  iconGlow: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  orderCard: {
    marginVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  orderCardContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    margin: 1,
    borderRadius: 19,
  },
  orderCardHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 58, 138, 0.1)',
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
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.2)',
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 14,
    color: 'rgba(30, 58, 138, 0.6)',
    fontFamily: 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 12,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIcon: {
    marginRight: 6,
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
    backgroundColor: 'rgba(30, 58, 138, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.1)',
  },
  deliveryIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  deliveryType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E3A8A',
  },
  itemsSection: {
    backgroundColor: 'rgba(30, 58, 138, 0.02)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.1)',
  },
  itemsHeader: {
    marginBottom: 12,
  },
  itemsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  itemsList: {
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.08)',
    shadowColor: 'rgba(30, 58, 138, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    fontFamily: 'monospace',
  },
  moreItems: {
    fontSize: 14,
    color: 'rgba(30, 58, 138, 0.6)',
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
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'rgba(30, 58, 138, 0.2)',
    shadowColor: 'rgba(30, 58, 138, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  readyButton: {
    marginRight: 8,
  },
  completeButton: {
    marginLeft: 8,
  },
  actionButtonIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  separator: {
    height: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});