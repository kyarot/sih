import { StyleSheet, Switch, Text, TouchableOpacity, View, StatusBar, Platform } from "react-native";
import { Profile } from "./types";
import React from "react";

interface Props {
  profile: Profile;
  isOnline: boolean;
  setIsOnline: (v: boolean) => void;
  onOpenProfile: () => void;
}

export default function PharmacyHeader({ profile, isOnline, setIsOnline, onOpenProfile }: Props) {
  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'white',
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingTop: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
      borderBottomWidth: 1,
      borderBottomColor: '#F1F5F9',
      minHeight: 56,
    },
    headerLeft: {
      flex: 1,
      justifyContent: 'center',
      marginRight: 16,
    },
    welcomeText: {
      fontSize: 12,
      color: '#64748B',
      marginBottom: 2,
      fontWeight: '500',
      letterSpacing: 0.2,
    },
    shopName: {
      fontSize: 16,
      fontWeight: '700',
      color: '#1E40AF',
      letterSpacing: 0.3,
      lineHeight: 20,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F8FAFC',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      minWidth: 90,
      justifyContent: 'space-between',
    },
    statusText: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.3,
      textTransform: 'uppercase',
    },
    onlineStatusText: {
      color: '#1E40AF',
    },
    offlineStatusText: {
      color: '#64748B',
    },
    profileBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#1E40AF',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#1E40AF',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 2,
      borderColor: 'white',
    },
    profileInitials: {
      color: 'white',
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    switchStyle: {
      transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }],
      marginLeft: 6,
    },
  });

  return (
    <>
      {/* Status Bar Configuration for Dynamic Island */}
      <StatusBar 
        barStyle="dark-content"
        backgroundColor="white"
        translucent={false}
      />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text 
            style={styles.shopName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {profile.shopName}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.statusContainer}>
            <Text style={[
              styles.statusText, 
              isOnline ? styles.onlineStatusText : styles.offlineStatusText
            ]}>
              {isOnline ? "Online" : "Offline"}
            </Text>
            <Switch 
              value={isOnline} 
              onValueChange={setIsOnline} 
              trackColor={{ 
                false: "#E2E8F0", 
                true: "#1E40AF" 
              }} 
              thumbColor="white"
              style={styles.switchStyle}
              ios_backgroundColor="#E2E8F0"
            />
          </View>
          <TouchableOpacity 
            style={styles.profileBtn} 
            onPress={onOpenProfile}
            activeOpacity={0.8}
          >
            <Text style={styles.profileInitials}>
              {profile.ownerName.split(" ").map((n) => n[0]).join("").toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}