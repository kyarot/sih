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
      color: "#1E40AF",
      bgColor: "#EFF6FF",
    },
    {
      icon: "list-outline",
      value: pendingOrdersCount,
      label: "Active Orders",
      color: "#1E40AF",
      bgColor: "#EFF6FF",
    },
    {
      icon: "warning-outline",
      value: dashboardMetrics.lowStockItems,
      label: "Low Stock",
      color: "#EF4444",
      bgColor: "#FEF2F2",
    },
    {
      icon: "medical-outline",
      value: dashboardMetrics.totalInventory,
      label: "Total Items",
      color: "#10B981",
      bgColor: "#F0FDF4",
    },
    {
      icon: "cash-outline",
      value: `₹${formatNumber(todayRevenue)}`,
      label: "Today's Revenue",
      color: "#8B5CF6",
      bgColor: "#FAF5FF",
    },
    {
      icon: "cube-outline",
      value: `₹${formatNumber(dashboardMetrics.inventoryValue)}`,
      label: "Inventory Value",
      color: "#F59E0B",
      bgColor: "#FFFBEB",
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
          <Ionicons name="grid-outline" size={24} color="#1E40AF" />
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
                    <Ionicons name="chevron-forward" size={16} color="#64748B" />
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
                <Ionicons name="warning" size={18} color="#EF4444" />
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
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#F1F5F9',
  },
  
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 2,
  },
  
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  
  headerIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  mobileMetricCard: {
    minWidth: '47%',
    padding: 14,
  },
  
  locationCard: {
   
  },
  
  mobileLocationCard: {
    minWidth: '100%',
    padding: 0,
  },
  
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  metricContent: {
    flex: 1,
  },
  
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  
  // Quick Actions
  quickActionsSection: {
    marginBottom: 24,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  
  mobileQuickActionsGrid: {
    flexDirection: 'column',
    gap: 8,
  },
  
  quickActionCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 80,
  },
  
  mobileQuickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    minHeight: 56,
  },
  
  quickActionIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 16,
  },
  
  quickActionArrow: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    backgroundColor: '#1E40AF',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Mobile Quick Action Styles
  mobileQuickActionIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  mobileQuickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginLeft: 12,
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
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 16,
  },
  
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  alertIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  alertContent: {
    flex: 1,
  },
  
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 2,
  },
  
  alertText: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 16,
  },
  
  alertButton: {
    backgroundColor: '#DC2626',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  
  alertButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  
  alertButtonArrow: {
    marginLeft: 2,
  },
});