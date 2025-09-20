import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { ActiveSection } from "./types";
import React from "react";

interface NavItem {
  id: string;
  label: string;
  icon: string;
  count: number | null;
}

interface Props {
  activeSection: ActiveSection;
  setActiveSection: (s: ActiveSection) => void;
  navItems: NavItem[];
}

export default function SidebarNav({ activeSection, setActiveSection, navItems }: Props) {
  const styles = StyleSheet.create({
    sidebar: {
      backgroundColor: 'white',
      paddingVertical: 24,
      paddingHorizontal: 16,
      borderRightWidth: 1,
      borderRightColor: '#E5E7EB',
      // minHeight removed; rely on parent layout
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    sidebarTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#1E40AF',
      marginBottom: 32,
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    navItem: {
      marginBottom: 8,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: 'transparent',
      // transition not supported in React Native
    },
    activeNavItem: {
      backgroundColor: '#1E40AF',
      shadowColor: '#1E40AF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 6,
    },
    navItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      minHeight: 56,
    },
    navIcon: {
      marginRight: 16,
      width: 24,
      textAlign: 'center',
    },
    navTextContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    navLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: '#374151',
      letterSpacing: 0.3,
    },
    activeNavLabel: {
      color: 'white',
      fontWeight: '600',
    },
    navCount: {
      backgroundColor: '#F3F4F6',
      color: '#6B7280',
      fontSize: 12,
      fontWeight: '600',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      minWidth: 24,
      textAlign: 'center',
      overflow: 'hidden',
    },
    notificationCount: {
      backgroundColor: '#EF4444',
      color: 'white',
    },
    activeNavCount: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
    },
    activeNotificationCount: {
      backgroundColor: 'white',
      color: '#EF4444',
    },
    rippleEffect: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(30, 64, 175, 0.1)',
      opacity: 0,
    },
  });

  return (
    <View style={styles.sidebar}>
      <Text style={styles.sidebarTitle}>Navigation</Text>
      {navItems.map((item) => {
        const isActive = activeSection === (item.id as ActiveSection);
        const isNotification = item.id === "notifications";
        const hasCount = item.count !== null && item.count > 0;
        
        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.navItem,
              isActive && styles.activeNavItem
            ]}
            onPress={() => setActiveSection(item.id as ActiveSection)}
            activeOpacity={0.8}
          >
            <View style={styles.navItemContent}>
              <View style={styles.navIcon}>
                <MaterialIcons 
                  name={item.icon as any} 
                  size={20} 
                  color={isActive ? 'white' : '#6B7280'}
                />
              </View>
              <View style={styles.navTextContainer}>
                <Text style={[
                  styles.navLabel,
                  isActive && styles.activeNavLabel
                ]}>
                  {item.label}
                </Text>
                {hasCount && (
                  <Text style={[
                    styles.navCount,
                    isNotification && styles.notificationCount,
                    isActive && styles.activeNavCount,
                    isActive && isNotification && styles.activeNotificationCount
                  ]}>
                    {item.count}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}