import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type PatientHeaderProps = {
  name: string | undefined | null;
};

export default function PatientHeader({ name }: PatientHeaderProps) {
  return (
    <LinearGradient colors={["#1E40AF", "#1E40AF"]} style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.nameText}>{name ?? "Loading..."} 👋</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <View style={styles.iconContainer}>
              <Ionicons name="notifications-outline" size={22} color="#1E40AF" />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerIcon}>
            <View style={styles.iconContainer}>
              <Ionicons name="settings-outline" size={22} color="#1E40AF" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.profileContainer}>
            <Image source={{ uri: "https://via.placeholder.com/40x40/1565C0/ffffff?text=P" }} style={styles.profilePic} />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  nameText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 6,
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginRight: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  profileContainer: {
    marginLeft: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  profilePic: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
});