import { StyleSheet, Switch, Text, TouchableOpacity, View, StatusBar, Platform } from "react-native";
import { Profile } from "./types";
import React from "react";

interface Props {
  profile: Profile;
  isOnline: boolean;
  setIsOnline: (v: boolean) => void;
   toggleSwitch: () => void;
  onOpenProfile: () => void;
}

export default function PharmacyHeader({ profile, isOnline, setIsOnline, toggleSwitch,onOpenProfile }: Props) {
  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'transparent',
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingTop: 16,
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
      minHeight: 56,
    },
    headerLeft: {
      flex: 1,
      justifyContent: 'center',
      marginRight: 16,
    },
    welcomeText: {
      fontSize: 13,
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: 2,
      fontWeight: '500',
      letterSpacing: 0.2,
    },
    shopName: {
      fontSize: 18,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.3,
      lineHeight: 22,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      minWidth: 95,
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      backdropFilter: 'blur(20px)',
    },
    statusText: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.3,
      textTransform: 'uppercase',
    },
    onlineStatusText: {
      color: '#4ECDC4',
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    offlineStatusText: {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    profileBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    profileInitials: {
      color: '#2E4EC6',
      fontSize: 14,
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
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
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
              onValueChange={toggleSwitch} 
              trackColor={{ 
                false: "rgba(255, 255, 255, 0.2)", 
                true: "#4ECDC4" 
              }} 
              thumbColor="white"
              style={styles.switchStyle}
              ios_backgroundColor="rgba(255, 255, 255, 0.2)"
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