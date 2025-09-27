import React from "react";
import { ScrollView, Text, TouchableOpacity, View, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import PharmacyLocation from "./loc";

const { width } = Dimensions.get('window');
const isMobile = width < 768;

interface DashboardMetrics {
  lowStockItems: number;
  totalInventory: number;
  inventoryValue: number;
}

interface Props {
  notificationsCount: number;
  pendingOrdersCount: number;
  todayRevenue: number;
  dashboardMetrics: DashboardMetrics;
  onNavigateInventory: () => void;
  setActiveSection: (s: "dashboard" | "notifications" | "inventory" | "orders") => void;
}

export default function DashboardSection({
  notificationsCount,
  pendingOrdersCount,
  todayRevenue,
  dashboardMetrics,
  onNavigateInventory,
  setActiveSection,
}: Props) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const dashboardCards = [
    {
      icon: "notifications-outline",
      value: notificationsCount,
      label: "New Requests",
      color: "#FFFFFF",
      bgColor: "rgba(255, 255, 255, 0.15)",
    },
    {
      icon: "list-outline",
      value: pendingOrdersCount,
      label: "Active Orders",
      color: "#FFFFFF",
      bgColor: "rgba(255, 255, 255, 0.15)",
    },
    {
      icon: "warning-outline",
      value: dashboardMetrics.lowStockItems,
      label: "Low Stock",
      color: "#FF6B6B",
      bgColor: "rgba(255, 107, 107, 0.2)",
    },
    {
      icon: "medical-outline",
      value: dashboardMetrics.totalInventory,
      label: "Total Items",
      color: "#4ECDC4",
      bgColor: "rgba(78, 205, 196, 0.2)",
    },
    {
      icon: "cash-outline",
      value: `₹${formatNumber(todayRevenue)}`,
      label: "Today's Revenue",
      color: "#FFE66D",
      bgColor: "rgba(255, 230, 109, 0.2)",
    },
    {
      icon: "cube-outline",
      value: `₹${formatNumber(dashboardMetrics.inventoryValue)}`,
      label: "Inventory Value",
      color: "#A8E6CF",
      bgColor: "rgba(168, 230, 207, 0.2)",
    },
  ];

  const quickActions = [
    {
      icon: "cube-outline",
      label: "Full Inventory",
      action: onNavigateInventory,
    },
    {
      icon: "notifications-outline",
      label: "New Orders",
      action: () => setActiveSection("notifications"),
    },
    {
      icon: "list-outline",
      label: "Manage Orders",
      action: () => setActiveSection("orders"),
    },
  ];

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Dashboard Overview</Text>
          <Text style={styles.subtitle}>Monitor your pharmacy performance</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="grid-outline" size={24} color="#FFFFFF" />
        </View>
      </View>

      {/* Metrics Grid */}
      <View style={[styles.metricsGrid, isMobile && styles.mobileMetricsGrid]}>
        {dashboardCards.slice(0, 2).map((card, index) => (
          <View key={index} style={[styles.metricCard, isMobile && styles.mobileMetricCard]}>
            <View style={[styles.metricIcon, { backgroundColor: card.bgColor }]}>
              <Ionicons name={card.icon as any} size={24} color={card.color} />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricValue}>{card.value}</Text>
              <Text style={styles.metricLabel}>{card.label}</Text>
            </View>
          </View>
        ))}
        
        {/* Pharmacy Location Component */}
        <View style={[styles.locationCard, isMobile && styles.mobileLocationCard]}>
          <PharmacyLocation />
        </View>

        {dashboardCards.slice(2).map((card, index) => (
          <View key={index + 2} style={[styles.metricCard, isMobile && styles.mobileMetricCard]}>
            <View style={[styles.metricIcon, { backgroundColor: card.bgColor }]}>
              <Ionicons name={card.icon as any} size={24} color={card.color} />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricValue}>{typeof card.value === 'string' ? card.value : card.value}</Text>
              <Text style={styles.metricLabel}>{card.label}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Actions Section */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={[styles.quickActionsGrid, isMobile && styles.mobileQuickActionsGrid]}>
          {quickActions.map((action, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.quickActionCard, isMobile && styles.mobileQuickActionCard]} 
              onPress={action.action}
              activeOpacity={0.8}
            >
              {!isMobile ? (
                // Desktop Layout
                <>
                  <View style={styles.quickActionIcon}>
                    <Ionicons name={action.icon as any} size={20} color="white" />
                  </View>
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                  <View style={styles.quickActionArrow}>
                    <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
                  </View>
                </>
              ) : (
                // Mobile Layout
                <>
                  <View style={styles.mobileQuickActionIcon}>
                    <Ionicons name={action.icon as any} size={18} color="white" />
                  </View>
                  <Text style={styles.mobileQuickActionLabel}>{action.label}</Text>
                  <View style={styles.mobileQuickActionArrow}>
                    <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.7)" />
                  </View>
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Low Stock Alert */}
      {dashboardMetrics.lowStockItems > 0 && (
        <View style={styles.alertSection}>
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <View style={styles.alertIconContainer}>
                <Ionicons name="warning" size={18} color="#FF6B6B" />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Stock Alert</Text>
                <Text style={styles.alertText}>
                  {dashboardMetrics.lowStockItems} items are running low on stock
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.alertButton} 
              onPress={() => setActiveSection("inventory")}
            >
              <Text style={styles.alertButtonText}>View Items</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" style={styles.alertButtonArrow} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'linear-gradient(135deg, #2E4EC6 0%, #87CEEB 100%)',
  },
  
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  
  headerIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  
  mobileMetricsGrid: {
    gap: 10,
  },
  
  metricCard: {
    flex: 1,
    minWidth: 280,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backdropFilter: 'blur(20px)',
  },
  
  mobileMetricCard: {
    minWidth: '47%',
    padding: 16,
    borderRadius: 14,
  },
  
  locationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    backdropFilter: 'blur(20px)',
  },
  
  mobileLocationCard: {
    minWidth: '100%',
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    backdropFilter: 'blur(20px)',
  },
  
  metricIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  metricContent: {
    flex: 1,
  },
  
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  metricLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  // Quick Actions
  quickActionsSection: {
    marginBottom: 24,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  
  mobileQuickActionsGrid: {
    flexDirection: 'column',
    gap: 10,
  },
  
  quickActionCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backdropFilter: 'blur(20px)',
  },
  
  mobileQuickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    minHeight: 60,
    borderRadius: 12,
  },
  
  quickActionIcon: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  quickActionArrow: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  // Mobile Quick Action Styles
  mobileQuickActionIcon: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  mobileQuickActionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  mobileQuickActionArrow: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Alert Section
  alertSection: {
    marginBottom: 16,
  },
  
  alertCard: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backdropFilter: 'blur(20px)',
  },
  
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  
  alertIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  
  alertContent: {
    flex: 1,
  },
  
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  alertText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
    fontWeight: '500',
  },
  
  alertButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  alertButtonText: {
    color: '#2E4EC6',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 6,
  },
  
  alertButtonArrow: {
    marginLeft: 2,
    color: '#2E4EC6',
  },
});