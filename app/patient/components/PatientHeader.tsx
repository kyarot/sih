import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "../../../components/TranslateProvider"; 

type PatientHeaderProps = {
  name: string | undefined | null;
};

export default function PatientHeader({ name }: PatientHeaderProps) {
  const { t } = useTranslation();

  return (
    <LinearGradient colors={["#1E40AF", "#1E40AF"]} style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Text style={styles.welcomeText}>{t("welcome_back")}</Text>
          <View style={styles.nameContainer}>
            <Text style={styles.nameText}>{name ?? t("loading")}</Text>
            
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} activeOpacity={0.8}>
            <View style={styles.iconContainer}>
              <Ionicons name="notifications" size={20} color="#1E40AF" />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerIcon} activeOpacity={0.8}>
            <View style={styles.iconContainer}>
              <Ionicons name="settings" size={20} color="#1E40AF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileContainer} activeOpacity={0.8}>
            <View style={styles.profileIconContainer}>
              <Ionicons name="person" size={24} color="#1E40AF" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
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
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  nameText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginRight: 8,
  },
  waveIcon: {
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIcon: {
    position: "relative",
  },
  iconContainer: {
    width: 42,
    height: 42,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  notificationBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#EF4444",
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 12,
  },
  profileContainer: {
    marginLeft: 4,
  },
  profileIconContainer: {
    width: 42,
    height: 42,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});