import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { Profile } from "./types";

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
      paddingHorizontal: 24,
      paddingVertical: 20,
      paddingTop: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      borderBottomWidth: 1,
      borderBottomColor: '#F1F5F9',
      minHeight: 80,
    },
    headerLeft: {
      flex: 1,
      justifyContent: 'center',
    },
    welcomeText: {
      fontSize: 16,
      color: '#64748B',
      marginBottom: 4,
      fontWeight: '500',
      letterSpacing: 0.3,
    },
    shopName: {
      fontSize: 24,
      fontWeight: '700',
      color: '#1E40AF',
      letterSpacing: 0.5,
      lineHeight: 28,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      // use margin between children instead of gap
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F8FAFC',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      minWidth: 120,
      justifyContent: 'space-between',
      marginRight: 20,
    },
    statusText: {
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    onlineStatusText: {
      color: '#1E40AF',
    },
    offlineStatusText: {
      color: '#64748B',
    },
    profileBtn: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#1E40AF',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#1E40AF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 2,
      borderColor: 'white',
    },
    profileInitials: {
      color: 'white',
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 1,
    },
    switchStyle: {
      transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
      marginLeft: 12,
    },
  });

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.shopName}>{profile.shopName}</Text>
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
  );
}