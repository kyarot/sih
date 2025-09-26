import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Item, Notification } from "./types";
import React from "react";

interface Props {
  notifications: Notification[];
  items: Item[];
  getTimeAgo: (d?: Date) => string;
  acceptOrder: (id: string) => void | Promise<void>;
  rejectOrder: (id: string) => void | Promise<void>;
}

export default function NotificationsSection({ notifications, items, getTimeAgo, acceptOrder, rejectOrder }: Props) {
  const styles = StyleSheet.create({
    contentArea: {
      flex: 1,
      backgroundColor: '#F8FAFC',
      paddingHorizontal: 20,
      paddingTop: 24,
    },
    sectionHeader: {
      fontSize: 28,
      fontWeight: '700',
      color: '#1E40AF',
      marginBottom: 32,
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 80,
      paddingHorizontal: 40,
      backgroundColor: 'white',
      borderRadius: 16,
      marginHorizontal: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    emptyStateIcon: {
      marginBottom: 24,
      opacity: 0.6,
    },
    emptyStateTitle: {
      fontSize: 22,
      fontWeight: '600',
      color: '#1E40AF',
      marginBottom: 12,
      textAlign: 'center',
    },
    emptyStateText: {
      fontSize: 16,
      color: '#64748B',
      textAlign: 'center',
      lineHeight: 24,
      maxWidth: 280,
    },
    notificationCard: {
      backgroundColor: 'white',
      borderRadius: 16,
      marginBottom: 16,
      marginHorizontal: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      overflow: 'hidden',
    },
    notificationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F1F5F9',
    },
    patientInfo: {
      flex: 1,
    },
    notificationPatientName: {
      fontSize: 20,
      fontWeight: '700',
      color: '#1E40AF',
      marginBottom: 4,
    },
    notificationPhone: {
      fontSize: 16,
      color: '#64748B',
      marginBottom: 8,
      fontWeight: '500',
    },
    notificationTime: {
      fontSize: 14,
      color: '#94A3B8',
      fontWeight: '500',
    },
    urgentBadge: {
      backgroundColor: '#1E40AF',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      shadowColor: '#1E40AF',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    urgentText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1,
    },
    notificationDetails: {
      padding: 20,
      paddingTop: 16,
    },
    notificationDelivery: {
      fontSize: 16,
      color: '#1E40AF',
      marginBottom: 12,
      fontWeight: '600',
      backgroundColor: '#F0F4FF',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    addressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    addressIcon: {
      marginRight: 8,
    },
    notificationAddress: {
      fontSize: 15,
      color: '#64748B',
      flex: 1,
      lineHeight: 22,
      backgroundColor: '#F8FAFC',
      padding: 12,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: '#1E40AF',
    },
    notificationItemsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1E40AF',
      marginBottom: 12,
      marginTop: 4,
    },
    notificationItem: {
      fontSize: 15,
      color: '#374151',
      marginBottom: 8,
      paddingLeft: 8,
      lineHeight: 20,
      fontWeight: '500',
    },
    notificationItemOutOfStock: {
      color: '#DC2626',
      fontWeight: '600',
      backgroundColor: '#FEF2F2',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginLeft: 8,
    },
    notificationActions: {
      flexDirection: 'row',
      padding: 20,
      paddingTop: 16,
      // gap not supported broadly; use margin on first button
      borderTopWidth: 1,
      borderTopColor: '#F1F5F9',
      backgroundColor: '#FAFBFC',
    },
    notificationBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    rejectBtn: {
      backgroundColor: 'white',
      borderWidth: 2,
      borderColor: '#E5E7EB',
      marginRight: 12,
    },
    acceptBtn: {
      backgroundColor: '#1E40AF',
      borderWidth: 2,
      borderColor: '#1E40AF',
    },
    rejectBtnText: {
      color: '#64748B',
      fontSize: 16,
      fontWeight: '600',
    },
    acceptBtnText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
  });

  return (
    <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionHeader}>Order Notifications</Text>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-outline" size={48} color="#9CA3AF" style={styles.emptyStateIcon} />
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

                {item.address && (
                  <View style={styles.addressContainer}>
                    <Ionicons name="location-outline" size={16} color="#6B7280" style={styles.addressIcon} />
                    <Text style={styles.notificationAddress}>{item.address}</Text>
                  </View>
                )}

                <Text style={styles.notificationItemsTitle}>Requested Items:</Text>
                {item.items.map((orderItem, index) => {
                  const inventoryItem = items.find((invItem) =>
                    invItem.name.toLowerCase().includes(orderItem.name.toLowerCase())
                  );
                  const required = (orderItem as any).quantity ?? orderItem.qty;
                  const hasStock = inventoryItem && inventoryItem.qty >= (required ?? 0);

                  return (
                    <Text key={index} style={[styles.notificationItem, !hasStock && styles.notificationItemOutOfStock]}>
                      • {orderItem.name} × {required}
                    </Text>
                  );
                })}
              </View>

              <View style={styles.notificationActions}>
                <TouchableOpacity 
                  style={[styles.notificationBtn, styles.rejectBtn]} 
                  onPress={() => rejectOrder(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.rejectBtnText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.notificationBtn, styles.acceptBtn]} 
                  onPress={() => acceptOrder(item.id)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.acceptBtnText}>Accept Order</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </ScrollView>
  );
}