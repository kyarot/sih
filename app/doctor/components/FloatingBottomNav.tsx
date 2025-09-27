import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface NavItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  route: string;
  label: string;
}

const FloatingBottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      id: 'appointments',
      icon: 'calendar',
      activeIcon: 'calendar',
      route: '/doctor/appointments',
      label: 'Appointments'
    },
    {
      id: 'home',
      icon: 'home-outline',
      activeIcon: 'home',
      route: '/doctor',
      label: 'Home'
    },
    {
      id: 'activity',
      icon: 'pulse-outline',
      activeIcon: 'pulse',
      route: '/doctor/activity',
      label: 'Activity'
    },
    {
      id: 'patients',
      icon: 'people-outline',
      activeIcon: 'people',
      route: '/doctor/patient-details',
      label: 'Patients'
    }
  ];

  const isActive = (route: string): boolean => {
    if (route === '/doctor' && (pathname === '/doctor' || pathname === '/doctor/')) {
      return true;
    }
    return pathname === route;
  };

  const handlePress = (route: string): void => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navWrapper}>
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          style={styles.navContainer}
        >
          {navItems.map((item) => {
            const active = isActive(item.route);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.navItem}
                onPress={() => handlePress(item.route)}
                activeOpacity={0.7}
              >
                {active ? (
                  <LinearGradient
                    colors={['#1E40AF', '#3B82F6']}
                    style={styles.activeButton}
                  >
                    <Ionicons 
                      name={item.activeIcon} 
                      size={24} 
                      color="#FFFFFF" 
                    />
                  </LinearGradient>
                ) : (
                  <View style={styles.inactiveButton}>
                    <Ionicons 
                      name={item.icon} 
                      size={24} 
                      color="#64748B" 
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 34, // Safe area for iPhone
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 1000,
  },
  navWrapper: {
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E40AF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  inactiveButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FloatingBottomNav;