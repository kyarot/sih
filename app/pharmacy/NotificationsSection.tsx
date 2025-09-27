import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Item, Notification } from "./types";
import React from "react";
import { LinearGradient } from 'expo-linear-gradient';

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
      paddingHorizontal: 20,
      paddingTop: 24,
    },
    gradientBackground: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    sectionHeader: {
      fontSize: 32,
      fontWeight: '700',
      color: 'white',
      marginBottom: 32,
      textAlign: 'center',
      letterSpacing: 0.8,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 80,
      paddingHorizontal: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      borderRadius: 24,
      marginHorizontal: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(20px)',
      shadowColor: 'rgba(0, 0, 0, 0.4)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 8,
    },
    emptyStateIcon: {
      marginBottom: 24,
      opacity: 0.8,
    },
    emptyStateTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: 'white',
      marginBottom: 12,
      textAlign: 'center',
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    emptyStateText: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
      lineHeight: 24,
      maxWidth: 280,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    notificationCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 24,
      marginBottom: 20,
      marginHorizontal: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.25)',
      backdropFilter: 'blur(20px)',
      shadowColor: 'rgba(0, 0, 0, 0.4)',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 12,
      overflow: 'hidden',
    },
    notificationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: 24,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    },
    patientInfo: {
      flex: 1,
    },
    notificationPatientName: {
      fontSize: 22,
      fontWeight: '800',
      color: 'white',
      marginBottom: 6,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    notificationPhone: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.85)',
      marginBottom: 8,
      fontWeight: '600',
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1,
    },
    notificationTime: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.7)',
      fontWeight: '500',
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1,
    },
    urgentBadge: {
      backgroundColor: 'white',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    urgentText: {
      color: '#1E40AF',
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1.2,
    },
    notificationDetails: {
      padding: 24,
      paddingTop: 20,
    },
    notificationDelivery: {
      fontSize: 16,
      color: 'white',
      marginBottom: 16,
      fontWeight: '700',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 16,
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    addressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    addressIcon: {
      marginRight: 12,
    },
    notificationAddress: {
      fontSize: 15,
      color: 'rgba(255, 255, 255, 0.95)',
      flex: 1,
      lineHeight: 22,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      padding: 16,
      borderRadius: 16,
      borderLeftWidth: 4,
      borderLeftColor: 'white',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      fontWeight: '500',
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1,
    },
    notificationItemsTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: 'white',
      marginBottom: 16,
      marginTop: 8,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    notificationItem: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: 10,
      paddingLeft: 12,
      lineHeight: 22,
      fontWeight: '600',
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1,
    },
    notificationItemOutOfStock: {
      color: '#FF6B6B',
      fontWeight: '700',
      backgroundColor: 'rgba(255, 107, 107, 0.2)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      marginLeft: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 107, 107, 0.4)',
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    notificationActions: {
      flexDirection: 'row',
      padding: 24,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.15)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      gap: 16,
    },
    notificationBtn: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 52,
      shadowColor: 'rgba(0, 0, 0, 0.4)',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    rejectBtn: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    acceptBtn: {
      backgroundColor: 'white',
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.8)',
    },
    rejectBtnText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.5,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    acceptBtnText: {
      color: '#1E40AF',
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
  });

  return (
    <View style={styles.contentArea}>
      <LinearGradient
        colors={['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionHeader}>Order Notifications</Text>

        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={56} color="rgba(255, 255, 255, 0.8)" style={styles.emptyStateIcon} />
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
                      <Ionicons name="location-outline" size={20} color="rgba(255, 255, 255, 0.8)" style={styles.addressIcon} />
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
    </View>
  );
}