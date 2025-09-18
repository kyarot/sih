import React from "react";
import { ScrollView, Text, TouchableOpacity, View, StyleSheet, Dimensions } from "react-native";
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
      icon: "🔔",
      value: notificationsCount,
      label: "New Requests",
      color: "#1E40AF",
      bgColor: "#EFF6FF",
    },
    {
      icon: "📋",
      value: pendingOrdersCount,
      label: "Active Orders",
      color: "#1E40AF",
      bgColor: "#EFF6FF",
    },
    {
      icon: "⚠",
      value: dashboardMetrics.lowStockItems,
      label: "Low Stock",
      color: "#EF4444",
      bgColor: "#FEF2F2",
    },
    {
      icon: "💊",
      value: dashboardMetrics.totalInventory,
      label: "Total Items",
      color: "#10B981",
      bgColor: "#F0FDF4",
    },
    {
      icon: "💰",
      value: `₹${formatNumber(todayRevenue)}`,
      label: "Today's Revenue",
      color: "#8B5CF6",
      bgColor: "#FAF5FF",
    },
    {
      icon: "📦",
      value: `₹${formatNumber(dashboardMetrics.inventoryValue)}`,
      label: "Inventory Value",
      color: "#F59E0B",
      bgColor: "#FFFBEB",
    },
  ];

  const quickActions = [
    {
      icon: "📊",
      label: "Full Inventory",
      action: onNavigateInventory,
    },
    {
      icon: "🔔",
      label: "New Orders",
      action: () => setActiveSection("notifications"),
    },
    {
      icon: "📋",
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
          <Text style={styles.headerIconText}>📊</Text>
        </View>
      </View>

      {/* Metrics Grid */}
      <View style={[styles.metricsGrid, isMobile && styles.mobileMetricsGrid]}>
        {dashboardCards.slice(0, 2).map((card, index) => (
          <View key={index} style={[styles.metricCard, isMobile && styles.mobileMetricCard]}>
            <View style={[styles.metricIcon, { backgroundColor: card.bgColor }]}>
              <Text style={styles.metricIconText}>{card.icon}</Text>
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
              <Text style={styles.metricIconText}>{card.icon}</Text>
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
            >
              <View style={styles.quickActionIcon}>
                <Text style={styles.quickActionIconText}>{action.icon}</Text>
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
              <View style={styles.quickActionArrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
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
                <Text style={styles.alertIcon}>⚠</Text>
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
              <Text style={styles.alertButtonArrow}>→</Text>
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
    backgroundColor: '#FFFFFF',
  },
  
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  
  headerIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  headerIconText: {
    fontSize: 24,
  },
  
  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  
  mobileMetricsGrid: {
    gap: 12,
  },
  
  metricCard: {
    flex: 1,
    minWidth: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  mobileMetricCard: {
    minWidth: '47%',
    padding: 16,
  },
  
  locationCard: {
   
  },
  
  mobileLocationCard: {
    minWidth: '100%',
    padding: 16,
  },
  
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  
  metricIconText: {
    fontSize: 20,
  },
  
  metricContent: {
    flex: 1,
  },
  
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  
  metricLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  
  // Quick Actions
  quickActionsSection: {
    marginBottom: 32,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  
  mobileQuickActionsGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  
  quickActionCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  
  mobileQuickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
  },
  
  quickActionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#1E40AF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  
  quickActionIconText: {
    fontSize: 18,
  },
  
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  
  quickActionArrow: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    backgroundColor: '#1E40AF',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  arrowText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Alert Section
  alertSection: {
    marginBottom: 20,
  },
  
  alertCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 20,
  },
  
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  alertIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  
  alertIcon: {
    fontSize: 18,
  },
  
  alertContent: {
    flex: 1,
  },
  
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 4,
  },
  
  alertText: {
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 20,
  },
  
  alertButton: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  
  alertButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  
  alertButtonArrow: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});