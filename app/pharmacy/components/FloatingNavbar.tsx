import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface NavItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  count?: number;
  route?: string;
  isCenter?: boolean;
}

interface FloatingNavbarProps {
  activeSection: string;
  setActiveSection: (section: any) => void;
  notificationCount: number;
  orderCount: number;
}

export default function FloatingNavbar({ 
  activeSection, 
  setActiveSection, 
  notificationCount, 
  orderCount 
}: FloatingNavbarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const navItems: NavItem[] = [
    { 
      id: "notifications", 
      icon: "notifications-outline", 
      label: "Notifications",
      count: notificationCount 
    },
    { 
      id: "dashboard", 
      icon: "home-outline", 
      label: "Dashboard",
      isCenter: true 
    },
    { 
      id: "inventory", 
      icon: "medical-outline", 
      label: "Inventory",
      route: "/pharmacy/inventory" 
    },
    { 
      id: "orders", 
      icon: "receipt-outline", 
      label: "Orders",
      count: orderCount 
    },
  ];

  const handlePress = (item: NavItem) => {
    if (item.route) {
      router.push(item.route as any);
    } else {
      setActiveSection(item.id);
    }
  };

  const isActive = (itemId: string) => activeSection === itemId;

  return (
    <View style={[styles.container, { bottom: Math.max(20, insets.bottom + 10) }]}>
      <View style={styles.navbar}>
        {navItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.navButton,
              item.isCenter && styles.centerButton,
              isActive(item.id) && !item.isCenter && styles.activeButton,
            ]}
            onPress={() => handlePress(item)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={item.icon}
                size={item.isCenter ? 30 : 26}
                color={
                  item.isCenter 
                    ? '#FFFFFF' 
                    : isActive(item.id) 
                      ? '#2E4EC6' 
                      : '#64748B'
                }
                style={styles.iconStyle}
              />
              
              {/* Badge for notifications/orders */}
              {item.count !== undefined && item.count > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {item.count > 99 ? '99+' : item.count.toString()}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Label for active non-center items */}
            {isActive(item.id) && !item.isCenter && (
              <Text style={styles.activeLabel}>{item.label}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: 20,
  },
  
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(25px)',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    minWidth: Math.min(340, width - 40),
    height: 72,
  },
  
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    minWidth: 48,
    minHeight: 48,
    paddingHorizontal: 8,
    position: 'relative',
  },
  
  centerButton: {
    backgroundColor: 'rgba(46, 78, 198, 0.95)',
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#2E4EC6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.05 }],
  },
  
  activeButton: {
    backgroundColor: 'rgba(46, 78, 198, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(46, 78, 198, 0.3)',
    shadowColor: '#2E4EC6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    paddingHorizontal: 12,
    minWidth: 60,
  },
  
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },
  
  iconStyle: {
    textAlign: 'center',
    includeFontPadding: false,
  },
  
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
  },
  
  activeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2E4EC6',
    marginTop: 2,
    textAlign: 'center',
  },
});